import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ffmpegTranscodePlugin } from './src/server/ffmpegDevPlugin.js';
import { razorpayDevPlugin } from './src/server/razorpayDevPlugin.js';
import { r2StorageDevPlugin } from './src/server/r2StorageDevPlugin.js';

export default defineConfig({
  plugins: [
    react(),
    ffmpegTranscodePlugin(),
    razorpayDevPlugin(),
    r2StorageDevPlugin()
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    port: 7889,
    open: true
  }
});
