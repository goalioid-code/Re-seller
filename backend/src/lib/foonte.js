// Menggunakan fetch bawaan Node.js v18+

/**
 * Foonte API Wrapper
 * Digunakan untuk mengirim pesan WhatsApp (OTP, Notifikasi Pesanan)
 */

const sendWhatsApp = async (target, message) => {
  try {
    const token = process.env.FOONTE_API_KEY;
    
    // Jika di development dan token belum diisi, log ke console saja
    if (process.env.NODE_ENV === 'development' && (!token || token === 'YOUR_FOONTE_TOKEN')) {
      console.log(`[Foonte Sim] TO: ${target} | MESSAGE: ${message}`);
      return { status: true, message: 'Simulation success' };
    }

    const response = await fetch('https://api.foonte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: new URLSearchParams({
        target: target,
        message: message,
        countryCode: '62', // Default Indonesia
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Foonte] Error:', error);
    throw error;
  }
};

module.exports = {
  sendWhatsApp,
};
