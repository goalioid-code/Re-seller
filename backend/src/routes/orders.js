const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const {
  createOrder,
  getOrders,
  getOrderDetail,
  updateOrder,
  cancelOrder,
} = require('../controllers/orderController');

// Semua route order butuh JWT
router.use(authMiddleware);

// POST /orders — Buat order baru
router.post('/', createOrder);

// GET /orders — Daftar order
router.get('/', getOrders);

// GET /orders/:id — Detail order
router.get('/:id', getOrderDetail);

// PUT /orders/:id — Update order
router.put('/:id', updateOrder);

// DELETE /orders/:id — Batalkan order
router.delete('/:id', cancelOrder);

module.exports = router;
