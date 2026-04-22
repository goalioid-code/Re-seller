const express = require('express');
const router = express.Router();
const { 
  googleAuth, 
  getMe, 
  requestWhatsAppOTP, 
  verifyWhatsAppOTP 
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// POST /auth/google — Login/daftar via Google
router.post('/google', googleAuth);

// WhatsApp OTP
router.post('/whatsapp/request', requestWhatsAppOTP);
router.post('/whatsapp/verify', verifyWhatsAppOTP);

// GET /auth/me — Ambil data reseller yang sedang login (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
