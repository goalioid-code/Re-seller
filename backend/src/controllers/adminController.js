/**
 * Admin Controller
 * Endpoints untuk admin management
 */

const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');

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

    // Update status ke active
    const updated = await prisma.reseller.update({
      where: { id },
      data: {
        status: 'active',
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

module.exports = {
  adminLogin,
  getPendingResellers,
  getAllResellers,
  getResellerDetail,
  approveReseller,
  rejectReseller,
  updateResellerTier,
};
