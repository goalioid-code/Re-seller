const prisma = require('../lib/prisma');
const pointsService = require('../services/pointsService');

const MIN_WITHDRAWAL_IDR = 1_000_000;

async function getCommissionSummary(req, res) {
  try {
    const resellerId = req.reseller.id;

    const [reseller, confirmedAgg, withdrawalAgg, tiers] = await Promise.all([
      prisma.reseller.findUnique({
        where: { id: resellerId },
        include: { tier: true },
      }),
      prisma.commission.aggregate({
        where: { reseller_id: resellerId, status: 'confirmed' },
        _sum: { amount: true },
      }),
      prisma.commissionWithdrawal.aggregate({
        where: {
          reseller_id: resellerId,
          status: { in: ['pending', 'approved', 'completed'] },
        },
        _sum: { amount: true },
      }),
      prisma.commissionTier.findMany({
        where: { is_active: true },
        orderBy: { min_orders: 'asc' },
      }),
    ]);

    const totalEarned = confirmedAgg._sum.amount ?? 0;
    const totalWithdrawnOrPending = withdrawalAgg._sum.amount ?? 0;
    const availableBalance = Math.max(0, Math.round((totalEarned - totalWithdrawnOrPending) * 100) / 100);

    const completedOrders = await prisma.order.count({
      where: { reseller_id: resellerId, status: 'completed' },
    });

    const tiersAsc = [...tiers].sort((a, b) => a.min_orders - b.min_orders);
    const currentTier = reseller?.tier || null;

    let nextTier = null;
    if (currentTier) {
      const idx = tiersAsc.findIndex((t) => t.id === currentTier.id);
      if (idx >= 0 && idx < tiersAsc.length - 1) {
        nextTier = tiersAsc[idx + 1];
      }
    } else if (tiersAsc.length > 0) {
      nextTier = tiersAsc[0];
    }

    let tierProgress = {
      current_orders: completedOrders,
      orders_to_next: 0,
      percent: 100,
      at_max_tier: !nextTier,
    };
    if (nextTier && currentTier) {
      const span = nextTier.min_orders - currentTier.min_orders;
      const gained = completedOrders - currentTier.min_orders;
      tierProgress = {
        current_orders: completedOrders,
        next_tier_name: nextTier.name,
        next_tier_min_orders: nextTier.min_orders,
        orders_to_next: Math.max(0, nextTier.min_orders - completedOrders),
        percent: span > 0 ? Math.min(100, Math.round((gained / span) * 100)) : 100,
        at_max_tier: false,
      };
    } else if (nextTier && !currentTier) {
      const span = nextTier.min_orders || 1;
      tierProgress = {
        current_orders: completedOrders,
        next_tier_name: nextTier.name,
        next_tier_min_orders: nextTier.min_orders,
        orders_to_next: Math.max(0, nextTier.min_orders - completedOrders),
        percent: Math.min(100, Math.round((completedOrders / span) * 100)),
        at_max_tier: false,
      };
    }

    return res.status(200).json({
      success: true,
      summary: {
        available_balance: availableBalance,
        total_commission_confirmed: totalEarned,
        pending_or_processing_withdrawals: totalWithdrawnOrPending,
        tier: currentTier,
        tiers,
        completed_orders: completedOrders,
        tier_progress: tierProgress,
        min_withdrawal: MIN_WITHDRAWAL_IDR,
      },
    });
  } catch (e) {
    console.error('[Commission] Summary error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat ringkasan komisi.' });
  }
}

async function getCommissionHistory(req, res) {
  try {
    const resellerId = req.reseller.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [rows, total] = await Promise.all([
      prisma.commission.findMany({
        where: { reseller_id: resellerId },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.commission.count({ where: { reseller_id: resellerId } }),
    ]);

    return res.status(200).json({
      success: true,
      commissions: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('[Commission] History error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat komisi.' });
  }
}

async function requestCommissionWithdrawal(req, res) {
  try {
    const resellerId = req.reseller.id;
    const { amount, bank_name, bank_account, account_name, notes } = req.body || {};

    const amt = typeof amount === 'number' ? amount : parseFloat(amount);
    if (!amt || Number.isNaN(amt) || amt < MIN_WITHDRAWAL_IDR) {
      return res.status(400).json({
        success: false,
        message: `Nominal minimal pencairan Rp ${MIN_WITHDRAWAL_IDR.toLocaleString('id-ID')}.`,
      });
    }

    if (!bank_name || !bank_account || !account_name) {
      return res.status(400).json({
        success: false,
        message: 'Nama bank, nomor rekening, dan nama pemilik rekening wajib diisi.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const confirmedAgg = await tx.commission.aggregate({
        where: { reseller_id: resellerId, status: 'confirmed' },
        _sum: { amount: true },
      });
      const withdrawalAgg = await tx.commissionWithdrawal.aggregate({
        where: {
          reseller_id: resellerId,
          status: { in: ['pending', 'approved', 'completed'] },
        },
        _sum: { amount: true },
      });

      const totalEarned = confirmedAgg._sum.amount ?? 0;
      const locked = withdrawalAgg._sum.amount ?? 0;
      const available = Math.max(0, Math.round((totalEarned - locked) * 100) / 100);

      if (amt > available) {
        const err = new Error('INSUFFICIENT_BALANCE');
        err.available = available;
        throw err;
      }

      const w = await tx.commissionWithdrawal.create({
        data: {
          reseller_id: resellerId,
          amount: amt,
          status: 'pending',
          bank_name,
          bank_account,
          account_name,
          notes: notes || null,
        },
      });
      return w;
    });

    return res.status(201).json({
      success: true,
      message: 'Pengajuan pencairan komisi berhasil dikirim.',
      withdrawal: result,
    });
  } catch (e) {
    if (e.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        success: false,
        message: 'Saldo komisi tidak mencukupi.',
        available_balance: e.available,
      });
    }
    console.error('[Commission] Withdraw request error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengajukan pencairan.' });
  }
}

