import { 
  createRazorpayQrCode, 
  getRazorpayQrPayments, 
  getRazorpayQrStatus,
  calculateInrAmount 
} from './razorpayService.js';

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

        // Helper to get Razorpay credentials from headers, env or process
        const getCredentials = (body) => {
          const keyId = 
            req.headers['x-razorpay-key-id'] || 
            body?.keyId || 
            process.env.RAZORPAY_KEY_ID || 
            process.env.VITE_RAZORPAY_KEY_ID || 
            '';

          const keySecret = 
            req.headers['x-razorpay-key-secret'] || 
            body?.keySecret || 
            process.env.RAZORPAY_KEY_SECRET || 
            process.env.VITE_RAZORPAY_KEY_SECRET || 
            '';

          return { keyId: String(keyId).trim(), keySecret: String(keySecret).trim() };
        };

        // 1. Config Check Endpoint
        if (req.method === 'GET' && url.pathname === '/api/razorpay/config-check') {
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
                planId,
                currencyCalculation: calculateInrAmount(planId)
              }));
            } catch (err) {
              console.error('[Razorpay Server] Error generating QR code:', err.message);
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
