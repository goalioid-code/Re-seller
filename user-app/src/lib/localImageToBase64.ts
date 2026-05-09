/**
 * Baca file lokal (file://) jadi data URL base64 untuk dikirim ke API.
 * Dipakai saat submit onboarding supaya backend bisa upload ke R2.
 */
export async function localFileUriToDataUrl(uri: string): Promise<string> {
  if (!uri || typeof uri !== 'string') {
    throw new Error('URI tidak valid');
  }
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Gagal membaca file: ${response.status}`);
  }
  const blob = await response.blob();
  const mime = blob.type || 'image/jpeg';

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca gambar'));
    reader.readAsDataURL(blob);
  });

  if (!dataUrl.startsWith('data:')) {
    throw new Error('Format gambar tidak didukung');
  }
  if (mime && !dataUrl.startsWith(`data:${mime}`)) {
    const base64 = dataUrl.split(',')[1];
    return `data:${mime};base64,${base64}`;
  }
  return dataUrl;
}
