const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const redis = require('../lib/redis');
const { sendWhatsApp } = require('../lib/foonte');
const { sendEmailOTP } = require('../lib/resend');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Schema Prisma untuk `onboarding_data` masih bertipe String (TEXT).
// Helper ini memastikan kalau client kirim object/array, di-stringify dulu
// supaya kompatibel dengan kolom STRING di DB.
const serializeOnboardingData = (data) => {
  if (data === null || data === undefined) return null;
  if (typeof data === 'string') return data;
  try {
    return JSON.stringify(data);
  } catch (e) {
    return null;
  }
};

const { parseImageBase64Field, uploadBufferToR2 } = require('../lib/r2UploadBuffer');

/** Ganti URI file:// di onboarding_data.media dengan URL publik R2 jika client kirim base64. */
async function attachCloudImageUrls(onboardingData, body) {
  let ob = onboardingData;
  if (ob == null) return onboardingData;
  if (typeof ob === 'string') {
    try {
      ob = JSON.parse(ob);
    } catch {
      return onboardingData;
    }
  }
  if (typeof ob !== 'object' || ob === null) return onboardingData;

  const prevMedia = ob.media && typeof ob.media === 'object' ? ob.media : {};
  const out = { ...ob, media: { ...prevMedia } };

  const uploadOne = async (bodyKey, mediaKey) => {
    const raw = body[bodyKey];
    if (!raw || typeof raw !== 'string') return;
    const parsed = parseImageBase64Field(raw);
    if (!parsed?.buffer?.length) return;
    try {
      const folder = bodyKey === 'ktp_image_base64' ? 'onboarding/ktp' : 'onboarding/selfie';
      const url = await uploadBufferToR2(parsed.buffer, parsed.mime, folder);
      out.media[mediaKey] = url;
    } catch (e) {
      if (e.code === 'R2_NOT_CONFIGURED') {
        console.warn('[Dev Auth] R2 belum dikonfigurasi (R2_* + R2_PUBLIC_URL), foto tidak di-upload.');
      } else {
        console.error('[Dev Auth] Upload gambar gagal:', bodyKey, e.message);
      }
    }
  };

  await uploadOne('ktp_image_base64', 'ktpUri');
  await uploadOne('selfie_image_base64', 'selfieUri');

  return out;
}

// =============================================================================
// Password hashing pakai PBKDF2 dari node:crypto (builtin, zero dependency).
// Format: pbkdf2$<iterations>$<saltHex>$<hashHex>
// Lebih aman dari sha256 polos (salted + iterated 100k kali).
// =============================================================================
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

