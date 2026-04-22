/**
 * Helper untuk upload file ke Cloudflare R2 melalui Backend API
 */
export const uploadToR2 = async (fileUri, fileName, folder = 'designs', token) => {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Siapkan FormData
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: getMimeType(fileName),
    });
    formData.append('folder', folder);

    const response = await fetch(`${apiUrl}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.url; // Mengembalikan URL publik file
    } else {
      throw new Error(data.message || 'Gagal mengunggah file.');
    }
  } catch (error) {
    console.error('[UploadToR2] Error:', error);
    throw error;
  }
};

const getMimeType = (fileName) => {
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
