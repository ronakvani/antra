import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  S3Client, 
  HeadObjectCommand, 
  PutObjectCommand, 
  GetObjectCommand, 
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';

/**
 * Load Cloudflare R2 environment credentials from disk (.env.local or .env) or process.env
 */
export function getR2Config() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envMainPath = path.resolve(process.cwd(), '.env');

  const config = {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID || '',
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || '',
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || ''
  };

  const parseFile = (filePath) => {
    if (!fs.existsSync(filePath)) return;
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [rawKey, ...rest] = trimmed.split('=');
        const key = rawKey.trim();
        const val = rest.join('=').trim().replace(/^["']|["']$/g, '');

        if (key === 'CLOUDFLARE_R2_ACCOUNT_ID' || key === 'VITE_CLOUDFLARE_R2_ACCOUNT_ID') {
          if (!config.accountId) config.accountId = val;
        } else if (key === 'CLOUDFLARE_R2_ACCESS_KEY_ID' || key === 'VITE_CLOUDFLARE_R2_ACCESS_KEY_ID') {
          if (!config.accessKeyId) config.accessKeyId = val;
        } else if (key === 'CLOUDFLARE_R2_SECRET_ACCESS_KEY' || key === 'VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY') {
          if (!config.secretAccessKey) config.secretAccessKey = val;
        } else if (key === 'CLOUDFLARE_R2_BUCKET_NAME' || key === 'VITE_CLOUDFLARE_R2_BUCKET_NAME') {
          if (!config.bucketName) config.bucketName = val;
        } else if (key === 'CLOUDFLARE_R2_PUBLIC_URL' || key === 'VITE_CLOUDFLARE_R2_PUBLIC_URL') {
          if (!config.publicUrl) config.publicUrl = val;
        }
      });
    } catch (e) {
      // ignore
    }
  };

  parseFile(envPath);
  parseFile(envMainPath);

  return config;
}

/**
 * Creates or retrieves the S3 Client configured for Cloudflare R2
 */
let cachedS3Client = null;
let lastClientKey = '';

export function getR2Client() {
  const config = getR2Config();
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  const clientKey = `${config.accountId}:${config.accessKeyId}`;
  if (cachedS3Client && lastClientKey === clientKey) {
    return cachedS3Client;
  }

  cachedS3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
  lastClientKey = clientKey;

  return cachedS3Client;
}

/**
 * Calculates cryptographic SHA-256 hash of a buffer
 */
export function computeBufferSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Checks whether an object with given key or hash exists in Cloudflare R2
 * Returns object metadata if found, null otherwise.
 */
export async function checkR2ObjectExists(key) {
  const client = getR2Client();
  const config = getR2Config();
  if (!client || !config.bucketName) {
    return null;
  }

  try {
    const cmd = new HeadObjectCommand({
      Bucket: config.bucketName,
      Key: key
    });
    const res = await client.send(cmd);
    return {
      exists: true,
      key,
      contentLength: res.ContentLength,
      contentType: res.ContentType,
      etag: res.ETag,
      lastModified: res.LastModified,
      metadata: res.Metadata || {}
    };
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return { exists: false, key };
    }
    // Network or permission warning
    console.warn(`[Cloudflare R2] HeadObject notice for ${key}:`, err.message);
    return { exists: false, key, error: err.message };
  }
}

/**
 * Resolves the public URL or proxy stream URL for a given R2 object key
 */
export function getR2MediaUrl(key) {
  const config = getR2Config();
  if (config.publicUrl) {
    const cleanBase = config.publicUrl.replace(/\/+$/, '');
    const cleanKey = key.replace(/^\/+/, '');
    return `${cleanBase}/${cleanKey}`;
  }
  // Internal proxy streaming URL
  return `/api/r2/stream?key=${encodeURIComponent(key)}`;
}

/**
 * Uploads a video to Cloudflare R2 with strict content-addressable deduplication.
 * If the exact video already exists in R2, upload is skipped and the existing URL is returned.
 * 
 * @param {Object} params
 * @param {Buffer} params.buffer - Video file buffer
 * @param {string} [params.type='raw'] - Video category: 'raw' or 'edited'
 * @param {string} [params.originalName='video.mp4'] - Original source filename
 * @param {string} [params.customHash] - Pre-computed SHA-256 hash (optional)
 * @param {string} [params.mimeType='video/mp4'] - MIME type
 * @returns {Promise<{ success: boolean, deduplicated: boolean, key: string, url: string, size: number, hash: string, message: string }>}
 */
