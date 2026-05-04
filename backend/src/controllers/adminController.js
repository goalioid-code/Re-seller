/**
 * Admin Controller
 * Endpoints untuk admin management
 */

const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const { finalizeOrderFromProduction } = require('../services/orderCompletionService');

/**
 * POST /admin/auth/login
 * Admin login dengan email & password (development: tanpa password verification)
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi.',
      });
    }

    // Cari admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Admin account tidak aktif.',
      });
    }

    // TODO: Implement bcrypt password verification
    // For development: skip password check
    if (process.env.NODE_ENV !== 'development' && !password) {
      return res.status(401).json({
        success: false,
        message: 'Password harus diisi.',
      });
    }

    // Buat JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login admin berhasil.',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('[Admin] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login.',
    });
  }
};

/**
 * GET /admin/resellers/pending
 * Daftar reseller menunggu approval
 */
const getPendingResellers = async (req, res) => {
  try {
    const pendingResellers = await prisma.reseller.findMany({
      where: { status: 'pending' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        status: true,
        created_at: true,
        onboarding_data: true,
        tier: true,
      },
      orderBy: { created_at: 'asc' },
    });

    return res.status(200).json({
      success: true,
      resellers: pendingResellers,
      total: pendingResellers.length,
    });
  } catch (error) {
    console.error('[Admin] Get pending resellers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar reseller pending.',
    });
  }
};

/**
 * GET /admin/resellers
 * Daftar semua reseller dengan filter
 */
const getAllResellers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const resellers = await prisma.reseller.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        tier: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit),
    });

    const total = await prisma.reseller.count({ where });

    return res.status(200).json({
      success: true,
      resellers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Admin] Get all resellers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar reseller.',
    });
  }
};

/**
 * GET /admin/resellers/:id
 * Detail reseller
 */
const getResellerDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const reseller = await prisma.reseller.findUnique({
      where: { id },
      include: {
        tier: true,
        commissions: { take: 5, orderBy: { created_at: 'desc' } },
        orders: { take: 5, orderBy: { created_at: 'desc' } },
        points: { take: 5, orderBy: { created_at: 'desc' } },
      },
    });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      reseller,
    });
  } catch (error) {
    console.error('[Admin] Get reseller detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail reseller.',
    });
  }
};

/**
 * PUT /admin/resellers/:id/approve
 * Approve reseller (ubah status dari pending ke active)
 */
const approveReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const reseller = await prisma.reseller.findUnique({
      where: { id },
    });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    if (reseller.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Reseller sudah diapprove.',
      });
    }

    let tierId = reseller.tier_id;
    if (!tierId) {
      const silver = await prisma.commissionTier.findFirst({ where: { name: 'Silver' } });
      if (silver) tierId = silver.id;
    }

    const updated = await prisma.reseller.update({
      where: { id },
      data: {
        status: 'active',
        ...(tierId ? { tier_id: tierId } : {}),
      },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Reseller ${updated.name} berhasil diapprove.`,
      reseller: updated,
    });
  } catch (error) {
    console.error('[Admin] Approve reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat approve reseller.',
    });
  }
};

/**
 * PUT /admin/resellers/:id/reject
 * Reject reseller (ubah status dari pending ke inactive)
 */
const rejectReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const reseller = await prisma.reseller.findUnique({
      where: { id },
    });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    if (reseller.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Hanya reseller dengan status pending yang bisa di-reject.',
      });
    }

    // Update status ke inactive
    const updated = await prisma.reseller.update({
      where: { id },
      data: {
        status: 'inactive',
      },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Reseller ${updated.name} berhasil di-reject.`,
      reseller: updated,
    });
  } catch (error) {
    console.error('[Admin] Reject reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat reject reseller.',
    });
  }
};

/**
 * PUT /admin/resellers/:id/deactivate
 * Ubah status reseller active -> inactive
 */
const deactivateReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const reseller = await prisma.reseller.findUnique({ where: { id } });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    if (reseller.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Hanya reseller dengan status active yang bisa di-deactivate.',
      });
    }

    const updated = await prisma.reseller.update({
      where: { id },
      data: { status: 'inactive' },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Reseller ${updated.name} berhasil di-deactivate.`,
      reseller: updated,
    });
  } catch (error) {
    console.error('[Admin] Deactivate reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat deactivate reseller.',
    });
  }
};

/**
 * PUT /admin/resellers/:id/reactivate
 * Ubah status reseller inactive -> active
 */
const reactivateReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const reseller = await prisma.reseller.findUnique({ where: { id } });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    if (reseller.status !== 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Hanya reseller dengan status inactive yang bisa di-reactivate.',
      });
    }

    const updated = await prisma.reseller.update({
      where: { id },
      data: { status: 'active' },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Reseller ${updated.name} berhasil di-reactivate.`,
      reseller: updated,
    });
  } catch (error) {
    console.error('[Admin] Reactivate reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat reactivate reseller.',
    });
  }
};

/**
 * DELETE /admin/resellers/:id
 * Hapus reseller jika tidak punya data transaksi terkait
 */
