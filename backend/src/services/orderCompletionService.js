const prisma = require('../lib/prisma');

const DEFAULT_COMMISSION_PCT = 5;
const POINTS_PER_100K_IDR = 1; // 1 poin per Rp 100.000 omzet order selesai (minimal 1)

/**
 * Hitung jumlah stage produksi aktif (master).
 */
async function getProductionStageCount(tx = prisma) {
  return tx.productionStage.count();
}

/**
 * Apakah semua stage untuk order ini sudah completed.
 */
async function isProductionFullyCompleted(orderId, tx = prisma) {
  const totalStages = await getProductionStageCount(tx);
  if (totalStages === 0) return false;

  const completed = await tx.productionStatus.count({
    where: { order_id: orderId, status: 'completed' },
  });
  return completed >= totalStages;
}

/**
 * Naikkan tier reseller berdasarkan jumlah order status completed.
 */
async function maybeUpgradeTier(tx, resellerId) {
  const completedCount = await tx.order.count({
    where: { reseller_id: resellerId, status: 'completed' },
  });

  const tiers = await tx.commissionTier.findMany({
    where: { is_active: true },
    orderBy: { min_orders: 'desc' },
  });

  const best = tiers.find((t) => t.min_orders <= completedCount);
  if (!best) return null;

  const reseller = await tx.reseller.findUnique({
    where: { id: resellerId },
    select: { tier_id: true },
  });
  if (reseller?.tier_id === best.id) return null;

  await tx.reseller.update({
    where: { id: resellerId },
    data: { tier_id: best.id },
  });
  return best;
}

/**
 * Catat komisi + poin (batch 1 tahun) untuk order yang baru selesai. Idempotent per order_id.
 */
async function recordOrderRewardsIfNeeded(tx, orderId) {
  const dup = await tx.commission.findFirst({ where: { order_id: orderId } });
  if (dup) return { skipped: true, reason: 'commission_exists' };

  const order = await tx.order.findUnique({
    where: { id: orderId },
    include: {
      reseller: { include: { tier: true } },
    },
  });

  if (!order || order.status === 'cancelled') {
    return { skipped: true, reason: 'invalid_order' };
  }

  const pct = order.reseller.tier?.percentage ?? DEFAULT_COMMISSION_PCT;
  const commissionAmount = Math.round(order.total_amount * (pct / 100) * 100) / 100;

  await tx.commission.create({
    data: {
      reseller_id: order.reseller_id,
      order_id: orderId,
      amount: commissionAmount,
      percentage: pct,
      status: 'confirmed',
      confirmed_at: new Date(),
      note: 'Komisi otomatis saat order selesai',
    },
  });

  const pointsAmount = Math.max(POINTS_PER_100K_IDR, Math.floor(order.total_amount / 100_000));
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await tx.point.create({
    data: {
      reseller_id: order.reseller_id,
      order_id: orderId,
      amount: pointsAmount,
      type: 'earned',
      note: `Poin order selesai (PO ${order.po_number})`,
      expires_at: expiresAt,
    },
  });

  const tier = await maybeUpgradeTier(tx, order.reseller_id);
  return { skipped: false, commissionAmount, pointsAmount, tier };
}

/**
 * Set order ke completed bila semua tahapan produksi selesai, lalu catat komisi & poin.
 */
async function finalizeOrderFromProduction(orderId) {
  const done = await isProductionFullyCompleted(orderId);
  if (!done) return { finalized: false };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true },
  });
  if (!order || order.status === 'cancelled') return { finalized: false };

  return prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (fresh?.status === 'cancelled') return { finalized: false };

    if (fresh?.status !== 'completed') {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'completed' },
      });
    }

    const rewards = await recordOrderRewardsIfNeeded(tx, orderId);
    return { finalized: true, rewards };
  });
}

module.exports = {
  finalizeOrderFromProduction,
  isProductionFullyCompleted,
  recordOrderRewardsIfNeeded,
};
