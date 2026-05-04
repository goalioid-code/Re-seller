const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middlewares/adminAuth');
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
  updateProductionStage,
} = require('../controllers/adminController');
const {
  getAdminDashboard,
  listProductionStagesAdmin,
  listAdminOrders,
  getAdminOrderDetail,
  patchOrderInternalNotes,
  listPendingPaymentsAdmin,
  confirmPaymentAdmin,
  rejectPaymentAdmin,
  listWithdrawalsAdmin,
  approveWithdrawalAdmin,
  rejectWithdrawalAdmin,
  listCommissionTiersAdmin,
  updateCommissionTierAdmin,
  listRewardsAdmin,
  createRewardAdmin,
  updateRewardAdmin,
  deleteRewardAdmin,
  listRewardRedemptionsAdmin,
  approveRedemptionAdmin,
  rejectRedemptionAdmin,
  reportOrdersCsv,
  reportResellersCsv,
  reportFinancialCsv,
  reportOrdersJson,
  reportResellersJson,
  reportFinancialJson,
  getSystemConfig,
  patchSystemConfig,
  getResellerPerformanceAdmin,
} = require('../controllers/adminOpsController');

router.post('/auth/login', adminLogin);

router.use(adminAuthMiddleware);

router.get('/dashboard', getAdminDashboard);

router.get('/resellers/pending', getPendingResellers);
router.get('/resellers', getAllResellers);
router.get('/resellers/:id', getResellerDetail);
router.get('/resellers/:id/performance', getResellerPerformanceAdmin);
router.put('/resellers/:id/approve', approveReseller);
router.put('/resellers/:id/reject', rejectReseller);
router.put('/resellers/:id/deactivate', deactivateReseller);
router.put('/resellers/:id/reactivate', reactivateReseller);
router.delete('/resellers/:id', deleteReseller);
router.put('/resellers/:id/tier', updateResellerTier);

router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/internal-notes', patchOrderInternalNotes);

router.get('/production/stages', listProductionStagesAdmin);
router.patch('/production/:order_id/stages/:stage_id', updateProductionStage);

router.get('/payments/pending', listPendingPaymentsAdmin);
router.post('/payments/:id/confirm', confirmPaymentAdmin);
router.post('/payments/:id/reject', rejectPaymentAdmin);

router.get('/withdrawals', listWithdrawalsAdmin);
router.post('/withdrawals/:id/approve', approveWithdrawalAdmin);
router.post('/withdrawals/:id/reject', rejectWithdrawalAdmin);

router.get('/tiers', listCommissionTiersAdmin);
router.patch('/tiers/:id', updateCommissionTierAdmin);

router.get('/rewards', listRewardsAdmin);
router.post('/rewards', createRewardAdmin);
router.patch('/rewards/:id', updateRewardAdmin);
router.delete('/rewards/:id', deleteRewardAdmin);

router.get('/reward-redemptions', listRewardRedemptionsAdmin);
router.post('/reward-redemptions/:id/approve', approveRedemptionAdmin);
router.post('/reward-redemptions/:id/reject', rejectRedemptionAdmin);

router.get('/reports/dashboard', getAdminDashboard);
router.get('/reports/orders', (req, res) => {
  if (req.query.format === 'csv') return reportOrdersCsv(req, res);
  return reportOrdersJson(req, res);
});
router.get('/reports/resellers', (req, res) => {
  if (req.query.format === 'csv') return reportResellersCsv(req, res);
  return reportResellersJson(req, res);
});
router.get('/reports/financial', (req, res) => {
  if (req.query.format === 'csv') return reportFinancialCsv(req, res);
  return reportFinancialJson(req, res);
});

router.get('/settings', getSystemConfig);
router.patch('/settings', patchSystemConfig);

module.exports = router;
