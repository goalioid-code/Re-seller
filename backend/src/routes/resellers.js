const express = require('express');
const router = express.Router();
const { updateProfile, getDashboard, changePassword, setDevStatus } = require('../controllers/resellerController');
const {
  getCommissionSummary,
  getCommissionHistory,
  requestCommissionWithdrawal,
  listCommissionWithdrawals,
  getPointsSummary,
  getPointsHistory,
  listRewards,
  redeemReward,
  listRewardRedemptions,
} = require('../controllers/commissionPointsController');
const authMiddleware = require('../middlewares/auth');

// Semua route reseller butuh JWT
router.use(authMiddleware);

// PUT /resellers/profile — Update profil
router.put('/profile', updateProfile);

// POST /resellers/change-password — Ubah password
router.post('/change-password', changePassword);

// GET /resellers/dashboard — Data dashboard
router.get('/dashboard', getDashboard);

// GET /resellers/commission/summary — Saldo, tier, progres naik tier
router.get('/commission/summary', getCommissionSummary);
// GET /resellers/commission/history — Riwayat komisi
router.get('/commission/history', getCommissionHistory);
// POST /resellers/commission/withdrawals — Ajukan pencairan (min. Rp 1.000.000)
router.post('/commission/withdrawals', requestCommissionWithdrawal);
// GET /resellers/commission/withdrawals — Riwayat pencairan
router.get('/commission/withdrawals', listCommissionWithdrawals);

// GET /resellers/points/summary — Saldo & batch hampir expired
router.get('/points/summary', getPointsSummary);
// GET /resellers/points/history — Riwayat poin
router.get('/points/history', getPointsHistory);

// GET /resellers/rewards — Katalog hadiah
router.get('/rewards', listRewards);
// POST /resellers/rewards/redeem — Tukar poin
router.post('/rewards/redeem', redeemReward);
// GET /resellers/rewards/redemptions — Riwayat penukaran
router.get('/rewards/redemptions', listRewardRedemptions);

// PATCH /resellers/dev/status — Dev helper untuk simulasi status pending/active
router.patch('/dev/status', setDevStatus);

module.exports = router;
