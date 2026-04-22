const express = require('express');
const router = express.Router();
const { devLogin, devRegister, devListUsers } = require('../controllers/authController');

// ============================================================
// DEVELOPMENT ONLY ROUTES
// Endpoints untuk testing tanpa Google OAuth
// Hanya aktif jika NODE_ENV = 'development'
// ============================================================

/**
 * POST /dev-auth/login
 * Login dengan email tanpa Google OAuth
 * 
 * Request body:
 * {
 *   "email": "dev@test.com",
 *   "name": "Dev User",
 *   "onboarding_data": null
 * }
 */
router.post('/login', devLogin);

/**
 * POST /dev-auth/register
 * Registrasi akun development baru
 * 
 * Request body:
 * {
 *   "email": "newdev@test.com",
 *   "name": "New Dev User",
 *   "phone": "08123456789",
 *   "address": "Dev Address",
 *   "onboarding_data": null
 * }
 */
router.post('/register', devRegister);

/**
 * GET /dev-auth/users
 * List semua development users (untuk debugging)
 */
router.get('/users', devListUsers);

module.exports = router;
