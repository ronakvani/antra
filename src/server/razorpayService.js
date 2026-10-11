import https from 'https';

/**
 * Antra Backend Razorpay Service
 * Handles currency conversion (USD to INR/Paise), QR Code creation,
 * order generation, and payment status checks with Razorpay API.
 */

const DEFAULT_USD_TO_INR_RATE = 83.33; // ~$1 = ₹83.33 (approx $4.50 = ~₹375)

// Plan pricing definitions in USD and pre-calculated INR
export const PLAN_PRICE_MAP = {
  pro: {
    usd: 4.50,
    inr: 375,
    name: 'Antra Pro'
  },
  ultra: {
    usd: 19.00,
    inr: 1580,
    name: 'Antra Ultra'
  },
  max: {
    usd: 39.00,
    inr: 3250,
    name: 'Antra Max'
  }
};

/**
 * Helper to calculate amount in INR and paise for Razorpay
 * @param {string|number} planIdOrUsd 
 */
export function calculateInrAmount(planIdOrUsd) {
  if (typeof planIdOrUsd === 'string' && PLAN_PRICE_MAP[planIdOrUsd.toLowerCase()]) {
    const plan = PLAN_PRICE_MAP[planIdOrUsd.toLowerCase()];
    return {
      usd: plan.usd,
      inr: plan.inr,
      paise: Math.round(plan.inr * 100)
    };
  }

  const usdValue = Number(planIdOrUsd) || 4.50;
  const inrValue = Math.round(usdValue * DEFAULT_USD_TO_INR_RATE);
  return {
    usd: usdValue,
    inr: inrValue,
    paise: inrValue * 100
  };
}

/**
 * Generic Razorpay API client using native HTTPS
 */
export function callRazorpayApi({ path, method = 'GET', data = null, keyId, keySecret }) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path,
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errorMsg = parsed.error?.description || parsed.error?.message || `Razorpay error: HTTP ${res.statusCode}`;
            const error = new Error(errorMsg);
            error.statusCode = res.statusCode;
            error.details = parsed;
            reject(error);
          }
        } catch (err) {
          reject(new Error(`Failed to parse Razorpay API response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * 1. Create a UPI QR Code on Razorpay
 */
export async function createRazorpayQrCode({ planId, userEmail, keyId, keySecret }) {
  const { inr, paise, usd } = calculateInrAmount(planId);
  const planName = PLAN_PRICE_MAP[planId]?.name || `Antra ${planId}`;

  // Close QR code after 15 minutes (900 seconds)
  const closeBy = Math.floor(Date.now() / 1000) + 900;

  const payload = {
    type: 'upi_qr',
    name: `Antra - ${planName}`,
    usage: 'single_use',
    fixed_amount: true,
    payment_amount: paise,
    description: `Subscription for ${planName} ($${usd.toFixed(2)} / ₹${inr})`,
    close_by: closeBy,
    notes: {
      plan_id: planId,
      usd_price: String(usd),
      inr_price: String(inr),
      customer_email: userEmail || 'guest@antra.studio'
    }
  };

  return await callRazorpayApi({
    path: '/v1/payments/qr_codes',
    method: 'POST',
    data: payload,
    keyId,
    keySecret
  });
}

/**
 * 2. Fetch payments received on a Razorpay QR Code
 */
export async function getRazorpayQrPayments({ qrId, keyId, keySecret }) {
  return await callRazorpayApi({
    path: `/v1/payments/qr_codes/${encodeURIComponent(qrId)}/payments`,
    method: 'GET',
    keyId,
    keySecret
  });
}

/**
 * 3. Fetch details & current status of a QR Code
 */
export async function getRazorpayQrStatus({ qrId, keyId, keySecret }) {
  return await callRazorpayApi({
    path: `/v1/payments/qr_codes/${encodeURIComponent(qrId)}`,
    method: 'GET',
    keyId,
    keySecret
  });
}
