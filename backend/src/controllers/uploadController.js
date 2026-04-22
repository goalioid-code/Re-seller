const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, bucketName } = require('../lib/r2');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /upload
 * Upload file ke Cloudflare R2
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diunggah.',
      });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const folder = req.body.folder || 'misc';
    const key = `${folder}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await r2Client.send(command);

    // URL publik (asumsi R2 sudah dikoneksikan ke domain/pub-url)
    const publicUrl = `${process.env.R2_PUBLIC_URL || 'https://pub-your-id.r2.dev'}/${key}`;

    return res.status(200).json({
      success: true,
      message: 'File berhasil diunggah.',
      url: publicUrl,
      key: key,
    });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunggah file.',
    });
  }
};

module.exports = {
  uploadFile,
};
