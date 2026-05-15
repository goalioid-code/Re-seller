const prisma = require('../lib/prisma');
const {
  orderBaseScalarSelect,
  orderDetailSelect,
} = require('./orderController');

/** Detail order admin: select aman + reseller & tier tanpa password_hash. (internal_notes hanya bila kolom sudah di-ALTER oleh owner DB.) */
const adminOrderDetailSelect = {
  ...orderDetailSelect,
  reseller: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      tier: {
        select: {
          id: true,
          name: true,
          percentage: true,
          min_orders: true,
          is_active: true,
        },
      },
    },
  },
};

const adminOrderListSelect = {
  ...orderBaseScalarSelect,
  reseller: {
    select: { id: true, name: true, email: true },
  },
};

// --- Dashboard ---

const getAdminDashboard = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      ordersByStatus,
      pendingResellers,
      pendingPayments,
      productionCompletedToday,
      totalOrders,
    ] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.reseller.count({ where: { status: 'pending' } }),
      prisma.orderPayment.count({
        where: {
          status: 'pending',
          OR: [{ proof_url: { not: null } }, { midtrans_order_id: { not: null } }],
        },
      }),
      prisma.productionStatus.count({
        where: {
          status: 'completed',
          completed_at: { gte: todayStart },
        },
      }),
      prisma.order.count(),
    ]);

    const statusMap = Object.fromEntries(ordersByStatus.map((r) => [r.status, r._count._all]));

    return res.status(200).json({
      success: true,
      dashboard: {
        orders_total: totalOrders,
        orders_by_status: statusMap,
        pending_resellers: pendingResellers,
        pending_payments_review: pendingPayments,
        production_stages_completed_today: productionCompletedToday,
      },
    });
  } catch (e) {
    console.error('[Admin] Dashboard error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat dashboard.' });
  }
};

// --- Orders ---

const listAdminOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) {
      const s = String(q);
      where.OR = [
        { po_number: { contains: s, mode: 'insensitive' } },
        { customer_name: { contains: s, mode: 'insensitive' } },
        { brand_name: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: adminOrderListSelect,
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        take: parseInt(limit, 10),
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (e) {
    console.error('[Admin] List orders error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat order.' });
  }
};

const getAdminOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      select: adminOrderDetailSelect,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan.' });
    }
    return res.status(200).json({ success: true, order });
  } catch (e) {
    console.error('[Admin] Order detail error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat detail order.' });
  }
};

const patchOrderInternalNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { internal_notes } = req.body || {};
    if (internal_notes === undefined) {
      return res.status(400).json({ success: false, message: 'internal_notes wajib (boleh string kosong).' });
    }
    const order = await prisma.order.update({
      where: { id },
      data: { internal_notes: internal_notes === null ? null : String(internal_notes) },
      select: adminOrderDetailSelect,
    });
    return res.status(200).json({ success: true, order });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan.' });
    }
    const msg = String(e.message || '');
    if (/internal_notes|does not exist|42703|column/i.test(msg)) {
      return res.status(503).json({
        success: false,
        message:
          'Kolom internal_notes belum ada di database. Jalankan sebagai owner tabel: ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;',
      });
    }
    console.error('[Admin] Patch internal notes error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan catatan.' });
  }
};

// --- Payments (admin konfirmasi bukti / manual) ---

const listPendingPaymentsAdmin = async (req, res) => {
  try {
    const payments = await prisma.orderPayment.findMany({
      where: { status: 'pending' },
      include: {
        order: {
          select: {
            id: true,
            po_number: true,
            customer_name: true,
            reseller: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    return res.status(200).json({ success: true, payments });
  } catch (e) {
    console.error('[Admin] Pending payments error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat pembayaran.' });
  }
};

const applyOrderStatusAfterPayment = async (tx, payment) => {
  if (payment.payment_type === 'dp_design') {
    await tx.order.update({
      where: { id: payment.order_id },
      data: { status: 'design' },
    });
  } else if (payment.payment_type === 'dp_production') {
    await tx.order.update({
      where: { id: payment.order_id },
      data: { status: 'production' },
    });
  }
};

const confirmPaymentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.orderPayment.findUnique({ where: { id }, include: { order: true } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Hanya pembayaran pending yang bisa dikonfirmasi.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderPayment.update({
        where: { id },
        data: {
          status: 'completed',
          completed_at: new Date(),
        },
      });
      await applyOrderStatusAfterPayment(tx, payment);
    });

    const updated = await prisma.orderPayment.findUnique({ where: { id }, include: { order: true } });
    return res.status(200).json({ success: true, message: 'Pembayaran dikonfirmasi.', payment: updated });
  } catch (e) {
    console.error('[Admin] Confirm payment error:', e);
    return res.status(500).json({ success: false, message: 'Gagal mengonfirmasi pembayaran.' });
  }
};

const rejectPaymentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const payment = await prisma.orderPayment.findUnique({ where: { id } });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Pembayaran tidak ditemukan.' });
    }
    if (payment.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Hanya pembayaran pending yang bisa ditolak.' });
    }
    const updated = await prisma.orderPayment.update({
      where: { id },
      data: {
        status: 'failed',
        admin_notes: reason ? String(reason) : 'Ditolak admin',
      },
    });
    return res.status(200).json({ success: true, message: 'Pembayaran ditolak.', payment: updated });
  } catch (e) {
    console.error('[Admin] Reject payment error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menolak pembayaran.' });
  }
};

