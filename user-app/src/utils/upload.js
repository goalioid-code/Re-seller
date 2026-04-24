import { getApiBaseUrl, fetchWithTimeout } from '../lib/api';

/**
 * Helper untuk upload file ke Cloudflare R2 melalui Backend API
 * Jangan set Content-Type sendiri: RN harus set boundary untuk multipart; kalau di-set
 * manual, multer di server sering tidak dapat req.file.
 */
export const uploadToR2 = async (fileUri, fileName, folder = 'designs', token) => {
  const apiUrl = getApiBaseUrl();
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName || 'upload.bin',
    type: getMimeType(fileName),
  });
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

const getMimeType = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return 'application/octet-stream';
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'pdf': return 'application/pdf';
    case 'zip': return 'application/zip';
    default: return 'application/octet-stream';
  }
};
