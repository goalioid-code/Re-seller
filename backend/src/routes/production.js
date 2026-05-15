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

// Path statis dulu (jangan setelah `/:order_id` agar tidak tertelan sebagai id order)
router.get('/work-orders/:order_id', getWorkOrder);
router.put('/work-orders/:order_id/approve', approveWorkOrder);
router.get('/orders/:order_id/latest-production', getLatestProductionUpdate);

// GET /production/:order_id — Status produksi lengkap (satu segmen = order id)
router.get('/:order_id', getProductionStatus);

module.exports = router;