export async function uploadVideoWithDeduplication({
  buffer,
  type = 'raw',
  originalName = 'video.mp4',
  customHash = null,
  mimeType = 'video/mp4'
}) {
  const client = getR2Client();
  const config = getR2Config();

  if (!client || !config.bucketName) {
    throw new Error('Cloudflare R2 is not configured. Please set your R2 credentials in .env.local.');
  }

  // 1. Calculate SHA-256 hash of the video content
  const hash = customHash || computeBufferSha256(buffer);
  const ext = path.extname(originalName) || '.mp4';
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;

  // Content-addressable key pattern: raw/{hash}.mp4 or edited/{hash}.mp4
  const targetKey = `${type}/${hash}${cleanExt}`;

  // 2. DEDUPLICATION CHECK: Check if the exact video already exists in Cloudflare R2
  const checkResult = await checkR2ObjectExists(targetKey);

  if (checkResult && checkResult.exists) {
    console.log(`[Cloudflare R2] Deduplication active: Video ${originalName} (hash: ${hash.slice(0, 12)}...) already exists at "${targetKey}". Zero extra storage used!`);
    
    return {
      success: true,
      deduplicated: true,
      key: targetKey,
      url: getR2MediaUrl(targetKey),
      size: checkResult.contentLength || buffer.length,
      hash,
      originalName,
      type,
      message: 'Video already exists in Cloudflare R2. Reused existing storage copy (deduplicated).'
    };
  }

  // 3. Upload new video to Cloudflare R2
  console.log(`[Cloudflare R2] Storing new ${type} video: "${targetKey}" (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)...`);

  const putCmd = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: targetKey,
    Body: buffer,
    ContentType: mimeType,
    Metadata: {
      'original-name': encodeURIComponent(originalName),
      'sha256-hash': hash,
      'video-type': type,
      'upload-timestamp': new Date().toISOString()
    }
  });

  await client.send(putCmd);

  console.log(`[Cloudflare R2] Successfully uploaded to "${targetKey}".`);

  return {
    success: true,
    deduplicated: false,
    key: targetKey,
    url: getR2MediaUrl(targetKey),
    size: buffer.length,
    hash,
    originalName,
    type,
    message: `Uploaded new ${type} video to Cloudflare R2.`
  };
}

/**
 * Streams an object directly from R2, supporting HTTP Range requests for video scrubbing.
 */
export async function streamR2Video({ key, rangeHeader, res }) {
  const client = getR2Client();
  const config = getR2Config();

  if (!client || !config.bucketName) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Cloudflare R2 client is not configured' }));
    return;
  }

  try {
    const cmdInput = {
      Bucket: config.bucketName,
      Key: key
    };

    if (rangeHeader) {
      cmdInput.Range = rangeHeader;
    }

    const command = new GetObjectCommand(cmdInput);
    const response = await client.send(command);

    if (rangeHeader && response.ContentRange) {
      res.statusCode = 206;
      res.setHeader('Content-Range', response.ContentRange);
    } else {
      res.statusCode = 200;
    }

    res.setHeader('Content-Type', response.ContentType || 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    if (response.ContentLength !== undefined) {
      res.setHeader('Content-Length', response.ContentLength);
    }
    if (response.ETag) {
      res.setHeader('ETag', response.ETag);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    // Pipe response stream to client
    response.Body.pipe(res);
  } catch (err) {
    console.error(`[Cloudflare R2] Stream error for ${key}:`, err.message);
    if (!res.headersSent) {
      res.statusCode = err.$metadata?.httpStatusCode || 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

/**
 * Computes storage stats from R2 bucket to track usage against the 10GB free tier.
 */
export async function getR2StorageUsage() {
  const client = getR2Client();
  const config = getR2Config();

  if (!client || !config.bucketName) {
    return {
      isConfigured: false,
      bucketName: config.bucketName || '',
      totalBytes: 0,
      totalMb: '0.00',
      totalGb: '0.000',
      freeTierLimitGb: 10,
      percentUsed: '0.00',
      rawVideosCount: 0,
      editedVideosCount: 0,
      totalFiles: 0,
      files: []
    };
  }

  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 1000
    });
    const result = await client.send(listCmd);

    const contents = result.Contents || [];
    let totalBytes = 0;
    let rawCount = 0;
    let editedCount = 0;

    const files = contents.map((item) => {
      totalBytes += item.Size || 0;
      if (item.Key?.startsWith('raw/')) rawCount++;
      if (item.Key?.startsWith('edited/') || item.Key?.startsWith('transcoded/')) editedCount++;

      return {
        key: item.Key,
        size: item.Size,
        lastModified: item.LastModified,
        etag: item.ETag
      };
    });

    const freeTierBytes = 10 * 1024 * 1024 * 1024; // 10 GB in bytes
    const percentUsed = ((totalBytes / freeTierBytes) * 100).toFixed(2);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);
    const totalGb = (totalBytes / (1024 * 1024 * 1024)).toFixed(3);

    return {
      isConfigured: true,
      bucketName: config.bucketName,
      accountIdPrefix: config.accountId ? config.accountId.slice(0, 6) + '...' : '',
      totalBytes,
      totalMb,
      totalGb,
      freeTierLimitGb: 10,
      freeTierRemainingMb: ((freeTierBytes - totalBytes) / (1024 * 1024)).toFixed(2),
      percentUsed,
      rawVideosCount: rawCount,
      editedVideosCount: editedCount,
      totalFiles: contents.length,
      files
    };
  } catch (err) {
    console.error('[Cloudflare R2] ListObjects error:', err.message);
    return {
      isConfigured: true,
      bucketName: config.bucketName,
      error: err.message,
      totalBytes: 0,
      totalMb: '0.00',
      percentUsed: '0.00'
    };
  }
}
