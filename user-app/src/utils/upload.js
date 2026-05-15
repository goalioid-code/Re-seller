import { Platform } from 'react-native';
import { getApiBaseUrl, fetchWithTimeout } from '../lib/api';

function deriveFileName(uri, fallbackName) {
  const t = fallbackName && String(fallbackName).trim();
  if (t) return t;
  try {
    const raw = String(uri || '').split('/').pop() || 'upload';
    const clean = raw.split('?')[0];
    if (clean && clean.length > 0 && clean.length < 200) return clean;
  } catch {
    /* ignore */
  }
  return 'upload.bin';
}

/**
 * Helper untuk upload file ke Cloudflare R2 melalui Backend API
 * Jangan set Content-Type sendiri: RN harus set boundary untuk multipart; kalau di-set
 * manual, multer di server sering tidak dapat req.file.
 *
 * @param {string} mimeType - dari DocumentPicker (asset.mimeType); penting di Android bila nama file kosong
 */
export const uploadToR2 = async (fileUri, fileName, folder = 'designs', token, mimeType) => {
  const apiUrl = getApiBaseUrl();
  const resolvedName = deriveFileName(fileUri, fileName);
  const type =
    (mimeType && String(mimeType).trim()) || getMimeTypeFromName(resolvedName);

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const resBlob = await fetch(fileUri);
    const blob = await resBlob.blob();
    formData.append('file', blob, resolvedName);
  } else {
    formData.append('file', {
      uri: fileUri,
      name: resolvedName,
      type,
    });
  }
  formData.append('folder', folder);

  const response = await fetchWithTimeout(
    `${apiUrl}/uploads`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
    120000,
  );

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text?.slice(0, 200) || `Upload gagal (HTTP ${response.status})`);
  }
  if (!response.ok) {
    throw new Error(data.message || `Upload gagal (HTTP ${response.status})`);
  }
  if (data.success) {
    return data.url;
  }
  throw new Error(data.message || 'Gagal mengunggah file.');
};

function getMimeTypeFromName(fileName) {
  if (!fileName || typeof fileName !== 'string') return 'application/octet-stream';
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'pdf':
      return 'application/pdf';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
}
