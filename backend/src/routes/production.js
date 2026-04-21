const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
  getProductionStatus,
  getWorkOrder,
  approveWorkOrder,
  getLatestProductionUpdate,
} = require('../controllers/productionController');

// Semua route production butuh JWT
router.use(authMiddleware);

// GET /production/:order_id — Status produksi lengkap
router.get('/:order_id', getProductionStatus);

// GET /work-orders/:order_id — Lembar kerja
router.get('/work-orders/:order_id', getWorkOrder);

// PUT /work-orders/:order_id/approve — Approve lembar kerja
router.put('/work-orders/:order_id/approve', approveWorkOrder);

// GET /orders/:order_id/latest-production — Update produksi terbaru
router.get('/orders/:order_id/latest-production', getLatestProductionUpdate);

module.exports = router;
