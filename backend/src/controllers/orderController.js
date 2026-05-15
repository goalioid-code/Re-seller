const prisma = require('../lib/prisma');

/** Kolom order yang ada di migrasi awal (tanpa `internal_notes`). */
const orderBaseScalarSelect = {
  id: true,
  reseller_id: true,
  po_number: true,
  order_type: true,
  customer_name: true,
  brand_name: true,
  order_date: true,
  due_date: true,
  description: true,
  notes: true,
  subtotal: true,
  discount: true,
  total_amount: true,
  status: true,
  lk_approved: true,
  design_file_url: true,
  mockup_file_url: true,
  created_at: true,
  updated_at: true,
};

const orderItemSelect = {
  id: true,
  order_id: true,
  product_name: true,
  quantity: true,
  unit_price: true,
  collar_type: true,
  pattern: true,
  fabric_type: true,
  additional_attrs: true,
  subtotal: true,
  created_at: true,
};

/** Tanpa `admin_notes` bila kolom belum ada di DB. */
const orderPaymentSelect = {
  id: true,
  order_id: true,
  payment_type: true,
  amount: true,
  required_amount: true,
  midtrans_order_id: true,
  midtrans_transaction_id: true,
  payment_method: true,
  status: true,
  proof_url: true,
  created_at: true,
  completed_at: true,
};

const workOrderSelect = {
  id: true,
  order_id: true,
  lk_number: true,
  size_run: true,
  back_name: true,
  back_number: true,
  additional_details: true,
  status: true,
  approved_at: true,
  approved_by_reseller: true,
  created_at: true,
  updated_at: true,
};

const productionStatusSelect = {
  id: true,
  order_id: true,
  stage_id: true,
  status: true,
  started_at: true,
  completed_at: true,
  duration_minutes: true,
  notes: true,
  created_at: true,
  updated_at: true,
  stage: {
    select: {
      id: true,
      name: true,
      order_index: true,
      description: true,
      created_at: true,
    },
  },
};

const orderCreateSelect = {
  ...orderBaseScalarSelect,
  items: { select: orderItemSelect },
  payments: { select: orderPaymentSelect },
};

const orderListSelect = {
  ...orderBaseScalarSelect,
  items: { select: orderItemSelect },
  payments: { select: orderPaymentSelect },
  work_order: { select: workOrderSelect },
};

const orderDetailSelect = {
  ...orderListSelect,
  production_statuses: {
    orderBy: { stage: { order_index: 'asc' } },
    select: productionStatusSelect,
  },
};

/** Untuk POST /payments/initiate — butuh total, PO, payments, reseller (Midtrans). */
const orderInitiatePaymentSelect = {
  ...orderBaseScalarSelect,
  payments: { select: orderPaymentSelect },
  reseller: {
    select: {
      name: true,
      phone: true,
      email: true,
    },
  },
};

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
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // Hitung total — pastikan angka valid (hindari NaN ke Prisma)
    let subtotal = 0;
    const orderItems = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const qty = Number.parseInt(String(item.quantity), 10);
      const unitPrice = Number.parseFloat(String(item.unit_price));
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: `Item #${i + 1}: quantity harus berupa angka bulat positif.`,
        });
      }
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: `Item #${i + 1}: harga satuan tidak valid.`,
        });
      }
      const productName = String(item.product_name || '').trim();
      if (!productName) {
        return res.status(400).json({
          success: false,
          message: `Item #${i + 1}: nama produk wajib diisi.`,
        });
      }
      const itemTotal = Math.round(qty * unitPrice * 100) / 100;
      subtotal += itemTotal;
      orderItems.push({
        product_name: productName,
        quantity: qty,
        unit_price: unitPrice,
        collar_type: item.collar_type || null,
        pattern: item.pattern || null,
        fabric_type: item.fabric_type || null,
        additional_attrs: item.additional_attrs || null,
        subtotal: itemTotal,
      });
    }

    const discount = Number(req.body.discount) || 0;
    const totalAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

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
      select: orderCreateSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Order berhasil dibuat.',
      order,
    });
  } catch (error) {
    console.error('[Order] Create error:', error);
    const devHint =
      process.env.NODE_ENV === 'development' && error?.message
        ? ` (${error.message})`
        : '';
    return res.status(500).json({
      success: false,
      message: `Terjadi kesalahan saat membuat order.${devHint}`,
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
      select: orderListSelect,
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

    const order = await prisma.order.findFirst({
      where: { id, reseller_id: resellerId },
      select: orderDetailSelect,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
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

    const order = await prisma.order.findFirst({
      where: { id, reseller_id: resellerId },
      select: { id: true, reseller_id: true, lk_approved: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
      });
    }

    if (status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Status selesai ditetapkan otomatis setelah tahapan produksi selesai.',
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
      select: orderListSelect,
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

    const order = await prisma.order.findFirst({
      where: { id, reseller_id: resellerId },
      select: { id: true, lk_approved: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
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
      select: orderBaseScalarSelect,
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
  orderBaseScalarSelect,
  orderPaymentSelect,
  orderDetailSelect,
  orderInitiatePaymentSelect,
};