async function listCommissionWithdrawals(req, res) {
  try {
    const resellerId = req.reseller.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [rows, total] = await Promise.all([
      prisma.commissionWithdrawal.findMany({
        where: { reseller_id: resellerId },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.commissionWithdrawal.count({ where: { reseller_id: resellerId } }),
    ]);

    return res.status(200).json({
      success: true,
      withdrawals: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('[Commission] List withdrawals error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat pencairan.' });
  }
}

async function getPointsSummary(req, res) {
  try {
    const resellerId = req.reseller.id;
    const balance = await pointsService.getPointBalance(resellerId);
    const expiring = await pointsService.getExpiringPointsSummary(resellerId, 30);

    return res.status(200).json({
      success: true,
      summary: {
        balance,
        expiring_within_30_days: expiring.total,
        expiring_batches: expiring.rows.map((r) => ({
          id: r.id,
          amount: r.amount,
          expires_at: r.expires_at,
          order_id: r.order_id,
          note: r.note,
        })),
      },
    });
  } catch (e) {
    console.error('[Points] Summary error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat ringkasan poin.' });
  }
}

async function getPointsHistory(req, res) {
  try {
    const resellerId = req.reseller.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const where = {
      reseller_id: resellerId,
      OR: [
        { type: 'redeemed' },
        { type: 'expired' },
        { type: 'earned', amount: { gt: 0 } },
      ],
    };

    const [rows, total] = await Promise.all([
      prisma.point.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.point.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      points: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('[Points] History error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat poin.' });
  }
}

async function listRewards(req, res) {
  try {
    const rewards = await prisma.reward.findMany({
      where: { is_active: true, stock: { gt: 0 } },
      orderBy: { points_cost: 'asc' },
    });
    return res.status(200).json({ success: true, rewards });
  } catch (e) {
    console.error('[Rewards] List error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat katalog hadiah.' });
  }
}

async function redeemReward(req, res) {
  try {
    const resellerId = req.reseller.id;
    const { reward_id, address, notes } = req.body || {};
    if (!reward_id) {
      return res.status(400).json({ success: false, message: 'reward_id wajib diisi.' });
    }

    const redemption = await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findFirst({
        where: { id: reward_id, is_active: true, stock: { gt: 0 } },
      });
      if (!reward) {
        throw new Error('REWARD_NOT_FOUND');
      }

      const balance = await pointsService.getPointBalance(resellerId, tx);
      if (balance < reward.points_cost) {
        const err = new Error('INSUFFICIENT_POINTS');
        err.balance = balance;
        throw err;
      }

      await pointsService.deductPointsFifo(tx, resellerId, reward.points_cost);

      await tx.point.create({
        data: {
          reseller_id: resellerId,
          amount: reward.points_cost,
          type: 'redeemed',
          note: `Penukaran: ${reward.name}`,
        },
      });

      const red = await tx.rewardRedemption.create({
        data: {
          reseller_id: resellerId,
          reward_id: reward.id,
          points_used: reward.points_cost,
          status: 'pending',
          address: address || null,
          notes: notes || null,
        },
        include: { reward: true },
      });

      await tx.reward.update({
        where: { id: reward.id },
        data: { stock: { decrement: 1 } },
      });

      return red;
    });

    return res.status(201).json({
      success: true,
      message: 'Penukaran hadiah berhasil diajukan.',
      redemption,
    });
  } catch (e) {
    if (e.message === 'REWARD_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Hadiah tidak tersedia.' });
    }
    if (e.message === 'INSUFFICIENT_POINTS') {
      return res.status(400).json({
        success: false,
        message: 'Poin tidak mencukupi.',
        balance: e.balance ?? undefined,
      });
    }
    console.error('[Rewards] Redeem error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menukar hadiah.' });
  }
}

async function listRewardRedemptions(req, res) {
  try {
    const resellerId = req.reseller.id;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [rows, total] = await Promise.all([
      prisma.rewardRedemption.findMany({
        where: { reseller_id: resellerId },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { reward: true },
      }),
      prisma.rewardRedemption.count({ where: { reseller_id: resellerId } }),
    ]);

    return res.status(200).json({
      success: true,
      redemptions: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error('[Rewards] Redemptions list error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat riwayat penukaran.' });
  }
}

module.exports = {
  getCommissionSummary,
  getCommissionHistory,
  requestCommissionWithdrawal,
  listCommissionWithdrawals,
  getPointsSummary,
  getPointsHistory,
  listRewards,
  redeemReward,
  listRewardRedemptions,
};
