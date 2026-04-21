const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /orders
 * Membuat order baru
 */
const createOrder = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const {
      order_type,
      customer_name,
      brand_name,
      order_date,
      due_date,
      description,
      notes,
      items,
    } = req.body;

    if (!order_type || !customer_name || !brand_name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data order tidak lengkap.',
      });
    }

    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Hitung total
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;
      return {
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        collar_type: item.collar_type || null,
        pattern: item.pattern || null,
        fabric_type: item.fabric_type || null,
        additional_attrs: item.additional_attrs || null,
        subtotal: itemTotal,
      };
    });

    const discount = req.body.discount || 0;
    const totalAmount = subtotal - discount;

    // Buat order
    const order = await prisma.order.create({
      data: {
        reseller_id: resellerId,
        po_number: poNumber,
        order_type,
        customer_name,
        brand_name,
        order_date: new Date(order_date),
        due_date: new Date(due_date),
        description: description || null,
        notes: notes || null,
        subtotal,
        discount,
        total_amount: totalAmount,
        status: 'draft',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        payments: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order berhasil dibuat.',
      order,
    });
  } catch (error) {
    console.error('[Order] Create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat order.',
    });
  }
};

/**
 * GET /orders
 * Mendapatkan daftar order reseller
 */
const getOrders = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { reseller_id: resellerId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payments: true,
        work_order: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.order.count({ where });

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Order] Get list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar order.',
    });
  }
};

/**
 * GET /orders/:id
 * Mendapatkan detail order
 */
const getOrderDetail = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        work_order: true,
        production_statuses: {
          include: { stage: true },
          orderBy: { stage: { order_index: 'asc' } },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
      });
    }

    // Validasi akses
    if (order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('[Order] Get detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail order.',
    });
  }
};

/**
 * PUT /orders/:id
 * Update order (upload desain, mockup, atau detail fix)
 */
const updateOrder = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { id } = req.params;
    const {
      design_file_url,
      mockup_file_url,
      lk_approved,
      status,
    } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
      });
    }

    if (order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    const updateData = {};
    if (design_file_url !== undefined) updateData.design_file_url = design_file_url;
    if (mockup_file_url !== undefined) updateData.mockup_file_url = mockup_file_url;
    if (lk_approved !== undefined) updateData.lk_approved = lk_approved;
    if (status !== undefined) updateData.status = status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        payments: true,
        work_order: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order berhasil diperbarui.',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('[Order] Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate order.',
    });
  }
};

/**
 * DELETE /orders/:id
 * Batalkan order (hanya jika belum diapprove LK)
 */
const cancelOrder = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { work_order: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
      });
    }

    if (order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    // Hanya bisa batalkan jika belum approve LK
    if (order.lk_approved) {
      return res.status(400).json({
        success: false,
        message: 'Order tidak bisa dibatalkan setelah LK diapprove.',
      });
    }

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order berhasil dibatalkan.',
      order: cancelledOrder,
    });
  } catch (error) {
    console.error('[Order] Cancel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membatalkan order.',
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail,
  updateOrder,
  cancelOrder,
};
