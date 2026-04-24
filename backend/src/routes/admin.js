const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getPendingResellers,
  getAllResellers,
  getResellerDetail,
  approveReseller,
  rejectReseller,
  deactivateReseller,
  reactivateReseller,
  deleteReseller,
  updateResellerTier,
} = require('../controllers/adminController');

// ============================================================
// ADMIN ROUTES
// Endpoints untuk admin management & approval
// ============================================================

/**
 * POST /admin/auth/login
 * Admin login (development: tidak perlu password)
 * 
 * Request body:
 * {
 *   "email": "admin@calsub.com",
 *   "password": "optional-dev"
 * }
 */
router.post('/auth/login', adminLogin);

/**
 * GET /admin/resellers/pending
 * Daftar reseller yang menunggu approval
 * Development only endpoint
 */
router.get('/resellers/pending', getPendingResellers);

/**
 * GET /admin/resellers
 * Daftar semua reseller dengan filter
 * 
 * Query params:
 * - status: pending, active, inactive
 * - page: halaman (default 1)
 * - limit: jumlah per halaman (default 20)
 */
router.get('/resellers', getAllResellers);

/**
 * GET /admin/resellers/:id
 * Detail reseller (dengan riwayat komisi, order, poin)
 */
router.get('/resellers/:id', getResellerDetail);

/**
 * PUT /admin/resellers/:id/approve
 * Approve reseller dari pending menjadi active
 * 
 * Request body:
 * {
 *   "notes": "Approval notes (optional)"
 * }
 */
router.put('/resellers/:id/approve', approveReseller);

/**
 * PUT /admin/resellers/:id/reject
 * Reject reseller dari pending menjadi inactive
 * 
 * Request body:
 * {
 *   "reason": "Alasan penolakan (optional)"
 * }
 */
router.put('/resellers/:id/reject', rejectReseller);

/**
 * PUT /admin/resellers/:id/deactivate
 * Nonaktifkan reseller active menjadi inactive
 */
router.put('/resellers/:id/deactivate', deactivateReseller);

/**
 * PUT /admin/resellers/:id/reactivate
 * Aktifkan kembali reseller inactive menjadi active
 */
router.put('/resellers/:id/reactivate', reactivateReseller);

/**
 * DELETE /admin/resellers/:id
 * Hapus reseller jika tidak punya transaksi terkait
 */
router.delete('/resellers/:id', deleteReseller);

/**
 * PUT /admin/resellers/:id/tier
 * Update tier komisi reseller
 * 
 * Request body:
 * {
 *   "tier_id": "uuid-of-tier"
 * }
 */
router.put('/resellers/:id/tier', updateResellerTier);

module.exports = router;
