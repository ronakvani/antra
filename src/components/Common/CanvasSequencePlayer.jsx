import React, { useRef, useEffect, useState } from 'react';

/**
 * CanvasSequencePlayer
 * Renders an image sequence onto an HTML5 Canvas locked to scroll.
 * 100% butter smooth forward AND backward scrubbing.
 */
export const CanvasSequencePlayer = ({
  frameCount = 300,
  framePrefix = '/frame2/frame_',
  frameExtension = '.png',
  scrollProgress = 0, // 0.0 to 1.0
  className = "w-full h-full object-cover"
}) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Helper to render a specific frame onto the canvas
  const renderFrameAtIndex = (index) => {
    const canvas = canvasRef.current;
    if (!canvas || imagesRef.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeIndex = Math.min(frameCount - 1, Math.max(0, index));
    const img = imagesRef.current[safeIndex];

    if (img && img.complete && img.naturalWidth > 0) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
  };

  // 1. Preload all frames into memory
  useEffect(() => {
    let active = true;
    const images = [];
    let count = 0;
    let errors = 0;

    setLoadedCount(0);
    setErrorCount(0);
    setIsReady(false);

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(4, '0');
      img.src = `${framePrefix}${paddedIndex}${frameExtension}`;

      img.onload = () => {
        if (!active) return;
        count++;
        setLoadedCount(count);
        if (count === 1) {
          // Immediately draw first frame so the user sees the visual instantly
          renderFrameAtIndex(0);
        }
        if (count + errors >= frameCount) {
          setIsReady(true);
        }
      };

      img.onerror = () => {
        if (!active) return;
        errors++;
        setErrorCount(errors);
        if (count + errors >= frameCount) {
          setIsReady(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      active = false;
    };
  }, [frameCount, framePrefix, frameExtension]);

  // 2. Draw frame instantly whenever scrollProgress changes
  useEffect(() => {
    const targetIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(scrollProgress * (frameCount - 1)))
    );
    renderFrameAtIndex(targetIndex);
  }, [scrollProgress, frameCount, isReady]);

  const hasMissingFrames = errorCount > 0 && loadedCount === 0;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Loading Progress Indicator */}
      {!isReady && !hasMissingFrames && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm">
          <div className="w-56 h-2 bg-neutral-800 rounded-full overflow-hidden mb-3 p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
              style={{ width: `${(loadedCount / frameCount) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-300">
            Preloading Frames: {Math.round((loadedCount / frameCount) * 100)}% ({loadedCount}/{frameCount})
          </span>
        </div>
      )}

      {/* Notice if frames folder is missing */}
      {hasMissingFrames && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-white p-6 text-center">
          <div className="text-amber-400 font-semibold mb-2">Frames Not Found</div>
          <p className="text-xs text-neutral-400 max-w-md mb-3">
            Expected frames at <code className="text-blue-400 font-mono">{framePrefix}0001{frameExtension}</code>.
            Extract your frames with FFmpeg into <code className="text-blue-400 font-mono">public/frames/</code> to enable buttery canvas scrubbing.
          </p>
        </div>
      )}

      {/* High Performance Hardware-Accelerated Canvas */}
      <canvas
        ref={canvasRef}
        className={className}
        style={{ willChange: 'contents' }}
      />
    </div>
  );
};