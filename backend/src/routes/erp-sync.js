const express = require('express');
const router = express.Router();
const {
  getERPOrders,
  getERPWorkOrders,
  getERPProductionStatus,
  getERPProductionStages,
  syncERPToDatabase,
} = require('../controllers/erpController');

// ============================================================
// ERP SYNC ROUTES
// Endpoints untuk sinkronisasi data dari ERP (atau mock ERP)
// Tidak butuh authentication untuk development
// ============================================================

/**
 * GET /erp-sync/orders
 * Dapatkan daftar orders dari ERP
 * 
 * Query params:
 * - status: filter by status (processing, design, layout, etc)
 * - customer_name: filter by customer name
 * 
 * Response:
 * {
 *   "success": true,
 *   "source": "mock" (dalam development),
 *   "orders": [...],
 *   "total": 3
 * }
 */
router.get('/orders', getERPOrders);

/**
 * GET /erp-sync/work-orders
 * Dapatkan daftar lembar kerja (work orders) dari ERP
 */
router.get('/work-orders', getERPWorkOrders);

/**
 * GET /erp-sync/production-stages
 * Dapatkan daftar tahapan produksi (8 tahap)
 */
router.get('/production-stages', getERPProductionStages);

/**
 * GET /erp-sync/production-status/:order_id
 * Dapatkan status produksi untuk order tertentu
 */
router.get('/production-status/:order_id', getERPProductionStatus);

/**
 * POST /erp-sync/sync-to-db
 * Sinkronisasi data ERP ke database lokal
 * Development only - untuk populate ProductionStage dan data lainnya
 * 
 * Query params:
 * - type: 'all' (default), 'stages'
 */
router.post('/sync-to-db', syncERPToDatabase);

module.exports = router;
