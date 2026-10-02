import fs from 'fs';
import path from 'path';
import { spawn, exec } from 'child_process';
import https from 'https';
import http from 'http';

/**
 * Checks if FFmpeg is installed and accessible in the system PATH
 */
export function checkFFmpegAvailable() {
  return new Promise((resolve) => {
    exec('ffmpeg -version', (error, stdout) => {
      if (error) {
        resolve({ available: false, version: null });
      } else {
        const match = stdout.match(/ffmpeg version\s+([^\s]+)/i);
        const version = match ? match[1] : 'installed';
        resolve({ available: true, version });
      }
    });
  });
}

/**
 * Downloads a remote URL to a local destination file
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Vite Plugin that adds local FFmpeg transcoding endpoints:
 * - GET /api/ffmpeg-status
 * - POST /api/transcode-video
 */
export function ffmpegTranscodePlugin() {
  return {
    name: 'vite-plugin-ffmpeg-transcoder',
    configureServer(server) {
      const publicDir = path.resolve(process.cwd(), 'public');
      const transcodedDir = path.join(publicDir, 'transcoded');
      const tempDir = path.join(publicDir, 'temp');

      // Ensure output directories exist
      if (!fs.existsSync(transcodedDir)) {
        fs.mkdirSync(transcodedDir, { recursive: true });
      }
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);

        // 1. Status Check Endpoint
        if (req.method === 'GET' && url.pathname === '/api/ffmpeg-status') {
          const status = await checkFFmpegAvailable();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            isLocalDev: true,
            ffmpeg: status
          }));
          return;
        }

        // 2. Video Transcoding Endpoint
        if (req.method === 'POST' && url.pathname === '/api/transcode-video') {
          const contentType = req.headers['content-type'] || '';
          const customFilename = req.headers['x-file-name'] || `video_${Date.now()}.mp4`;
          const baseName = path.basename(customFilename, path.extname(customFilename)).replace(/[^a-zA-Z0-9_-]/g, '_');
          const outputFileName = `intra_${Date.now()}_${baseName}.mp4`;
          const outputFilePath = path.join(transcodedDir, outputFileName);
          const relativeOutputUrl = `/transcoded/${outputFileName}`;

          try {
            const status = await checkFFmpegAvailable();
            if (!status.available) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                error: 'FFmpeg is not installed on the host system.',
                isLocalDev: true
              }));
              return;
            }

            let inputFilePath = '';
            let cleanupInput = false;

            if (contentType.includes('application/json')) {
              // Handle JSON payload with videoUrl
              const body = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => {
                  try {
                    resolve(JSON.parse(data));
                  } catch (e) {
                    reject(new Error('Invalid JSON payload'));
                  }
                });
                req.on('error', reject);
              });

              const targetUrl = body.videoUrl;
              if (!targetUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Missing videoUrl parameter' }));
                return;
              }

              if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                // Download remote video
                const tempInput = path.join(tempDir, `download_${Date.now()}.mp4`);
                await downloadFile(targetUrl, tempInput);
                inputFilePath = tempInput;
                cleanupInput = true;
              } else {
                // Local public file
                const cleanRel = targetUrl.startsWith('/') ? targetUrl.slice(1) : targetUrl;
                inputFilePath = path.join(publicDir, cleanRel);
                if (!fs.existsSync(inputFilePath)) {
                  res.statusCode = 404;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: `Local source video not found: ${targetUrl}` }));
                  return;
                }
              }
            } else {
              // Raw binary stream upload
              const tempInput = path.join(tempDir, `upload_${Date.now()}_${baseName}.mp4`);
              const writeStream = fs.createWriteStream(tempInput);
              await new Promise((resolve, reject) => {
                req.pipe(writeStream);
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
              });
              inputFilePath = tempInput;
              cleanupInput = true;
            }

            // Run FFmpeg All-Intra Keyframe Transcoding
            console.log(`[Antra FFmpeg Engine] Transcoding input: ${inputFilePath} -> ${outputFilePath}`);

            const ffmpegArgs = [
              '-y',
              '-i', inputFilePath,
              '-c:v', 'libx264',
              '-crf', '22',
              '-preset', 'veryfast',
              '-pix_fmt', 'yuv420p',
              '-g', '1',
              '-keyint_min', '1',
              '-movflags', '+faststart',
              '-an',
              outputFilePath
            ];

            const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

            let stderrData = '';
            ffmpegProcess.stderr.on('data', (chunk) => {
              stderrData += chunk.toString();
            });

            ffmpegProcess.on('close', (code) => {
              // Clean up temporary downloaded/uploaded input if needed
              if (cleanupInput && fs.existsSync(inputFilePath)) {
                try {
                  fs.unlinkSync(inputFilePath);
                } catch (e) {}
              }

              if (code === 0) {
                console.log(`[Antra FFmpeg Engine] Transcoding completed: ${relativeOutputUrl}`);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  videoUrl: relativeOutputUrl,
                  isAllIntra: true,
                  filename: outputFileName,
                  message: 'Successfully transcoded to All-Intra (I-Frame only) format.'
                }));
              } else {
                console.error(`[Antra FFmpeg Engine] FFmpeg failed with exit code ${code}:`, stderrData);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: `FFmpeg transcoding failed with code ${code}`,
                  details: stderrData.slice(-500)
                }));
              }
            });

            return;
          } catch (err) {
            console.error('[Antra FFmpeg Engine] Server error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: err.message || 'Internal server error during video transcoding'
            }));
            return;
          }
        }

        next();
      });
    }
  };
}
