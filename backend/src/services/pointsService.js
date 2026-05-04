const prisma = require('../lib/prisma');

/**
 * Saldo poin = sisa di semua batch type `earned` (amount sudah dikurangi redeem FIFO).
 */
async function getPointBalance(resellerId, tx = prisma) {
  const agg = await tx.point.aggregate({
    where: { reseller_id: resellerId, type: 'earned' },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/**
 * Kurangi saldo dari batch earned FIFO (expires_at paling dekat dulu).
 */
async function deductPointsFifo(tx, resellerId, cost) {
  let remaining = cost;
  const batches = await tx.point.findMany({
    where: {
      reseller_id: resellerId,
      type: 'earned',
      amount: { gt: 0 },
      OR: [{ expires_at: null }, { expires_at: { gte: new Date() } }],
    },
    orderBy: [{ expires_at: 'asc' }, { created_at: 'asc' }],
  });

  for (const batch of batches) {
    if (remaining <= 0) break;
    const take = Math.min(batch.amount, remaining);
    await tx.point.update({
      where: { id: batch.id },
      data: { amount: batch.amount - take },
    });
    remaining -= take;
  }

  if (remaining > 0) {
    throw new Error('INSUFFICIENT_POINTS');
  }
}

/**
 * Poin yang akan kedaluwarsa dalam `withinDays` hari (batch earned masih > 0).
 */
async function getExpiringPointsSummary(resellerId, withinDays = 30) {
  const now = new Date();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + withinDays);

  const rows = await prisma.point.findMany({
    where: {
      reseller_id: resellerId,
      type: 'earned',
      amount: { gt: 0 },
      expires_at: { lte: horizon, gt: now },
    },
    orderBy: { expires_at: 'asc' },
  });

  const total = rows.reduce((s, r) => s + r.amount, 0);
  return { rows, total };
}

/**
 * Cron: expire batch earned yang sudah lewat tanggal expires_at (sisa amount > 0).
 */
async function expirePointsDaily() {
  const now = new Date();
  const expiredEarns = await prisma.point.findMany({
    where: {
      type: 'earned',
      amount: { gt: 0 },
      expires_at: { lt: now },
    },
  });

  let batches = 0;
  for (const row of expiredEarns) {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.point.findUnique({ where: { id: row.id } });
      if (!fresh || fresh.type !== 'earned' || fresh.amount <= 0) return;

      const lost = fresh.amount;
      await tx.point.update({
        where: { id: row.id },
        data: { amount: 0, note: `${fresh.note || ''}|expired_run:${now.toISOString()}`.trim() },
      });
      await tx.point.create({
        data: {
          reseller_id: fresh.reseller_id,
          order_id: fresh.order_id,
          amount: lost,
          type: 'expired',
          note: `Kedaluwarsa (batch ${fresh.id})`,
          expires_at: null,
        },
      });
    });
    batches += 1;
  }

  return { processed_batches: batches };
}

module.exports = {
  getPointBalance,
  deductPointsFifo,
  getExpiringPointsSummary,
  expirePointsDaily,
};