// --- Commission withdrawals ---

const listWithdrawalsAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const where = {};
    if (status) where.status = status;

    const [rows, total] = await Promise.all([
      prisma.commissionWithdrawal.findMany({
        where,
        include: { reseller: { select: { id: true, name: true, email: true } } },
        orderBy: { created_at: 'desc' },
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        take: parseInt(limit, 10),
      }),
      prisma.commissionWithdrawal.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      withdrawals: rows,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (e) {
    console.error('[Admin] List withdrawals error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat pencairan.' });
  }
};

const approveWithdrawalAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await prisma.commissionWithdrawal.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ success: false, message: 'Pengajuan tidak ditemukan.' });
    if (row.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Hanya status pending yang bisa disetujui.' });
    }
    const updated = await prisma.commissionWithdrawal.update({
      where: { id },
      data: { status: 'completed', processed_at: new Date() },
    });
    return res.status(200).json({ success: true, message: 'Pencairan disetujui.', withdrawal: updated });
  } catch (e) {
    console.error('[Admin] Approve withdrawal error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menyetujui pencairan.' });
  }
};

const rejectWithdrawalAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const row = await prisma.commissionWithdrawal.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ success: false, message: 'Pengajuan tidak ditemukan.' });
    if (row.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Hanya status pending yang bisa ditolak.' });
    }
    const updated = await prisma.commissionWithdrawal.update({
      where: { id },
      data: {
        status: 'rejected',
        processed_at: new Date(),
        admin_notes: reason ? String(reason) : 'Ditolak',
      },
    });
    return res.status(200).json({ success: true, message: 'Pencairan ditolak.', withdrawal: updated });
  } catch (e) {
    console.error('[Admin] Reject withdrawal error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menolak pencairan.' });
  }
};

// --- Tiers ---

const listCommissionTiersAdmin = async (req, res) => {
  try {
    const tiers = await prisma.commissionTier.findMany({ orderBy: { min_orders: 'asc' } });
    return res.status(200).json({ success: true, tiers });
  } catch (e) {
    console.error('[Admin] List tiers error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat tier.' });
  }
};

const updateCommissionTierAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, percentage, min_orders, is_active } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = String(name);
    if (percentage !== undefined) data.percentage = parseFloat(percentage);
    if (min_orders !== undefined) data.min_orders = parseInt(min_orders, 10);
    if (is_active !== undefined) data.is_active = Boolean(is_active);
    const tier = await prisma.commissionTier.update({ where: { id }, data });
    return res.status(200).json({ success: true, tier });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Tier tidak ditemukan.' });
    }
    console.error('[Admin] Update tier error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui tier.' });
  }
};

// --- Rewards CRUD ---

const listRewardsAdmin = async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({ orderBy: { created_at: 'desc' } });
    return res.status(200).json({ success: true, rewards });
  } catch (e) {
    console.error('[Admin] List rewards error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat hadiah.' });
  }
};

const createRewardAdmin = async (req, res) => {
  try {
    const { name, description, image_url, points_cost, stock, is_active } = req.body || {};
    if (!name || points_cost == null || stock == null) {
      return res.status(400).json({ success: false, message: 'name, points_cost, stock wajib.' });
    }
    const reward = await prisma.reward.create({
      data: {
        name: String(name),
        description: description || null,
        image_url: image_url || null,
        points_cost: parseInt(points_cost, 10),
        stock: parseInt(stock, 10),
        is_active: is_active !== false,
      },
    });
    return res.status(201).json({ success: true, reward });
  } catch (e) {
    console.error('[Admin] Create reward error:', e);
    return res.status(500).json({ success: false, message: 'Gagal membuat hadiah.' });
  }
};

const updateRewardAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, points_cost, stock, is_active } = req.body || {};
    const data = {};
    if (name !== undefined) data.name = String(name);
    if (description !== undefined) data.description = description;
    if (image_url !== undefined) data.image_url = image_url;
    if (points_cost !== undefined) data.points_cost = parseInt(points_cost, 10);
    if (stock !== undefined) data.stock = parseInt(stock, 10);
    if (is_active !== undefined) data.is_active = Boolean(is_active);
    const reward = await prisma.reward.update({ where: { id }, data });
    return res.status(200).json({ success: true, reward });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Hadiah tidak ditemukan.' });
    }
    console.error('[Admin] Update reward error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui hadiah.' });
  }
};

const deleteRewardAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.reward.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Hadiah dihapus.' });
  } catch (e) {
    if (e.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Hadiah tidak ditemukan.' });
    }
    console.error('[Admin] Delete reward error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menghapus (mungkin masih ada penukaran).' });
  }
};

// --- Reward redemptions ---

const listRewardRedemptionsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const rows = await prisma.rewardRedemption.findMany({
      where,
      include: {
        reseller: { select: { id: true, name: true, email: true } },
        reward: true,
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });
    return res.status(200).json({ success: true, redemptions: rows });
  } catch (e) {
    console.error('[Admin] List redemptions error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat penukaran.' });
  }
};

const approveRedemptionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await prisma.rewardRedemption.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ success: false, message: 'Penukaran tidak ditemukan.' });
    if (row.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Bukan status pending.' });
    }
    const updated = await prisma.rewardRedemption.update({
      where: { id },
      data: { status: 'completed', processed_at: new Date() },
    });
    return res.status(200).json({ success: true, message: 'Penukaran disetujui.', redemption: updated });
  } catch (e) {
    console.error('[Admin] Approve redemption error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menyetujui.' });
  }
};

const rejectRedemptionAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const row = await prisma.rewardRedemption.findUnique({
      where: { id },
      include: { reward: true },
    });
    if (!row) return res.status(404).json({ success: false, message: 'Penukaran tidak ditemukan.' });
    if (row.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Bukan status pending.' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.rewardRedemption.update({
        where: { id },
        data: {
          status: 'rejected',
          processed_at: new Date(),
          admin_notes: reason ? String(reason) : 'Ditolak',
        },
      });
      await tx.reward.update({
        where: { id: row.reward_id },
        data: { stock: { increment: 1 } },
      });
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await tx.point.create({
        data: {
          reseller_id: row.reseller_id,
          amount: row.points_used,
          type: 'earned',
          note: `Pengembalian poin — penukaran ditolak (${row.reward?.name || id})`,
          expires_at: expiresAt,
        },
      });
    });

    return res.status(200).json({ success: true, message: 'Penukaran ditolak; stok & poin dikembalikan.' });
  } catch (e) {
    console.error('[Admin] Reject redemption error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menolak penukaran.' });
  }
};

// --- Reports ---

const csvEscape = (v) => {
  const s = v == null ? '' : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const reportOrdersCsv = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { reseller: { select: { email: true, name: true } } },
      orderBy: { created_at: 'desc' },
      take: 5000,
    });
    const headers = ['id', 'po_number', 'status', 'total_amount', 'reseller_email', 'created_at'];
    const lines = [headers.join(',')];
    for (const o of orders) {
      lines.push(
        [
          o.id,
          o.po_number,
          o.status,
          o.total_amount,
          o.reseller?.email,
          o.created_at?.toISOString(),
        ].map(csvEscape).join(','),
      );
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_report.csv"');
    return res.status(200).send(lines.join('\n'));
  } catch (e) {
    console.error('[Admin] CSV orders error:', e);
    return res.status(500).json({ success: false, message: 'Gagal export.' });
  }
};

const reportResellersCsv = async (req, res) => {
  try {
    const rows = await prisma.reseller.findMany({
      include: { tier: true },
      orderBy: { created_at: 'desc' },
      take: 5000,
    });
    const headers = ['id', 'name', 'email', 'status', 'tier', 'created_at'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(
        [r.id, r.name, r.email, r.status, r.tier?.name || '', r.created_at?.toISOString()].map(csvEscape).join(','),
      );
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="resellers_report.csv"');
    return res.status(200).send(lines.join('\n'));
  } catch (e) {
    console.error('[Admin] CSV resellers error:', e);
    return res.status(500).json({ success: false, message: 'Gagal export.' });
  }
};

const reportFinancialCsv = async (req, res) => {
  try {
    const [commissions, withdrawals] = await Promise.all([
      prisma.commission.findMany({
        where: { status: 'confirmed' },
        orderBy: { created_at: 'desc' },
        take: 5000,
      }),
      prisma.commissionWithdrawal.findMany({ orderBy: { created_at: 'desc' }, take: 5000 }),
    ]);
    const lines = ['type,id,reseller_id,amount,status,created_at'];
    for (const c of commissions) {
      lines.push(['commission', c.id, c.reseller_id, c.amount, c.status, c.created_at?.toISOString()].map(csvEscape).join(','));
    }
    for (const w of withdrawals) {
      lines.push(
        ['withdrawal', w.id, w.reseller_id, w.amount, w.status, w.created_at?.toISOString()].map(csvEscape).join(','),
      );
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="financial_report.csv"');
    return res.status(200).send(lines.join('\n'));
  } catch (e) {
    console.error('[Admin] CSV financial error:', e);
    return res.status(500).json({ success: false, message: 'Gagal export.' });
  }
};

const reportOrdersJson = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { reseller: { select: { email: true, name: true } } },
      orderBy: { created_at: 'desc' },
      take: 500,
    });
    return res.status(200).json({ success: true, orders });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal memuat laporan.' });
  }
};

