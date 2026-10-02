import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export const VideoJsPlayer = ({
  src,
  currentTime = 0,
  isPlaying = false,
  onLoadedMetadata,
  onTimeUpdate,
  onEnded,
  className = "w-full h-full object-cover pointer-events-none",
  options = {}
}) => {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const canvasRef = useRef(null);
  const displayCanvasRef = useRef(null);
  const frameCacheRef = useRef(new Map());
  const isSelfUpdatingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Decoder-Safe Seeking references to eliminate queue starvation
  const isSeekingRef = useRef(false);
  const pendingSeekRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize Video.js player once
  useEffect(() => {
    if (!containerRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-fill');
    containerRef.current.appendChild(videoElement);

    const initialOptions = {
      autoplay: false,
      controls: false,
      fill: true,
      responsive: true,
      muted: true,
      playsinline: true,
      preload: 'auto',
      sources: src ? [{ src, type: 'video/mp4' }] : [],
      ...options
    };

    const player = (playerRef.current = videojs(videoElement, initialOptions));

    player.on('loadedmetadata', () => {
      if (onLoadedMetadata) {
        onLoadedMetadata(player.duration());
      }
    });

    player.on('timeupdate', () => {
      // Only broadcast time to React if actively playing.
      // During manual scrub or reverse scroll, React/Scroll is master and video seeks passively.
      if (isPlayingRef.current && onTimeUpdate && playerRef.current) {
        isSelfUpdatingRef.current = true;
        const cur = playerRef.current.currentTime();
        onTimeUpdate(cur);
        requestAnimationFrame(() => {
          isSelfUpdatingRef.current = false;
        });
      }

      // Cache frame to memory for smooth reverse scrolling
      try {
        const tech = player.tech({ IWillNotUseThisInPlugins: true });
        const videoEl = tech ? tech.el() : null;
        if (videoEl && videoEl.videoWidth > 0 && canvasRef.current) {
          const secKey = Math.round(videoEl.currentTime * 10) / 10;
          if (!frameCacheRef.current.has(secKey)) {
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoEl.videoWidth;
            canvasRef.current.height = videoEl.videoHeight;
            ctx.drawImage(videoEl, 0, 0);
            if (window.createImageBitmap) {
              createImageBitmap(canvasRef.current).then((bmp) => {
                if (frameCacheRef.current.size > 250) {
                  const firstKey = frameCacheRef.current.keys().next().value;
                  const oldBmp = frameCacheRef.current.get(firstKey);
                  if (oldBmp && oldBmp.close) oldBmp.close();
                  frameCacheRef.current.delete(firstKey);
                }
                frameCacheRef.current.set(secKey, bmp);
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        // Frame capture fallback
      }
    });

    // Handle completed seek: dispatch pending target without queue overflow
    player.on('seeked', () => {
      isSeekingRef.current = false;
      if (pendingSeekRef.current !== null && playerRef.current) {
        const nextTime = pendingSeekRef.current;
        pendingSeekRef.current = null;

        const currentPTime = playerRef.current.currentTime();
        if (Math.abs(currentPTime - nextTime) > 0.03) {
          isSeekingRef.current = true;
          const tech = playerRef.current.tech({ IWillNotUseThisInPlugins: true });
          const videoEl = tech ? tech.el() : null;

          if (videoEl && typeof videoEl.fastSeek === 'function') {
            try {
              videoEl.fastSeek(nextTime);
            } catch (e) {
              playerRef.current.currentTime(nextTime);
            }
          } else {
            playerRef.current.currentTime(nextTime);
          }
        }
      }
    });

    player.on('ended', () => {
      if (onEnded) onEnded();
    });

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
      // Clean up bitmaps
      frameCacheRef.current.forEach((bmp) => {
        if (bmp && bmp.close) bmp.close();
      });
      frameCacheRef.current.clear();
    };
  }, []);

  // Handle source updates
  useEffect(() => {
    const player = playerRef.current;
    if (player && src) {
      player.src({ src });
      frameCacheRef.current.clear();
    }
  }, [src]);

  // Handle play/pause state toggle from Editor
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    if (isPlaying) {
      if (displayCanvasRef.current) {
        displayCanvasRef.current.style.opacity = '0';
      }
      player.playbackRate(1.0);

      // If at or near the end, restart from beginning
      const dur = player.duration() || 20.0;
      if (player.currentTime() >= dur - 0.1) {
        player.currentTime(0);
        if (onTimeUpdate) onTimeUpdate(0);
      }

      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('Video.js play error:', error);
        });
      }
    } else {
      if (!player.paused()) {
        player.pause();
      }
    }
  }, [isPlaying]);

  // Handle Video.js timeline time synchronization & reverse scroll frame rendering
  useEffect(() => {
    const player = playerRef.current;
    if (!player || typeof currentTime !== 'number') return;
    if (isSelfUpdatingRef.current) return;

    const tech = player.tech({ IWillNotUseThisInPlugins: true });
    const videoEl = tech ? tech.el() : null;

    const playerTime = player.currentTime();
    const diff = currentTime - playerTime;
    const absDiff = Math.abs(diff);

    // When actively playing continuously, only respond to macro manual timeline scrubbing jumps
    if (isPlaying) {
      if (displayCanvasRef.current) {
        displayCanvasRef.current.style.opacity = '0';
      }
      if (absDiff > 0.3) {
        player.currentTime(currentTime);
      }
      return;
    }

    // --- PAUSED / SCROLL-DRIVEN SCRUBBING MODE ---
    // 1. Large Macro Jump (> 1.5s)
    if (absDiff > 1.5) {
      if (displayCanvasRef.current) {
        displayCanvasRef.current.style.opacity = '0';
      }
      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        player.currentTime(currentTime);
      } else {
        pendingSeekRef.current = currentTime;
      }
      return;
    }

    // 2. Scrolling FORWARD (diff > 0.04) -> Video.js native playback with adaptive playbackRate
    if (diff > 0.04) {
      if (displayCanvasRef.current) {
        displayCanvasRef.current.style.opacity = '0';
      }
      if (player.paused()) {
        const p = player.play();
        if (p !== undefined) p.catch(() => {});
      }
      const targetRate = Math.min(3.5, Math.max(0.5, diff * 2.2));
      player.playbackRate(targetRate);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        if (playerRef.current && !playerRef.current.paused()) {
          playerRef.current.pause();
        }
      }, 140);
    }
    // 3. Scrolling BACKWARD (diff < -0.04) -> Decoder-Safe Throttled Seek + Instant Cached Frame Paint
    else if (diff < -0.04) {
      if (!player.paused()) player.pause();

      // Instantly paint cached frame to avoid visual stutter while decoder works
      const secKey = Math.round(currentTime * 10) / 10;
      const cachedBmp = frameCacheRef.current.get(secKey);
      if (cachedBmp && displayCanvasRef.current && videoEl) {
        const ctx = displayCanvasRef.current.getContext('2d');
        displayCanvasRef.current.width = videoEl.videoWidth || 1280;
        displayCanvasRef.current.height = videoEl.videoHeight || 720;
        displayCanvasRef.current.style.opacity = '1';
        ctx.drawImage(cachedBmp, 0, 0);
      }

      // Check if hardware video decoder is currently busy with an active seek
      if (!isSeekingRef.current && absDiff > 0.04) {
        isSeekingRef.current = true;
        if (videoEl && typeof videoEl.fastSeek === 'function') {
          try {
            videoEl.fastSeek(currentTime);
          } catch (e) {
            player.currentTime(currentTime);
          }
        } else {
          player.currentTime(currentTime);
        }
      } else {
        // Queue the latest timestamp to be dispatched when the current seek completes
        pendingSeekRef.current = currentTime;
      }
    } else {
      if (absDiff < 0.03 && !player.paused()) {
        player.pause();
      }
    }
  }, [currentTime, isPlaying]);

  return (
    <div data-vjs-player className={`relative overflow-hidden isolate ${className}`}>
      {/* Video.js Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Offscreen frame canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* High-speed GPU cached frame display layer for smooth reverse scrolling */}
      <canvas
        ref={displayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-75 opacity-0 z-0"
      />
    </div>
  );
};
