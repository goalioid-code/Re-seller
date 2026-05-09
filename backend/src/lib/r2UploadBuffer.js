const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { r2Client, bucketName } = require('./r2');
const { v4: uuidv4 } = require('uuid');

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

function isR2Configured() {
  return !!(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_PUBLIC_URL
  );
}

/**
 * Parse field dari client: data URL atau base64 polos.
 * @returns {{ mime: string, buffer: Buffer } | null}
 */
function parseImageBase64Field(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  const dataMatch = trimmed.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (dataMatch) {
    const mime = dataMatch[1];
    const b64 = dataMatch[2].replace(/\s/g, '');
    try {
      const buffer = Buffer.from(b64, 'base64');
      if (buffer.length > MAX_BYTES) return null;
      return { mime: mime || 'image/jpeg', buffer };
    } catch {
      return null;
    }
  }
  try {
    const buffer = Buffer.from(trimmed, 'base64');
    if (buffer.length > MAX_BYTES) return null;
    return { mime: 'image/jpeg', buffer };
  } catch {
    return null;
  }
}

/**
 * Upload buffer ke R2, kembalikan URL publik.
 */
async function uploadBufferToR2(buffer, contentType, folder) {
  if (!isR2Configured()) {
    const e = new Error('R2_NOT_CONFIGURED');
    e.code = 'R2_NOT_CONFIGURED';
    throw e;
  }
  const mime = contentType || 'image/jpeg';
  const ext = mime.includes('png') ? 'png' : 'jpg';
  const safeFolder = String(folder || 'onboarding').replace(/^\/+|\/+$/g, '');
  const key = `${safeFolder}/${uuidv4()}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: mime,
    })
  );

  const base = String(process.env.R2_PUBLIC_URL).replace(/\/$/, '');
  return `${base}/${key}`;
}

module.exports = {
  isR2Configured,
  parseImageBase64Field,
  uploadBufferToR2,
};
