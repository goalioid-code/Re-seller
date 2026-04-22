const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const redis = require('../lib/redis');
const { sendWhatsApp } = require('../lib/foonte');

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

/**
 * POST /dev-auth/login
 * Login tanpa Google OAuth - untuk development/testing
 * Body: { email, password (optional) }
 */
const devLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Dev auth hanya tersedia di mode development.',
      });
    }

    const { email, name = 'Dev User', onboarding_data = null } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi.',
      });
    }

    // Cari atau buat reseller
    let reseller = await prisma.reseller.findFirst({
      where: { email },
      include: { tier: true },
    });

    const isNewUser = !reseller;

    if (!reseller) {
      reseller = await prisma.reseller.create({
        data: {
          google_id: `dev_${email}`,
          email,
          name,
          status: 'active', // Dev: langsung active
          onboarding_data: onboarding_data || null,
        },
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

    // Buat JWT token
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
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
        onboarding_data: reseller.onboarding_data,
      },
    });
  } catch (error) {
    console.error('[Dev Auth] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat login development.',
    });
  }
};

/**
 * POST /dev-auth/register
 * Daftar akun development dengan email dan nama
 * Body: { email, name, phone, address, onboarding_data }
 */
const devRegister = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Dev auth hanya tersedia di mode development.',
      });
    }

    const { email, name, phone = null, address = null, onboarding_data = null } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email dan nama harus diisi.',
      });
    }

    // Check if email sudah ada
    const exists = await prisma.reseller.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    // Buat reseller baru
    const reseller = await prisma.reseller.create({
      data: {
        google_id: `dev_${email}`,
        email,
        name,
        phone,
        address,
        status: 'active', // Dev: langsung active
        onboarding_data: onboarding_data || null,
      },
      include: { tier: true },
    });

    // Buat JWT token
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

    return res.status(201).json({
      success: true,
      message: 'Akun development berhasil dibuat.',
      token,
      reseller: {
        id: reseller.id,
        email: reseller.email,
        full_name: reseller.name,
        phone: reseller.phone,
        address: reseller.address,
        status: reseller.status,
        tier: reseller.tier,
        onboarding_data: reseller.onboarding_data,
      },
    });
  } catch (error) {
    console.error('[Dev Auth] Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat registrasi development.',
    });
  }
};

/**
 * GET /dev-auth/users
 * List semua dev users (untuk testing)
 */
const devListUsers = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Dev auth hanya tersedia di mode development.',
      });
    }

    const users = await prisma.reseller.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        created_at: true,
      },
    });

    return res.status(200).json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('[Dev Auth] List users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar users.',
    });
  }
};

/**
 * POST /auth/whatsapp/request
 * Request OTP via WhatsApp
 */
const requestWhatsAppOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi.' });
    }

    // Format phone to 62...
    let formattedPhone = phone;
    if (phone.startsWith('0')) formattedPhone = '62' + phone.slice(1);
    if (!phone.startsWith('62')) formattedPhone = '62' + phone;

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Simpan di Redis (5 menit)
    await redis.set(`otp:wa:${formattedPhone}`, otp, 'EX', 300);

    // Kirim via Foonte
    const message = `Kode OTP CALSUB Anda adalah: *${otp}*. Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`;
    await sendWhatsApp(formattedPhone, message);

    return res.status(200).json({
      success: true,
      message: 'Kode OTP telah dikirim ke WhatsApp Anda.',
    });
  } catch (error) {
    console.error('[Auth] WA Request error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengirim OTP.' });
  }
};

/**
 * POST /auth/whatsapp/verify
 * Verifikasi OTP dan Login/Register
 */
const verifyWhatsAppOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Nomor WhatsApp dan OTP wajib diisi.' });
    }

    let formattedPhone = phone;
    if (phone.startsWith('0')) formattedPhone = '62' + phone.slice(1);
    if (!phone.startsWith('62')) formattedPhone = '62' + phone;

    // Ambil OTP dari Redis
    const savedOtp = await redis.get(`otp:wa:${formattedPhone}`);

    if (!savedOtp || savedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP salah atau sudah kadaluarsa.' });
    }

    // OTP Benar -> Hapus dari Redis
    await redis.del(`otp:wa:${formattedPhone}`);

    // Cari atau buat reseller berdasarkan nomor HP
    let reseller = await prisma.reseller.findFirst({
      where: { phone: formattedPhone },
    });

    const isNewUser = !reseller;

    if (!reseller) {
      // Untuk register via WA, kita buat dummy email atau biarkan kosong jika schema membolehkan
      // Tapi schema biasanya minta email @unique. Kita buat email dummy phone@calsub.com
      reseller = await prisma.reseller.create({
        data: {
          google_id: `wa_${formattedPhone}`,
          email: `${formattedPhone}@wa.calsub.com`,
          name: `User WA ${formattedPhone.slice(-4)}`,
          phone: formattedPhone,
          status: 'pending', // Baru daftar via WA tetap pending
        },
      });
    }

    // Buat JWT token
    const token = jwt.sign(
      {
        id: reseller.id,
        email: reseller.email,
        phone: reseller.phone,
        status: reseller.status,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      is_new_user: isNewUser,
      reseller,
    });
  } catch (error) {
    console.error('[Auth] WA Verify error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat verifikasi.' });
  }
};

module.exports = {
  googleAuth,
  getMe,
  devLogin,
  devRegister,
  devListUsers,
  requestWhatsAppOTP,
  verifyWhatsAppOTP,
};
