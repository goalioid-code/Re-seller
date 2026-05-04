/**
 * Resend API helper untuk kirim OTP email.
 */
const sendEmailOTP = async (email, otpCode) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (process.env.NODE_ENV === 'development' && !apiKey) {
    console.log(`[Resend Sim] TO: ${email} | OTP: ${otpCode}`);
    return { success: true, simulated: true };
  }

  if (!apiKey) {
    throw new Error('RESEND_API_KEY belum diatur.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [email],
      subject: 'Kode OTP CALSUB',
      text: `Kode OTP CALSUB Anda: ${otpCode}. Kode ini berlaku selama 5 menit. Jangan bagikan kepada siapapun.`,
      html: `<p>Kode OTP CALSUB Anda: <strong>${otpCode}</strong></p><p>Kode ini berlaku selama 5 menit. Jangan bagikan kepada siapapun.</p>`,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(`Resend error: ${reason}`);
  }

  return data;
};

module.exports = {
  sendEmailOTP,
};
