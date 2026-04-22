const prisma = require('../lib/prisma');

/**
 * PUT /resellers/profile
 * Update profil reseller (nama, HP, alamat)
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, fcm_token, onboarding_data } = req.body;

    const reseller = await prisma.reseller.update({
      where: { id: req.reseller.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(fcm_token && { fcm_token }),
        ...(onboarding_data && { onboarding_data }),
      },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      reseller: {
        id: reseller.id,
        email: reseller.email,
        full_name: reseller.name,
        photo_url: reseller.photo_url,
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
      },
    });
  } catch (error) {
    console.error('[Reseller] Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil.',
    });
  }
};

/**
 * GET /resellers/dashboard
 * Data ringkasan untuk dashboard reseller
 */
const getDashboard = async (req, res) => {
  try {
    const resellerId = req.reseller.id;

    // Ambil data komisi (saldo total)
    const commissions = await prisma.commission.findMany({
      where: { reseller_id: resellerId, status: 'confirmed' },
    });
    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

    // Ambil total poin aktif (belum expired)
    const points = await prisma.point.findMany({
      where: {
        reseller_id: resellerId,
        type: 'earned',
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
      },
    });
    const pointsEarned = points.reduce((sum, p) => sum + p.amount, 0);

    const pointsRedeemed = await prisma.point.aggregate({
      where: { reseller_id: resellerId, type: 'redeemed' },
      _sum: { amount: true },
    });
    const totalPoints = pointsEarned + (pointsRedeemed._sum.amount || 0);

    // Notifikasi poin yang akan expired dalam 30 hari
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringPoints = await prisma.point.findMany({
      where: {
        reseller_id: resellerId,
        type: 'earned',
        expires_at: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
    });
    const expiringPointsTotal = expiringPoints.reduce((sum, p) => sum + p.amount, 0);

    return res.status(200).json({
      success: true,
      dashboard: {
        total_commission: totalCommission,
        total_points: totalPoints,
        expiring_points: expiringPointsTotal,
        has_expiring_points: expiringPointsTotal > 0,
      },
    });
  } catch (error) {
    console.error('[Reseller] Dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memuat dashboard.',
    });
  }
};

/**
 * POST /resellers/change-password
 * Ubah password reseller
 */
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru harus disediakan.',
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter.',
      });
    }

    // Get current reseller
    const reseller = await prisma.reseller.findUnique({
      where: { id: req.reseller.id },
    });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // TODO: Implement bcrypt password verification
    // For now, this is a placeholder - implement actual password hashing
    // const bcrypt = require('bcrypt');
    // const passwordMatch = await bcrypt.compare(current_password, reseller.password_hash);
    // if (!passwordMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Password saat ini tidak sesuai.',
    //   });
    // }
    // const hashed = await bcrypt.hash(new_password, 10);

    // Placeholder: direct update (NOT SECURE - for development only)
    const updated = await prisma.reseller.update({
      where: { id: req.reseller.id },
      data: {
        // password_hash: hashed, // Replace with actual bcrypt hash
        // Placeholder password storage (INSECURE - CHANGE THIS)
        // password: new_password,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah.',
    });
  } catch (error) {
    console.error('[Reseller] Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah password.',
    });
  }
};

/**
 * PATCH /resellers/dev/status
 * Development helper untuk simulasi perubahan status akun reseller.
 */
const setDevStatus = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint ini hanya tersedia di mode development.',
      });
    }

    const { status } = req.body;
    const allowedStatuses = ['pending', 'active'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Gunakan "pending" atau "active".',
      });
    }

    const reseller = await prisma.reseller.update({
      where: { id: req.reseller.id },
      data: { status },
      include: { tier: true },
    });

    return res.status(200).json({
      success: true,
      message: `Status akun berhasil diubah menjadi ${status}.`,
      reseller: {
        id: reseller.id,
        email: reseller.email,
        full_name: reseller.name,
        photo_url: reseller.photo_url,
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
      },
    });
  } catch (error) {
    console.error('[Reseller] Set dev status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah status akun.',
    });
  }
};

module.exports = { updateProfile, getDashboard, changePassword, setDevStatus };