const hashPassword = (plain) => {
  if (!plain || typeof plain !== 'string') {
    throw new Error('Password tidak valid.');
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(plain, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString('hex')}$${hash.toString('hex')}`;
};

const verifyPassword = (plain, stored) => {
  if (!plain || !stored || typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], 'hex');
  const expected = Buffer.from(parts[3], 'hex');
  const actual = crypto.pbkdf2Sync(plain, salt, iterations, expected.length, PBKDF2_DIGEST);
  return crypto.timingSafeEqual(actual, expected);
};

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
          onboarding_data: serializeOnboardingData(onboarding_data),
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
        data: { onboarding_data: serializeOnboardingData(onboarding_data) },
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

    const { email, name = 'Dev User', onboarding_data = null, password = null } = req.body;

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

    // Kalau user sudah punya password_hash di DB, password wajib & harus cocok.
    // Kalau belum (akun lama tanpa password), izinkan login tanpa password
    // supaya tidak break flow lama. Setelah set-password dijalankan, password jadi wajib.
    if (reseller && reseller.password_hash) {
      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi wajib diisi.',
        });
      }
      if (!verifyPassword(password, reseller.password_hash)) {
        return res.status(401).json({
          success: false,
          message: 'Email atau kata sandi salah.',
        });
      }
    }

    const isNewUser = !reseller;

    if (!reseller) {
      reseller = await prisma.reseller.create({
        data: {
          google_id: `dev_${email}`,
          email,
          name,
          status: 'pending', // Tetap pending; admin yang approve.
          onboarding_data: serializeOnboardingData(onboarding_data),
          ...(password ? { password_hash: hashPassword(password) } : {}),
        },
        include: { tier: true },
      });
    } else if (onboarding_data) {
      // Update onboarding data jika ada
      reseller = await prisma.reseller.update({
        where: { id: reseller.id },
        data: { onboarding_data: serializeOnboardingData(onboarding_data) },
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

    const {
      email,
      name,
      phone = null,
      address = null,
      onboarding_data = null,
      password = null,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email dan nama harus diisi.',
      });
    }

    // Validasi password (minimal 6 karakter, opsional untuk backward compatibility).
    if (password !== null && password !== undefined && password !== '') {
      if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi minimal 6 karakter.',
        });
      }
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

    // Buat reseller baru dengan status 'pending'.
    // Reseller harus menunggu admin meng-approve dulu (cek admin-web) sebelum
    // bisa masuk ke (tabs) home. Pending screen di user-app polling /auth/me
    // tiap 10 detik dan auto-redirect saat status sudah jadi 'active'.
    const passwordHash = password ? hashPassword(password) : null;

    let onboardingFinal = await attachCloudImageUrls(onboarding_data, req.body);

    const reseller = await prisma.reseller.create({
      data: {
        google_id: `dev_${email}`,
        email,
        name,
        phone,
        address,
        status: 'pending',
        onboarding_data: serializeOnboardingData(onboardingFinal),
        ...(passwordHash ? { password_hash: passwordHash } : {}),
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
    const isDev = process.env.NODE_ENV === 'development';
    const pgMsg = String(error?.message || '');
    let userMessage = 'Terjadi kesalahan saat registrasi development.';
    if (isDev && pgMsg) {
      if (pgMsg.includes('permission denied for table resellers')) {
        userMessage =
          'Database menolak simpan data (tidak ada hak INSERT ke tabel resellers). Hubungkan ke Postgres sebagai superuser, lalu jalankan isi file backend/scripts/grant-resellers-write.sql — ganti nama user postgres sesuai user di DATABASE_URL backend.';
      } else {
        const firstLine = pgMsg.split('\n').find((l) => l.trim()) || pgMsg;
        userMessage = `Terjadi kesalahan saat registrasi development: ${firstLine}`;
      }
    }
    return res.status(500).json({
      success: false,
      message: userMessage,
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

    const responsePayload = {
      success: true,
      message: 'Kode OTP telah dikirim ke WhatsApp Anda.',
    };

    // Development helper: return OTP in response for local testing.
    if (process.env.NODE_ENV === 'development') {
      responsePayload.dev_otp = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[Auth] WA Request error:', error);
    const devMessage =
      process.env.NODE_ENV === 'development'
        ? (error && error.message) || 'Gagal mengirim OTP.'
        : 'Gagal mengirim OTP.';
    return res.status(500).json({ success: false, message: devMessage });
  }
};

/**
 * POST /auth/whatsapp/verify
 * Verifikasi OTP dan Login/Register
 */
const verifyWhatsAppOTP = async (req, res) => {
  try {
    const { phone, otp, full_name, email } = req.body;
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

    // Cari user by phone
    let reseller = await prisma.reseller.findFirst({
      where: { phone: formattedPhone },
    });

    const isNewUser = !reseller;

    // User baru: wajib isi nama + email dulu
    if (!reseller && (!full_name || !email)) {
      return res.status(200).json({
        success: true,
        needs_profile: true,
        message: 'Lengkapi nama dan email untuk menyelesaikan pendaftaran.',
      });
    }

    if (!reseller) {
      const normalizedEmail = String(email).trim().toLowerCase();
      const existingEmail = await prisma.reseller.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar. Gunakan email lain.',
        });
      }

      reseller = await prisma.reseller.create({
        data: {
          google_id: `wa_${formattedPhone}`,
          email: normalizedEmail,
          name: String(full_name).trim(),
          phone: formattedPhone,
          status: 'pending', // Baru daftar via WA tetap pending
        },
      });
    }

    // OTP Benar dan flow selesai -> Hapus OTP
    await redis.del(`otp:wa:${formattedPhone}`);

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

/**
 * POST /auth/email/request
 * Request OTP via Email
 */
const requestEmailOTP = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const email = String(rawEmail || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(`otp:email:${email}`, otp, 'EX', 300);
    await sendEmailOTP(email, otp);

    const responsePayload = {
      success: true,
      message: 'Kode OTP telah dikirim ke email Anda.',
    };

    if (process.env.NODE_ENV === 'development') {
      responsePayload.dev_otp = otp;
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('[Auth] Email Request error:', error);
    const devMessage =
      process.env.NODE_ENV === 'development'
        ? (error && error.message) || 'Gagal mengirim OTP email.'
        : 'Gagal mengirim OTP email.';
    return res.status(500).json({ success: false, message: devMessage });
  }
};

/**
 * POST /auth/email/verify
 * Verifikasi OTP email dan login/register
 */
const verifyEmailOTP = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const email = String(rawEmail || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const fullName = String(req.body?.full_name || '').trim();
    const rawPhone = String(req.body?.phone || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email dan OTP wajib diisi.' });
    }

    const savedOtp = await redis.get(`otp:email:${email}`);
    if (!savedOtp || savedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Kode OTP salah atau sudah kadaluarsa.' });
    }

    let reseller = await prisma.reseller.findUnique({
      where: { email },
    });

    const isNewUser = !reseller;
    if (!reseller && !fullName) {
      return res.status(200).json({
        success: true,
        needs_profile: true,
        message: 'Lengkapi nama untuk menyelesaikan pendaftaran.',
      });
    }

    let phone = rawPhone || null;
    if (phone) {
      if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
      if (!phone.startsWith('62')) phone = `62${phone}`;
    }

    if (!reseller) {
      reseller = await prisma.reseller.create({
        data: {
          google_id: `email_${email}`,
          email,
          name: fullName,
          phone,
          status: 'pending',
        },
      });
    } else if (fullName || phone) {
      reseller = await prisma.reseller.update({
        where: { id: reseller.id },
        data: {
          name: fullName || reseller.name,
          phone: phone || reseller.phone,
        },
      });
    }

    await redis.del(`otp:email:${email}`);

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
    console.error('[Auth] Email Verify error:', error);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat verifikasi email.' });
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
  requestEmailOTP,
  verifyEmailOTP,
};
