const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifikasi JWT untuk endpoint admin.
 * Mengizinkan role admin dan super_admin.
 */
const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const role = String(decoded?.role || '').toLowerCase();
    const allowedRoles = new Set(['admin', 'super_admin']);

    if (!decoded?.id || !allowedRoles.has(role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses khusus admin.',
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi telah berakhir. Silakan login kembali.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }
};

module.exports = adminAuthMiddleware;
