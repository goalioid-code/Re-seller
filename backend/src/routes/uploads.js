const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/auth');
const { uploadFile } = require('../controllers/uploadController');

// Konfigurasi Multer (In Memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  }
});

// Semua route upload butuh JWT
router.use(authMiddleware);

const runUpload = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) {
      return uploadFile(req, res, next);
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 10MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Gagal menerima file (multipart).',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'Gagal menerima file.',
    });
  });
};

// POST /uploads — Upload single file
router.post('/', runUpload);

module.exports = router;