const deleteReseller = async (req, res) => {
  try {
    const { id } = req.params;
    const reseller = await prisma.reseller.findUnique({ where: { id } });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Reseller tidak ditemukan.',
      });
    }

    const [orderCount, commissionCount, pointCount] = await Promise.all([
      prisma.order.count({ where: { reseller_id: id } }),
      prisma.commission.count({ where: { reseller_id: id } }),
      prisma.point.count({ where: { reseller_id: id } }),
    ]);

    if (orderCount > 0 || commissionCount > 0 || pointCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          'Reseller tidak bisa dihapus karena sudah memiliki data transaksi. Gunakan deactivate untuk menonaktifkan akun.',
      });
    }

    await prisma.reseller.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `Reseller ${reseller.name} berhasil dihapus.`,
    });
  } catch (error) {
    console.error('[Admin] Delete reseller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus reseller.',
    });
  }
};

/**
 * PUT /admin/resellers/:id/tier
 * Update tier komisi reseller
 */
const updateResellerTier = async (req, res) => {
  try {
    const { id } = req.params;
    const { tier_id } = req.body;

    if (!tier_id) {
      return res.status(400).json({
        success: false,
        message: 'Tier ID harus diisi.',
      });
    }

    // Verify tier exists
    const tier = await prisma.commissionTier.findUnique({
      where: { id: tier_id },
    });

    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Tier tidak ditemukan.',
      });
    }

    // Update reseller tier
    const updated = await prisma.reseller.update({
      where: { id },
      data: { tier_id },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Tier reseller berhasil di-update ke ${tier.name}.`,
      reseller: updated,
    });
  } catch (error) {
    console.error('[Admin] Update reseller tier error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update tier reseller.',
    });
  }
};

/**
 * PATCH /admin/production/:order_id/stages/:stage_id
 * Update status tahapan produksi oleh admin.
 */
const updateProductionStage = async (req, res) => {
  try {
    const { order_id, stage_id } = req.params;
    const { status, notes } = req.body || {};
    const allowedStatuses = ['pending', 'in_progress', 'completed'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Gunakan: pending, in_progress, atau completed.',
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      select: { id: true, status: true },
    });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.',
      });
    }

    const targetStage = await prisma.productionStage.findUnique({
      where: { id: stage_id },
      select: { id: true, order_index: true, name: true },
    });
    if (!targetStage) {
      return res.status(404).json({
        success: false,
        message: 'Stage tidak ditemukan.',
      });
    }

    // Pastikan status tiap stage untuk order ini tersedia.
    const allStages = await prisma.productionStage.findMany({
      orderBy: { order_index: 'asc' },
      select: { id: true, order_index: true },
    });
    const existingStatuses = await prisma.productionStatus.findMany({
      where: { order_id },
      select: { id: true, stage_id: true },
    });
    const existingStageIds = new Set(existingStatuses.map((s) => s.stage_id));
    const missingStages = allStages.filter((s) => !existingStageIds.has(s.id));
    if (missingStages.length > 0) {
      await Promise.all(
        missingStages.map((stage) =>
          prisma.productionStatus.create({
            data: {
              order_id,
              stage_id: stage.id,
              status: 'pending',
            },
          }),
        ),
      );
    }

    const stageStatuses = await prisma.productionStatus.findMany({
      where: { order_id },
      include: {
        stage: {
          select: { id: true, order_index: true, name: true },
        },
      },
      orderBy: { stage: { order_index: 'asc' } },
    });
    const targetStatus = stageStatuses.find((s) => s.stage_id === stage_id);

    if (!targetStatus) {
      return res.status(404).json({
        success: false,
        message: 'Status stage untuk order ini tidak ditemukan.',
      });
    }

    // Validasi transisi: stage sebelumnya harus completed untuk mulai/selesai.
    if (targetStage.order_index > 1 && (status === 'in_progress' || status === 'completed')) {
      const previousStage = stageStatuses.find((s) => s.stage.order_index === targetStage.order_index - 1);
      if (!previousStage || previousStage.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Tidak bisa lanjut. Stage sebelumnya belum selesai.',
        });
      }
    }

    const now = new Date();
    const updateData = {
      status,
      notes: typeof notes === 'string' ? notes : targetStatus.notes,
    };

    if (status === 'pending') {
      updateData.started_at = null;
      updateData.completed_at = null;
      updateData.duration_minutes = null;
    } else if (status === 'in_progress') {
      updateData.started_at = targetStatus.started_at || now;
      updateData.completed_at = null;
      updateData.duration_minutes = null;
    } else if (status === 'completed') {
      const startedAt = targetStatus.started_at || now;
      const completedAt = now;
      updateData.started_at = startedAt;
      updateData.completed_at = completedAt;
      updateData.duration_minutes = Math.max(1, Math.round((completedAt - startedAt) / 60000));
    }

    const updatedStage = await prisma.productionStatus.update({
      where: { id: targetStatus.id },
      data: updateData,
      include: {
        stage: {
          select: { id: true, name: true, order_index: true },
        },
      },
    });

    let order_completion = null;
    try {
      order_completion = await finalizeOrderFromProduction(order_id);
    } catch (e) {
      console.error('[Admin] finalizeOrderFromProduction:', e);
    }

    return res.status(200).json({
      success: true,
      message: `Stage ${updatedStage.stage.name} berhasil diupdate menjadi ${status}.`,
      production_stage: updatedStage,
      order_completion,
    });
  } catch (error) {
    console.error('[Admin] Update production stage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengupdate stage produksi.',
    });
  }
};

module.exports = {
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
};