const reportResellersJson = async (req, res) => {
  try {
    const resellers = await prisma.reseller.findMany({
      include: {
        tier: true,
        _count: { select: { orders: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 500,
    });
    return res.status(200).json({ success: true, resellers });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal memuat laporan.' });
  }
};

const reportFinancialJson = async (req, res) => {
  try {
    const [commissionSum, withdrawalSum] = await Promise.all([
      prisma.commission.aggregate({ where: { status: 'confirmed' }, _sum: { amount: true } }),
      prisma.commissionWithdrawal.aggregate({
        where: { status: { in: ['pending', 'approved', 'completed'] } },
        _sum: { amount: true },
      }),
    ]);
    return res.status(200).json({
      success: true,
      financial: {
        total_commission_confirmed: commissionSum._sum.amount ?? 0,
        total_withdrawals_locked_or_paid: withdrawalSum._sum.amount ?? 0,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Gagal memuat laporan.' });
  }
};

// --- System config ---

const getSystemConfig = async (req, res) => {
  try {
    let cfg = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    if (!cfg) {
      cfg = await prisma.systemConfig.create({
        data: { id: 'global', min_commission_withdrawal: 1_000_000 },
      });
    }
    return res.status(200).json({ success: true, config: cfg });
  } catch (e) {
    console.error('[Admin] Get config error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat pengaturan.' });
  }
};

const patchSystemConfig = async (req, res) => {
  try {
    const { min_commission_withdrawal } = req.body || {};
    if (min_commission_withdrawal === undefined) {
      return res.status(400).json({ success: false, message: 'min_commission_withdrawal wajib.' });
    }
    const v = parseFloat(min_commission_withdrawal);
    if (Number.isNaN(v) || v < 0) {
      return res.status(400).json({ success: false, message: 'Nilai tidak valid.' });
    }
    const cfg = await prisma.systemConfig.upsert({
      where: { id: 'global' },
      create: { id: 'global', min_commission_withdrawal: v },
      update: { min_commission_withdrawal: v },
    });
    return res.status(200).json({ success: true, config: cfg });
  } catch (e) {
    console.error('[Admin] Patch config error:', e);
    return res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan.' });
  }
};

// --- Reseller detail stats (extend) ---

const listProductionStagesAdmin = async (req, res) => {
  try {
    const stages = await prisma.productionStage.findMany({
      orderBy: { order_index: 'asc' },
    });
    return res.status(200).json({ success: true, stages });
  } catch (e) {
    console.error('[Admin] List stages error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat tahapan.' });
  }
};

const getResellerPerformanceAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const reseller = await prisma.reseller.findUnique({
      where: { id },
      include: { tier: true },
    });
    if (!reseller) {
      return res.status(404).json({ success: false, message: 'Reseller tidak ditemukan.' });
    }

    const [orderByStatus, orderCompleted, commissionSum, withdrawalSum] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { reseller_id: id },
        _count: { _all: true },
      }),
      prisma.order.count({ where: { reseller_id: id, status: 'completed' } }),
      prisma.commission.aggregate({
        where: { reseller_id: id, status: 'confirmed' },
        _sum: { amount: true },
      }),
      prisma.commissionWithdrawal.aggregate({
        where: { reseller_id: id, status: { in: ['pending', 'approved', 'completed'] } },
        _sum: { amount: true },
      }),
    ]);

    const ordersByStatus = Object.fromEntries(orderByStatus.map((r) => [r.status, r._count._all]));

    return res.status(200).json({
      success: true,
      performance: {
        reseller,
        orders_by_status: ordersByStatus,
        orders_completed: orderCompleted,
        commission_confirmed_total: commissionSum._sum.amount ?? 0,
        withdrawals_total: withdrawalSum._sum.amount ?? 0,
      },
    });
  } catch (e) {
    console.error('[Admin] Reseller performance error:', e);
    return res.status(500).json({ success: false, message: 'Gagal memuat performa.' });
  }
};

module.exports = {
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
};
