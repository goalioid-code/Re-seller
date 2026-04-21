const prisma = require('../lib/prisma');

/**
 * POST /payments/initiate
 * Inisiasi pembayaran DP Desain atau DP Produksi
 */
const initiatePayment = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const {
      order_id,
      payment_type, // dp_design | dp_production | full_payment
    } = req.body;

    if (!order_id || !payment_type) {
      return res.status(400).json({
        success: false,
        message: 'Order ID dan payment type wajib diisi.',
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { payments: true },
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

    // Tentukan amount berdasarkan payment_type
    let requiredAmount = 0;
    if (payment_type === 'dp_design') {
      requiredAmount = Math.max(100000, order.total_amount * 0.1); // Min 100k atau 10%
    } else if (payment_type === 'dp_production') {
      requiredAmount = order.total_amount * 0.5; // 50% dari total
    } else if (payment_type === 'full_payment') {
      requiredAmount = order.total_amount;
    }

    // Cek apakah sudah ada pembayaran untuk tipe ini
    const existingPayment = await prisma.orderPayment.findFirst({
      where: {
        order_id,
        payment_type,
        status: 'completed',
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: `${payment_type} sudah terbayar.`,
      });
    }

    // Buat payment record
    const payment = await prisma.orderPayment.create({
      data: {
        order_id,
        payment_type,
        amount: requiredAmount,
        required_amount: requiredAmount,
        status: 'pending',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil dibuat. Pilih metode pembayaran.',
      payment,
    });
  } catch (error) {
    console.error('[Payment] Initiate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pembayaran.',
    });
  }
};

/**
 * GET /payments/:id
 * Mendapatkan detail pembayaran
 */
const getPayment = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { id } = req.params;

    const payment = await prisma.orderPayment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan.',
      });
    }

    if (payment.order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('[Payment] Get error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail pembayaran.',
    });
  }
};

/**
 * POST /payments/:id/confirm
 * Konfirmasi pembayaran manual (upload bukti)
 */
const confirmPaymentManual = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { id } = req.params;
    const { proof_url } = req.body;

    const payment = await prisma.orderPayment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pembayaran tidak ditemukan.',
      });
    }

    if (payment.order.reseller_id !== resellerId) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    const updatedPayment = await prisma.orderPayment.update({
      where: { id },
      data: {
        proof_url,
        status: 'pending', // Menunggu admin konfirmasi
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Bukti pembayaran berhasil diupload. Menunggu konfirmasi admin.',
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('[Payment] Confirm manual error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupload bukti pembayaran.',
    });
  }
};

/**
 * GET /payments/order/:order_id
 * Mendapatkan daftar pembayaran untuk order tertentu
 */
const getPaymentsByOrder = async (req, res) => {
  try {
    const resellerId = req.reseller.id;
    const { order_id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: order_id },
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

    const payments = await prisma.orderPayment.findMany({
      where: { order_id },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('[Payment] Get by order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar pembayaran.',
    });
  }
};

module.exports = {
  initiatePayment,
  getPayment,
  confirmPaymentManual,
  getPaymentsByOrder,
};
