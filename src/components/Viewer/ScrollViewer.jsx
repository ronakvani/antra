import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ArrowLeft } from 'lucide-react';
import { VideoJsPlayer } from '../Common/VideoJsPlayer';
import { CanvasSequencePlayer } from '../Common/CanvasSequencePlayer';
import { computeOpenReelMotionState } from '../../utils/openreelAnimationEngine';
import { getPenpotNodeLayoutStyle } from '../../utils/penpotCodeEngine';
import { PenpotComponentRenderer } from '../Editor/PenpotComponentRenderer';

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export const ScrollViewer = () => {
  const { videoSrc, manifest, setViewMode } = useEditor();
  const containerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20.0);
  const [playbackMode, setPlaybackMode] = useState('canvas'); // 'canvas' | 'video'

  // References for smooth Lerp (Linear Interpolation) physics loop
  const targetTimeRef = useRef(0);
  const lerpedTimeRef = useRef(0);
  const lastEmittedTimeRef = useRef(0);

  const scrollRatio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;

  useEffect(() => {
    let animFrameId;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = window.scrollY;
      const scrollRatio = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      targetTimeRef.current = scrollRatio * duration;
    };

    // Passive scroll event listener to update target destination
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 60-120fps Damped Lerp Animation Loop (Smooth Momentum like Senbuzy)
    const lerpFactor = 0.08; // Damping constant: lower = floatier, higher = snappier
    const loop = () => {
      const target = targetTimeRef.current;
      const current = lerpedTimeRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.0005) {
        lerpedTimeRef.current += diff * lerpFactor;
      } else {
        lerpedTimeRef.current = target;
      }

      // Throttle React state updates to avoid excessive re-render churn
      const timeDiff = Math.abs(lerpedTimeRef.current - lastEmittedTimeRef.current);
      if (timeDiff >= 0.015 || (Math.abs(diff) < 0.0005 && timeDiff > 0.001)) {
        lastEmittedTimeRef.current = lerpedTimeRef.current;
        setCurrentTime(lerpedTimeRef.current);
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animFrameId);
    };
  }, [duration]);

  const visibleComponents = manifest.components.filter((c) => {
    const motion = computeOpenReelMotionState(c, currentTime);
    return motion.isVisible;
  });

  return (
    <div ref={containerRef} className="relative w-full bg-black min-h-[500vh]">
      {/* Top Floating Controls */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-3">
        <button
          onClick={() => setViewMode('editor')}
          className="p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full backdrop-blur-md transition border border-white/20 flex items-center gap-2 text-xs shadow-2xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Preview</span>
        </button>

        {/* Playback Mode Switcher */}
        <div className="flex items-center bg-black/70 backdrop-blur-md border border-white/20 rounded-full p-1 text-xs shadow-2xl">
          <button
            onClick={() => setPlaybackMode('canvas')}
            className={`px-3 py-1 rounded-full transition font-medium cursor-pointer ${
              playbackMode === 'canvas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Canvas Sequence
          </button>
          <button
            onClick={() => setPlaybackMode('video')}
            className={`px-3 py-1 rounded-full transition font-medium cursor-pointer ${
              playbackMode === 'video'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Video.js
          </button>
        </div>
      </div>

      {/* Edge-to-Edge Fullscreen Visual Web Viewport (Zero Black Borders) */}
      <div className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none">
        {/* Media Layer: Fullscreen Object-Cover Video / Canvas Sequence */}
        {playbackMode === 'canvas' ? (
          <CanvasSequencePlayer
            frameCount={500}
            framePrefix="/frames/frame_"
            frameExtension=".webp"
            scrollProgress={scrollRatio}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <VideoJsPlayer
            src={videoSrc}
            currentTime={currentTime}
            onLoadedMetadata={(dur) => setDuration(dur || 20.0)}
            className="w-full h-full object-cover pointer-events-none"
          />
        )}

        {/* Dynamic Web Component Overlay Layer */}
        <div className="absolute inset-0 pointer-events-auto z-30">
          {visibleComponents.map((comp) => {
            const motion = computeOpenReelMotionState(comp, currentTime);
            const layoutStyle = getPenpotNodeLayoutStyle(comp);
            return (
              <div
                key={comp.id}
                style={{
                  ...layoutStyle,
                  ...motion.motionStyle
                }}
                className="will-change-transform"
              >
                <PenpotComponentRenderer comp={comp} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
