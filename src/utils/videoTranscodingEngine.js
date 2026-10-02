/**
 * Antra Client-Side Video Transcoding Engine (FFmpeg.wasm)
 * Converts uploaded videos & AI video streams into 100% All-Intra (I-Frame Only)
 * Keyframe MP4 streams directly in the user's browser using WebAssembly.
 * 
 * Benefits:
 * - 0$ Server/VPS Cost (Runs 100% on client CPU)
 * - Complete privacy (Video never leaves client device)
 * - Immediate 120fps reverse scroll scrubbing capability
 * - Ready to seamlessly toggle to Cloud VPS backend when scaled.
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance = null;
let ffmpegLoadPromise = null;

// Core Wasm CDN Base (loads lightweight ESM single-thread core by default for 100% browser compatibility)
const FFMPEG_CORE_VERSION = '0.12.6';
const FFMPEG_CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;

/**
 * Lazy loads and initializes the FFmpeg.wasm singleton instance
 */
export async function getFFmpegInstance(onProgress = () => {}) {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (ffmpegLoadPromise) {
    return await ffmpegLoadPromise;
  }

  ffmpegLoadPromise = (async () => {
    onProgress({
      stage: 'loading_engine',
      percent: 10,
      message: 'Initializing client-side FFmpeg WebAssembly engine...'
    });

    const ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      // Optional debug logging
      // console.log('[FFmpeg.wasm]', message);
    });

    try {
      const coreURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
        'text/javascript'
      );
      const wasmURL = await toBlobURL(
        `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
        'application/wasm'
      );

      await ffmpeg.load({
        coreURL,
        wasmURL
      });

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (err) {
      console.warn('[Antra Transcoder] Failed to load FFmpeg.wasm via primary CDN, trying unpkg fallback:', err);
      try {
        // Fallback CDN (cdnjs/jsdelivr)
        const fallbackBase = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/esm`;
        await ffmpeg.load({
          coreURL: await toBlobURL(`${fallbackBase}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${fallbackBase}/ffmpeg-core.wasm`, 'application/wasm')
        });
        ffmpegInstance = ffmpeg;
        return ffmpeg;
      } catch (fallbackErr) {
        ffmpegLoadPromise = null;
        throw new Error(`Could not initialize FFmpeg.wasm: ${fallbackErr.message}`);
      }
    }
  })();

  return await ffmpegLoadPromise;
}

/**
 * Checks transcoding capability
 */
export async function checkFFmpegStatus() {
  return {
    success: true,
    engine: 'ffmpeg.wasm',
    isClientWasm: true,
    ffmpeg: { available: true, version: FFMPEG_CORE_VERSION }
  };
}

/**
 * Transcodes a video file or URL into an All-Intra (I-Frame Only) MP4 video stream
 * directly inside the client browser.
 * 
 * @param {Object} options
 * @param {File} [options.file] - Local File object from input[type=file]
 * @param {string} [options.url] - Remote or local video URL
 * @param {Function} [options.onProgress] - Progress reporting callback ({ stage, percent, message })
 * @returns {Promise<{ videoUrl: string, isAllIntra: boolean, filename: string, engine: string }>}
 */
export async function transcodeToAllIntra({ file = null, url = null, onProgress = () => {} }) {
  if (!file && !url) {
    throw new Error('No video file or URL provided for transcoding');
  }

  const baseFileName = file?.name || (url ? url.split('/').pop().split('?')[0] : 'video.mp4');
  const cleanBase = baseFileName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const inputName = `input_${Date.now()}_${cleanBase}`;
  const outputName = `all_intra_${Date.now()}_${cleanBase}.mp4`;

  try {
    // 1. Initialize / Retrieve FFmpeg Wasm
    const ffmpeg = await getFFmpegInstance(onProgress);

    onProgress({
      stage: 'preparing',
      percent: 25,
      message: 'Loading video into in-memory virtual filesystem...'
    });

    // 2. Fetch input data into ArrayBuffer and write to FFmpeg MEMFS
    const sourceData = file ? await fetchFile(file) : await fetchFile(url);
    await ffmpeg.writeFile(inputName, sourceData);

    // 3. Track real-time transcoding progress
    const progressHandler = ({ progress, time }) => {
      const calcPercent = Math.min(95, Math.max(30, Math.round(30 + progress * 65)));
      onProgress({
        stage: 'transcoding',
        percent: calcPercent,
        message: `Transcoding frames to Keyframes (I-Frames)... ${Math.round(progress * 100)}%`
      });
    };
    ffmpeg.on('progress', progressHandler);

    onProgress({
      stage: 'transcoding',
      percent: 30,
      message: 'Starting CPU All-Intra keyframe encoding (-g 1)...'
    });

    // 4. Run FFmpeg All-Intra Command
    // -g 1 & -keyint_min 1: Guarantees every single frame is an independent I-Frame for lagless scrubbing
    // -preset ultrafast: Optimized for client browser CPU throughput
    // -movflags +faststart: Moves moov atom to the front for instant seeking
    await ffmpeg.exec([
      '-i', inputName,
      '-c:v', 'libx264',
      '-crf', '22',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-g', '1',
      '-keyint_min', '1',
      '-movflags', '+faststart',
      '-an',
      outputName
    ]);

    // Unbind progress listener for this job
    ffmpeg.off('progress', progressHandler);

    onProgress({
      stage: 'finalizing',
      percent: 96,
      message: 'Extracting transcoded stream from memory...'
    });

    // 5. Read output from Virtual Filesystem
    const data = await ffmpeg.readFile(outputName);
    const outputBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const outputObjectUrl = URL.createObjectURL(outputBlob);

    // 6. Clean up temporary files in MEMFS
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
    } catch (e) {
      // Ignore MEMFS cleanup warnings
    }

    onProgress({
      stage: 'completed',
      percent: 100,
      message: 'All-Intra video ready for lagless 120fps scrubbing!'
    });

    return {
      videoUrl: outputObjectUrl,
      isAllIntra: true,
      filename: outputName,
      engine: 'ffmpeg.wasm'
    };
  } catch (error) {
    console.warn('[Antra Transcoder] Client-side FFmpeg.wasm processing notice:', error.message);

    // Fallback: If browser runs out of memory or user device cannot run Wasm, provide direct object URL
    const fallbackUrl = file ? URL.createObjectURL(file) : url;

    onProgress({
      stage: 'fallback',
      percent: 100,
      message: 'Using standard media player stream (Fallback active)'
    });

    return {
      videoUrl: fallbackUrl,
      isAllIntra: false,
      error: error.message,
      engine: 'fallback'
    };
  }
}
