const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * POST /auth/google
 * Menerima Google ID Token dari mobile app, verifikasi, dan kembalikan JWT
 */
const googleAuth = async (req, res) => {
  try {
    const { id_token, onboarding_data } = req.body;

    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token wajib diisi.',
      });
    }

    let google_id, email, name, photo_url;
    const isDevMockToken = id_token.startsWith('mock_id_token_');

    // 1. Verifikasi token Google atau gunakan mock untuk development
    if (isDevMockToken && process.env.NODE_ENV === 'development') {
      // Mock token untuk development - skip Google verification
      console.log('[Auth] Using mock token for development');
      // Keep mock identity stable across app restarts/taps to avoid duplicate account collisions.
      google_id = 'dev_mock_default';
      email = 'dev-tester@calsub.local';
      name = 'Dev Tester';
      photo_url = null;
    } else {
      // Production: verifikasi dengan Google
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      google_id = payload.sub;
      email = payload.email;
      name = payload.name;
      photo_url = payload.picture;
    }

    // 2. Cari atau buat reseller baru
    let reseller = await prisma.reseller.findFirst({
      where: {
        OR: [{ google_id }, { email }],
      },
      include: { tier: true },
    });

    const isNewUser = !reseller;

    if (!reseller) {
      // Buat akun baru, status = active (untuk dev) atau pending (untuk prod)
      const status = process.env.NODE_ENV === 'development' ? 'active' : 'pending';
      reseller = await prisma.reseller.create({
        data: {
          google_id,
          email,
          name,
          photo_url,
          status,
          onboarding_data: onboarding_data || null,
        },
        include: { tier: true },
      });
    } else if (reseller.google_id !== google_id) {
      // Keep identity consistent if email already exists (common in development mock flow).
      reseller = await prisma.reseller.update({
        where: { id: reseller.id },
        data: { google_id },
        include: { tier: true },
      });
    } else if (onboarding_data) {
      // Update onboarding data jika ada
      reseller = await prisma.reseller.update({
        where: { id: reseller.id },
        data: { onboarding_data },
        include: { tier: true },
      });
    }

    // 3. Buat JWT token
    const token = jwt.sign(
      {
        id: reseller.id,
        google_id: reseller.google_id,
        email: reseller.email,
        full_name: reseller.name,
        status: reseller.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      is_new_user: isNewUser,
      token,
      reseller: {
        id: reseller.id,
        email: reseller.email,
        full_name: reseller.name,
        photo_url: reseller.photo_url,
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
        onboarding_data: reseller.onboarding_data,
      },
    });
  } catch (error) {
    console.error('[Auth] Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat autentikasi. Silakan coba lagi.',
    });
  }
};

/**
 * GET /auth/me
 * Mendapatkan data reseller yang sedang login (butuh JWT)
 */
const getMe = async (req, res) => {
  try {
    const reseller = await prisma.reseller.findUnique({
      where: { id: req.reseller.id },
      include: { tier: true },
    });

    if (!reseller) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      reseller: {
        id: reseller.id,
        email: reseller.email,
        full_name: reseller.name,
        photo_url: reseller.photo_url,
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
        onboarding_data: reseller.onboarding_data,
        created_at: reseller.created_at,
      },
    });
  } catch (error) {
    console.error('[Auth] Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
    });
  }
};

module.exports = { googleAuth, getMe };
