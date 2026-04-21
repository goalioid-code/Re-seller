const express = require('express');
const router = express.Router();
const { googleAuth, getMe } = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// POST /auth/google — Login/daftar via Google
router.post('/google', googleAuth);

// GET /auth/me — Ambil data reseller yang sedang login (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
