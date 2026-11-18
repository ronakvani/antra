import path from 'path';
import { 
  getR2Config, 
  uploadVideoWithDeduplication, 
  checkR2ObjectExists, 
  streamR2Video, 
  getR2StorageUsage,
  getR2MediaUrl
} from './r2Service.js';

/**
 * Vite Dev Plugin for Cloudflare R2 Object Storage
 * Provides backend endpoints:
 * - GET  /api/r2/status       - Connectivity and 10GB free tier usage check
 * - GET  /api/r2/check-exists  - Fast pre-upload deduplication check
 * - POST /api/r2/upload        - Video upload with automatic SHA-256 deduplication
 * - GET  /api/r2/stream        - HTTP 206 Partial Content video streaming proxy
 * - GET  /api/r2/stats         - Storage breakdown (raw vs edited videos)
 */
export function r2StorageDevPlugin() {
  return {
    name: 'vite-plugin-cloudflare-r2-storage',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        // 1. Status & Config Endpoint
        if (req.method === 'GET' && url.pathname === '/api/r2/status') {
          try {
            const config = getR2Config();
            const hasKeys = Boolean(config.accountId && config.accessKeyId && config.secretAccessKey && config.bucketName);
            const stats = await getR2StorageUsage();

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              isConfigured: hasKeys,
              bucketName: config.bucketName || null,
              accountId: config.accountId ? config.accountId.slice(0, 8) + '...' : null,
              hasPublicUrl: Boolean(config.publicUrl),
              publicUrl: config.publicUrl || null,
              stats
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 2. Pre-upload Deduplication Check Endpoint
        if (req.method === 'GET' && url.pathname === '/api/r2/check-exists') {
          try {
            const hash = url.searchParams.get('hash');
            const type = url.searchParams.get('type') || 'raw';
            const ext = url.searchParams.get('ext') || '.mp4';
            const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;

            if (!hash) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: 'hash parameter is required' }));
              return;
            }

            const targetKey = `${type}/${hash}${cleanExt}`;
            const check = await checkR2ObjectExists(targetKey);

            if (check && check.exists) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                exists: true,
                deduplicated: true,
                key: targetKey,
                url: getR2MediaUrl(targetKey),
                size: check.contentLength,
                hash,
                type,
                message: 'Video already exists in Cloudflare R2. Reused existing copy.'
              }));
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              exists: false,
              key: targetKey,
              hash,
              type
            }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // 3. Video Upload with Automatic Deduplication Endpoint
        if (req.method === 'POST' && url.pathname === '/api/r2/upload') {
          const type = req.headers['x-video-type'] || 'raw';
          const originalName = decodeURIComponent(req.headers['x-file-name'] || `video_${Date.now()}.mp4`);
          const customHash = req.headers['x-video-hash'] || null;
          const contentType = req.headers['content-type'] || 'video/mp4';

          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);

              if (!buffer || buffer.length === 0) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Empty file payload' }));
                return;
              }

              const result = await uploadVideoWithDeduplication({
                buffer,
                type,
                originalName,
                customHash,
                mimeType: contentType.includes('video') ? contentType : 'video/mp4'
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err) {
              console.error('[Cloudflare R2 Dev Plugin] Upload failed:', err.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: err.message
              }));
            }
          });
          return;
        }

        // 4. Video Streaming Proxy Endpoint (supports Range Header 206)
        if (req.method === 'GET' && url.pathname === '/api/r2/stream') {
          const key = url.searchParams.get('key');
          if (!key) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing object key parameter' }));
            return;
          }

          const rangeHeader = req.headers['range'];
          await streamR2Video({ key, rangeHeader, res });
          return;
        }

        // 5. Storage Stats Endpoint (10GB Free Tier breakdown)
        if (req.method === 'GET' && url.pathname === '/api/r2/stats') {
          try {
            const stats = await getR2StorageUsage();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, stats }));
          } catch (err) {
            res.statusCode = 500;
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
