import fs from 'fs';
import path from 'path';
import { 
  createRazorpayQrCode, 
  getRazorpayQrPayments, 
  getRazorpayQrStatus,
  createRazorpayPaymentLink,
  getRazorpayPaymentLinkStatus,
  calculateInrAmount 
} from './razorpayService.js';

/**
 * Load .env.local directly from disk if process.env is missing keys
 */
function getLocalEnvKeys() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const result = { keyId: '', keySecret: '' };
  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_RAZORPAY_KEY_ID=')) {
          result.keyId = trimmed.split('=')[1].trim();
        } else if (trimmed.startsWith('VITE_RAZORPAY_KEY_SECRET=')) {
          result.keySecret = trimmed.split('=')[1].trim();
        }
      });
    }
  } catch (e) {
    // ignore
  }
  return result;
}

/**
 * Vite Dev Plugin for Razorpay Backend API
 * Exposes endpoints:
 * - GET  /api/razorpay/config-check
 * - POST /api/razorpay/create-qr
 * - GET  /api/razorpay/check-payment?qrId=...
 * - GET  /api/razorpay/qr-status?qrId=...
 */
export function razorpayDevPlugin() {
  return {
    name: 'vite-plugin-razorpay-gateway',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        // Helper to get Razorpay credentials from headers, env or .env.local
        const getCredentials = (body) => {
          const fileKeys = getLocalEnvKeys();
          const keyId = 
            req.headers['x-razorpay-key-id'] || 
            body?.keyId || 
            process.env.RAZORPAY_KEY_ID || 
            process.env.VITE_RAZORPAY_KEY_ID || 
            fileKeys.keyId ||
            '';

          const keySecret = 
            req.headers['x-razorpay-key-secret'] || 
            body?.keySecret || 
            process.env.RAZORPAY_KEY_SECRET || 
            process.env.VITE_RAZORPAY_KEY_SECRET || 
            fileKeys.keySecret ||
            '';

          return { keyId: String(keyId).trim(), keySecret: String(keySecret).trim() };
        };

        // 1. Config Check Endpoint
        if (req.method === 'GET' && url.pathname === '/api/razorpay/config-check') {
          const fileKeys = getLocalEnvKeys();
          const { keyId, keySecret } = getCredentials();
          const isConfigured = Boolean(keyId && keySecret && !keyId.includes('your_') && !keySecret.includes('your_'));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            isConfigured,
            keyIdPrefix: keyId ? keyId.slice(0, 8) + '...' : null
          }));
          return;
        }

        // 2. Create QR Code Endpoint
        if (req.method === 'POST' && url.pathname === '/api/razorpay/create-qr') {
          let bodyData = '';
          req.on('data', chunk => { bodyData += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyData || '{}');
              const { planId = 'pro', userEmail = '' } = body;
              const { keyId, keySecret } = getCredentials(body);

              if (!keyId || !keySecret || keyId.includes('your_')) {
                // If keys not provided yet, calculate values and return graceful mock simulation data
                const calc = calculateInrAmount(planId);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  requiresKeys: true,
                  message: 'Razorpay Key ID and Secret are not configured in .env or request headers.',
                  calculation: calc
                }));
                return;
              }

              // Attempt to create Razorpay Payment Link first (or QR code)
              let paymentLinkResult = null;
              try {
                paymentLinkResult = await createRazorpayPaymentLink({
                  planId,
                  userEmail,
                  keyId,
                  keySecret
                });
              } catch (linkErr) {
                console.warn('[Razorpay Server] Payment link notice, attempting QR code:', linkErr.message);
              }

              if (paymentLinkResult && paymentLinkResult.id) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  isPaymentLink: true,
                  id: paymentLinkResult.id,
                  short_url: paymentLinkResult.short_url,
                  qrCode: {
                    id: paymentLinkResult.id,
                    image_url: null,
                    short_url: paymentLinkResult.short_url
                  },
                  planId,
                  currencyCalculation: calculateInrAmount(planId)
                }));
                return;
              }

              // Fallback to standalone QR Code API if payment link was not returned
              const qrResponse = await createRazorpayQrCode({
                planId,
                userEmail,
                keyId,
                keySecret
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                qrCode: qrResponse,
                id: qrResponse.id,
                planId,
                currencyCalculation: calculateInrAmount(planId)
              }));
            } catch (err) {
              console.error('[Razorpay Server] Error generating QR/Payment Link:', err.message);
              res.statusCode = err.statusCode || 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message,
                details: err.details || null
              }));
            }
          });
          return;
        }

        // 3. Check Payment Status Endpoint
        if (req.method === 'GET' && url.pathname === '/api/razorpay/check-payment') {
          try {
            const qrId = url.searchParams.get('qrId');
            if (!qrId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'qrId is required' }));
              return;
            }

            const { keyId, keySecret } = getCredentials();
            if (!keyId || !keySecret) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, requiresKeys: true }));
              return;
            }

            // Check if this is a payment link (plink_...)
            if (qrId.startsWith('plink_')) {
              const linkStatus = await getRazorpayPaymentLinkStatus({
                paymentLinkId: qrId,
                keyId,
                keySecret
              });

              const isPaid = linkStatus.status === 'paid' || (linkStatus.amount_paid && linkStatus.amount_paid >= linkStatus.amount);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                isPaid,
                status: linkStatus.status,
                paymentLink: linkStatus
              }));
              return;
            }

            const paymentsRes = await getRazorpayQrPayments({ qrId, keyId, keySecret });
            const items = paymentsRes.items || [];
            const capturedPayment = items.find(p => p.status === 'captured');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              isPaid: Boolean(capturedPayment),
              payment: capturedPayment || items[0] || null,
              totalPayments: items.length
            }));
          } catch (err) {
            console.error('[Razorpay Server] Error checking payment:', err.message);
            res.statusCode = err.statusCode || 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 4. Check QR Status Endpoint
        if (req.method === 'GET' && url.pathname === '/api/razorpay/qr-status') {
          try {
            const qrId = url.searchParams.get('qrId');
            if (!qrId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'qrId is required' }));
              return;
            }

            const { keyId, keySecret } = getCredentials();
            const qrRes = await getRazorpayQrStatus({ qrId, keyId, keySecret });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              qr: qrRes,
              isPaid: (qrRes.payments_amount_received || 0) > 0
            }));
          } catch (err) {
            console.error('[Razorpay Server] Error fetching QR status:', err.message);
            res.statusCode = err.statusCode || 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}
