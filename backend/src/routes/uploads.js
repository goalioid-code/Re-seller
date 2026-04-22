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

// POST /uploads — Upload single file
router.post('/', upload.single('file'), uploadFile);

module.exports = router;
