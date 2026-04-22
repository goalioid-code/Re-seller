const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
  initiatePayment,
  getPayment,
  confirmPaymentManual,
  getPaymentsByOrder,
  getAllPayments,
  handleMidtransWebhook,
} = require('../controllers/paymentController');

// Webhook — Tidak butuh authMiddleware (dipanggil oleh Midtrans)
router.post('/webhook', handleMidtransWebhook);

// Semua route payment lainnya butuh JWT
router.use(authMiddleware);

// GET /payments — Semua riwayat pembayaran
router.get('/', getAllPayments);

// POST /payments/initiate — Inisiasi pembayaran
router.post('/initiate', initiatePayment);

// GET /payments/:id — Detail pembayaran
router.get('/:id', getPayment);

// POST /payments/:id/confirm — Konfirmasi pembayaran manual
router.post('/:id/confirm', confirmPaymentManual);

// GET /payments/order/:order_id — Daftar pembayaran per order
router.get('/order/:order_id', getPaymentsByOrder);

module.exports = router;
