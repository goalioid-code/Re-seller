require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const devAuthRoutes = require('./routes/dev-auth');
const adminRoutes = require('./routes/admin');
const resellerRoutes = require('./routes/resellers');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const productionRoutes = require('./routes/production');
const erpSyncRoutes = require('./routes/erp-sync');
const uploadRoutes = require('./routes/uploads');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// Middleware Global
// ============================================================
app.use(cors({
  origin: '*', // Di production, ganti dengan domain spesifik
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Routes
// ============================================================
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes); // Admin management endpoints
app.use('/erp-sync', erpSyncRoutes); // ERP sync endpoints (no auth needed for testing)

// Development only routes
if (process.env.NODE_ENV === 'development') {
  app.use('/dev-auth', devAuthRoutes);
  console.log('[Server] ℹ️  Dev auth routes aktif (NODE_ENV=development)');
}

app.use('/resellers', resellerRoutes);
app.use('/orders', orderRoutes);
app.use('/payments', paymentRoutes);
app.use('/production', productionRoutes);
app.use('/uploads', uploadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 CALSUB Reseller API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.',
  });
});

// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🚀 CALSUB Reseller API              ║
  ║   Running on http://localhost:${PORT}   ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
