/**
 * Cloudflare R2 Client-Side Storage Integration with SHA-256 Content Deduplication
 * Guarantees zero duplicate storage consumption on Cloudflare R2's 10GB free tier.
 */

/**
 * Computes SHA-256 hash of a Blob or File using Web Crypto API
 * @param {Blob|File} blob 
 * @returns {Promise<string>} Hexadecimal SHA-256 hash
 */
export async function computeBlobSha256(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if Cloudflare R2 is configured and reachable
 */
export async function checkR2Status() {
  try {
    const res = await fetch('/api/r2/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: false,
      isConfigured: false,
      error: err.message
    };
  }
}

/**
 * Checks if a video with the specified hash already exists in Cloudflare R2
 * @param {string} hash - SHA-256 hash string
 * @param {'raw'|'edited'} [type='raw'] - Video type
 * @param {string} [ext='.mp4'] - File extension
 */
export async function checkR2VideoExists(hash, type = 'raw', ext = '.mp4') {
  try {
    const params = new URLSearchParams({ hash, type, ext });
    const res = await fetch(`/api/r2/check-exists?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, exists: false, error: err.message };
  }
}

/**
 * Uploads a video (raw or edited) to Cloudflare R2 with strict deduplication.
 * If the video is already present in R2, the upload is skipped entirely, saving bandwidth
 * and avoiding duplicate storage in the 10GB free tier.
 * 
 * @param {Blob|File} fileOrBlob - Video file or transcoded blob
 * @param {Object} options
 * @param {'raw'|'edited'} [options.type='raw'] - 'raw' for uploaded source video, 'edited' for transcoded All-Intra video
 * @param {string} [options.fileName] - Original file name
 * @param {Function} [options.onProgress] - Progress status callback
 * @returns {Promise<{ success: boolean, deduplicated: boolean, url: string, key: string, size: number, hash: string, message: string }>}
 */
export async function syncVideoToR2(fileOrBlob, {
  type = 'raw',
  fileName = 'video.mp4',
  onProgress = () => {}
} = {}) {
  try {
    onProgress({ stage: 'hashing', message: 'Verifying video integrity (computing SHA-256)...' });

    // 1. Calculate SHA-256 hash
    const hash = await computeBlobSha256(fileOrBlob);
    const ext = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '.mp4';

    onProgress({ stage: 'checking', message: 'Checking Cloudflare R2 deduplication cache...' });

    // 2. Pre-check: Does this exact video already exist in R2?
    const check = await checkR2VideoExists(hash, type, ext);
    if (check && check.exists) {
      console.log(`[Antra R2 Storage] Video already exists in Cloudflare R2: "${check.key}". Skipped duplicate upload (Zero storage added).`);
      
      onProgress({ 
        stage: 'deduplicated', 
        message: 'Video already available in Cloudflare R2. Reused existing copy without consuming 10GB storage.' 
      });

      return {
        success: true,
        deduplicated: true,
        url: check.url,
        key: check.key,
        size: check.size || fileOrBlob.size,
        hash,
        type,
        message: 'Reused existing video copy in Cloudflare R2 (deduplicated).'
      };
    }

    onProgress({ stage: 'uploading', message: `Syncing ${type} video to Cloudflare R2 storage...` });

    // 3. Upload to Cloudflare R2 via Backend API
    const response = await fetch('/api/r2/upload', {
      method: 'POST',
      headers: {
        'x-video-type': type,
        'x-file-name': encodeURIComponent(fileName),
        'x-video-hash': hash,
        'content-type': fileOrBlob.type || 'video/mp4'
      },
      body: fileOrBlob
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `R2 Upload failed with HTTP ${response.status}`);
    }

    const result = await response.json();

    onProgress({ 
      stage: 'completed', 
      message: result.deduplicated 
        ? 'Deduplicated: Reused existing R2 video copy.' 
        : `Successfully stored in Cloudflare R2 (${(fileOrBlob.size / (1024 * 1024)).toFixed(1)} MB).`
    });

    return result;
  } catch (err) {
    console.warn('[Antra R2 Storage] R2 sync notice:', err.message);
    return {
      success: false,
      deduplicated: false,
      error: err.message,
      fallbackUrl: URL.createObjectURL(fileOrBlob)
    };
  }
}

/**
 * Fetches current Cloudflare R2 storage breakdown (vs 10GB free tier)
 */
export async function getR2StorageBreakdown() {
  try {
    const res = await fetch('/api/r2/stats');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
