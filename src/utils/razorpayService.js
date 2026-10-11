import QRCode from 'qrcode';

/**
 * Antra Client Razorpay Service
 * Interacts with /api/razorpay endpoints and handles UPI Intent/QR generation.
 */

const LOCAL_STORAGE_KEY_ID = 'antra_razorpay_key_id';
const LOCAL_STORAGE_KEY_SECRET = 'antra_razorpay_key_secret';

export function getRazorpayClientCredentials() {
  const envKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
  const envKeySecret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || '';
  const localKeyId = localStorage.getItem(LOCAL_STORAGE_KEY_ID) || '';
  const localKeySecret = localStorage.getItem(LOCAL_STORAGE_KEY_SECRET) || '';

  const keyId = (localKeyId || envKeyId || '').trim();
  const keySecret = (localKeySecret || envKeySecret || '').trim();

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('your_') &&
    !keySecret.includes('your_')
  );

  return { keyId, keySecret, isConfigured };
}

export function saveRazorpayClientCredentials(keyId, keySecret) {
  if (keyId) localStorage.setItem(LOCAL_STORAGE_KEY_ID, keyId.trim());
  if (keySecret) localStorage.setItem(LOCAL_STORAGE_KEY_SECRET, keySecret.trim());
}

/**
 * Helper to generate a client-side Data URL QR code from any UPI string
 */
export async function generateQrDataUrl(text) {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return null;
  }
}

/**
 * Fallback generator for standard UPI string when offline or keys missing
 */
export function buildStandardUpiString({ payeeVpa = 'antra@razorpay', payeeName = 'Antra Studio', amountInr = 375, note = 'Antra Plan' }) {
  const cleanVpa = encodeURIComponent(payeeVpa);
  const cleanName = encodeURIComponent(payeeName);
  const cleanNote = encodeURIComponent(note);
  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${amountInr}&cu=INR&tn=${cleanNote}`;
}

/**
 * Request Razorpay QR code creation from backend
 */
export async function requestRazorpayQr({ planId, userEmail }) {
  const { keyId, keySecret } = getRazorpayClientCredentials();

  const headers = { 'Content-Type': 'application/json' };
  if (keyId) headers['x-razorpay-key-id'] = keyId;
  if (keySecret) headers['x-razorpay-key-secret'] = keySecret;

  const res = await fetch('/api/razorpay/create-qr', {
    method: 'POST',
    headers,
    body: JSON.stringify({ planId, userEmail, keyId, keySecret })
  });

  return await res.json();
}

/**
 * Poll payment status for a specific QR Code ID
 */
export async function checkRazorpayPaymentStatus(qrId) {
  if (!qrId) return { success: false, isPaid: false };
  const { keyId, keySecret } = getRazorpayClientCredentials();

  const headers = {};
  if (keyId) headers['x-razorpay-key-id'] = keyId;
  if (keySecret) headers['x-razorpay-key-secret'] = keySecret;

  const res = await fetch(`/api/razorpay/check-payment?qrId=${encodeURIComponent(qrId)}`, {
    headers
  });

  return await res.json();
}
