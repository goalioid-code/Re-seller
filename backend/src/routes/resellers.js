const express = require('express');
const router = express.Router();
const { updateProfile, getDashboard, changePassword, setDevStatus } = require('../controllers/resellerController');
const authMiddleware = require('../middlewares/auth');

// Semua route reseller butuh JWT
router.use(authMiddleware);

// PUT /resellers/profile — Update profil
router.put('/profile', updateProfile);

// POST /resellers/change-password — Ubah password
router.post('/change-password', changePassword);

// GET /resellers/dashboard — Data dashboard
router.get('/dashboard', getDashboard);

// PATCH /resellers/dev/status — Dev helper untuk simulasi status pending/active
router.patch('/dev/status', setDevStatus);

module.exports = router;
