const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');
const { snap } = require('../lib/midtrans');

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
      include: { 
        payments: true,
        reseller: true 
      },
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
      requiredAmount = 100000; // Flat Rp 100k
    } else if (payment_type === 'dp_production') {
      // Perhitungan 50% potong DP Desain jika sudah dibayar
      const dpDesignPaid = order.payments.some(p => p.payment_type === 'dp_design' && p.status === 'completed');
      const baseDP = order.total_amount * 0.5;
      requiredAmount = dpDesignPaid ? baseDP - 100000 : baseDP;
    } else if (payment_type === 'full_payment') {
      // Potong semua DP yang sudah dibayar
      const totalPaid = order.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      requiredAmount = order.total_amount - totalPaid;
    }

    // Cek apakah sudah ada pembayaran untuk tipe ini yang sukses
    const existingPayment = order.payments.find(p => p.payment_type === payment_type && p.status === 'completed');

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: `${payment_type} sudah terbayar.`,
      });
    }

    // Buat transaction ID unik untuk Midtrans
    const midtransOrderId = `PAY-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Buat payment record
    const payment = await prisma.orderPayment.create({
      data: {
        order_id,
        payment_type,
        amount: requiredAmount,
        required_amount: requiredAmount,
        midtrans_order_id: midtransOrderId,
        status: 'pending',
      },
    });

    if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
      return res.status(503).json({
        success: false,
        message: 'Pembayaran belum dikonfigurasi: isi MIDTRANS_SERVER_KEY & MIDTRANS_CLIENT_KEY di .env',
      });
    }

    // Midtrans minta jumlah bulat; phone tidak boleh null untuk beberapa metode
    const gross = Math.round(Number(requiredAmount)) || 0;
    if (gross < 1) {
      return res.status(400).json({
        success: false,
        message: 'Nilai pembayaran tidak valid.',
      });
    }

    const firstName = (order.reseller.name && String(order.reseller.name).trim().slice(0, 50)) || 'Reseller';
    const phone = String(order.reseller.phone || '08100000000').replace(/\D/g, '').slice(0, 15) || '08100000000';

    // Generate Midtrans Snap Token
    const transactionDetails = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: gross,
      },
      customer_details: {
        first_name: firstName,
        email: order.reseller.email || 'noreply@local.invalid',
        phone,
      },
      item_details: [
        {
          id: payment_type,
          price: gross,
          quantity: 1,
          name: `Pembayaran ${payment_type.replace('_', ' ').toUpperCase()} - ${order.po_number}`.slice(0, 50),
        },
      ],
    };

    const snapResponse = await snap.createTransaction(transactionDetails);
    const tokenSnap = snapResponse?.token;
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const snapBase = isProd
      ? 'https://app.midtrans.com/snap/v2/vtweb'
      : 'https://app.sandbox.midtrans.com/snap/v2/vtweb';
    const redirect =
      snapResponse?.redirect_url ||
      snapResponse?.redirectUrl ||
      (tokenSnap ? `${snapBase}/${tokenSnap}` : null);
    if (!redirect) {
      return res.status(502).json({
        success: false,
        message: 'Respons Midtrans tidak berisi token/URL redirect.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pembayaran berhasil diinisiasi.',
      payment: {
        ...payment,
        snap_token: snapResponse.token,
        snap_redirect_url: redirect,
      },
    });
  } catch (error) {
    const msg =
      (error && error.message) ||
      (error && error.ApiResponse) ||
      String(error);
    console.error('[Payment] Initiate error:', error);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'development'
          ? `Midtrans: ${msg}`
          : 'Terjadi kesalahan saat membuat pembayaran. Periksa kunci Midtrans dan jaringan.',
    });
  }
};

/**
 * POST /payments/webhook
 * Handler untuk notifikasi dari Midtrans
 */
const handleMidtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    
    // Validasi signature (Opsional tapi direkomendasikan)
    // Untuk simplifikasi di dev, kita langsung proses status

    const {
      order_id: midtransOrderId,
      transaction_status,
      payment_type,
      fraud_status,
    } = notification;

    console.log(`[Midtrans Webhook] Received: ${midtransOrderId} - ${transaction_status}`);

    let status = 'pending';
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'challenge') {
        status = 'pending';
      } else {
        status = 'completed';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      status = 'failed';
    } else if (transaction_status === 'pending') {
      status = 'pending';
    }

    // Update payment record
    const payment = await prisma.orderPayment.findFirst({
      where: { midtrans_order_id: midtransOrderId },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const updatedPayment = await prisma.orderPayment.update({
      where: { id: payment.id },
      data: {
        status,
        payment_method: payment_type,
        completed_at: status === 'completed' ? new Date() : null,
      },
    });

    // Jika pembayaran selesai, update status order jika perlu
    if (status === 'completed') {
      // Contoh: Jika DP Desain selesai, status order pindah ke 'processing' atau 'design'
      if (payment.payment_type === 'dp_design') {
        await prisma.order.update({
          where: { id: payment.order_id },
          data: { status: 'design' },
        });
      } else if (payment.payment_type === 'dp_production') {
        await prisma.order.update({
          where: { id: payment.order_id },
          data: { status: 'production' },
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Payment Webhook] Error:', error);
    return res.status(500).json({ success: false });
  }
};

/**
 * GET /payments
 * Mendapatkan semua riwayat pembayaran reseller
 */
const getAllPayments = async (req, res) => {
  try {
    const resellerId = req.reseller.id;

    const payments = await prisma.orderPayment.findMany({
      where: {
        order: {
          reseller_id: resellerId
        }
      },
      include: {
        order: {
          select: {
            po_number: true,
            customer_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('[Payment] Get all error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil riwayat pembayaran.'
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
  getAllPayments,
  handleMidtransWebhook,
};
