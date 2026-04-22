const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Cloudflare R2 Client (S3 Compatible)
 * Digunakan untuk upload file desain dan mockup
 */

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  r2Client,
  bucketName: process.env.R2_BUCKET_NAME || 'calsub-reseller',
};
