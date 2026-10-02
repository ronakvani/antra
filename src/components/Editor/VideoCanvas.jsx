import React, { useRef, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { VideoJsPlayer } from '../Common/VideoJsPlayer';
import { RotateCw, Lock } from 'lucide-react';
import { computeOpenReelMotionState } from '../../utils/openreelAnimationEngine';
import { getPenpotNodeLayoutStyle } from '../../utils/penpotCodeEngine';
import { PenpotComponentRenderer } from './PenpotComponentRenderer';

export const VideoCanvas = () => {
  const {
    videoSrc,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    setVideoDuration,
    manifest,
    selectedComponentId,
    setSelectedComponentId,
    updateComponent
  } = useEditor();

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeTransform, setActiveTransform] = useState(null); // 'drag' | 'resize-*' | 'rotate'
  const [liveInfo, setLiveInfo] = useState(null); // { w, h, x, y, deg }
  const [snapGuides, setSnapGuides] = useState({ x: false, y: false });

  const handleLoadedMetadata = (duration) => {
    setVideoDuration(duration || 20.0);
  };

  const visibleComponents = manifest.components.filter((c) => {
    if (c.hidden) return false;
    const motion = computeOpenReelMotionState(c, currentTime);
    return motion.isVisible;
  });

  const parsePos = (val, maxDimension, fallback = 0) => {
    if (typeof val === 'number') return val;
    if (!val) return fallback;
    if (String(val).includes('%')) {
      return (parseFloat(val) / 100) * maxDimension;
    }
    const num = parseFloat(val);
    return isNaN(num) ? fallback : num;
  };

  // 1. Move Drag Handler (1:1 Screen Pixel Precision)
  const handleDragStart = (e, comp) => {
    e.stopPropagation();
    setSelectedComponentId(comp.id);
    if (comp.locked) return;
    setActiveTransform('drag');

    const canvasRect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { width: 1000, height: 562 };
    const canvasW = canvasRect.width;
    const canvasH = canvasRect.height;

    const width = parsePos(comp.style?.width, canvasW, 280);
    const height = parsePos(comp.style?.height, canvasH, 140);
    const initialLeft = parsePos(comp.style?.left, canvasW, canvasW * 0.25);
    const initialTop = parsePos(comp.style?.top, canvasH, canvasH * 0.25);
    const startX = e.clientX;
    const startY = e.clientY;

    const isPct = String(comp.style?.left || '').includes('%') || !comp.style?.left;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newLeft = Math.round(initialLeft + dx);
      let newTop = Math.round(initialTop + dy);

      // Snap to Center Guidelines
      const centerX = newLeft + width / 2;
      const centerY = newTop + height / 2;
      const isSnapX = Math.abs(centerX - canvasW / 2) < 12;
      const isSnapY = Math.abs(centerY - canvasH / 2) < 12;

      if (isSnapX) newLeft = Math.round(canvasW / 2 - width / 2);
      if (isSnapY) newTop = Math.round(canvasH / 2 - height / 2);

      setSnapGuides({ x: isSnapX, y: isSnapY });

      // Save position as responsive percentage or px
      let leftVal, topVal;
      if (isPct) {
        const leftPct = Math.max(0, Math.min(95, (newLeft / canvasW) * 100));
        const topPct = Math.max(0, Math.min(95, (newTop / canvasH) * 100));
        leftVal = `${leftPct.toFixed(2)}%`;
        topVal = `${topPct.toFixed(2)}%`;
      } else {
        leftVal = `${newLeft}px`;
        topVal = `${newTop}px`;
      }

      setLiveInfo({
        x: leftVal,
        y: topVal,
        w: Math.round(width),
        h: Math.round(height)
      });

      updateComponent(comp.id, {
        style: {
          ...comp.style,
          left: leftVal,
          top: topVal
        }
      });
    };

    const handleMouseUp = () => {
      setActiveTransform(null);
      setLiveInfo(null);
      setSnapGuides({ x: false, y: false });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 2. 8-Point Precision Resize Handler (Responsive Proportional Precision)
  const handleResizeStart = (e, comp, corner) => {
    e.stopPropagation();
    if (comp.locked) return;
    setActiveTransform(`resize-${corner}`);

    const canvasRect = canvasRef.current ? canvasRef.current.getBoundingClientRect() : { width: 1000, height: 562 };
    const canvasW = canvasRect.width;
    const canvasH = canvasRect.height;

    const startX = e.clientX;
    const startY = e.clientY;

    const isTextLike = ['heading', 'paragraph', 'quote', 'badge', 'button'].includes(comp.type);
    const initialFontSize = parsePos(comp.style?.fontSize, 100, 24);
    const initialWidth = parsePos(comp.style?.width, canvasW, canvasW * 0.3);
    const initialHeight = parsePos(comp.style?.height, canvasH, canvasH * 0.2);

    const isPctW = String(comp.style?.width || '').includes('%') || !comp.style?.width;
    const isPctH = String(comp.style?.height || '').includes('%') || !comp.style?.height;

    const handleMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      if (isTextLike && corner.length === 2) {
        const delta = (dx + dy) / 2;
        const newFontSize = Math.max(12, Math.min(180, initialFontSize + delta * 0.4));
        setLiveInfo({
          fontSize: `${Math.round(newFontSize)}px`,
          w: Math.round(initialWidth),
          h: Math.round(initialHeight)
        });
        updateComponent(comp.id, {
          style: {
            ...comp.style,
            fontSize: `${Math.round(newFontSize)}px`
          }
        });
      } else {
        let newW = initialWidth;
        let newH = initialHeight;

        if (corner.includes('e')) newW = Math.max(30, initialWidth + dx);
        if (corner.includes('w')) newW = Math.max(30, initialWidth - dx);
        if (corner.includes('s')) newH = Math.max(20, initialHeight + dy);
        if (corner.includes('n')) newH = Math.max(20, initialHeight - dy);

        let wVal, hVal;
        if (isPctW) {
          const wPct = Math.max(4, Math.min(100, (newW / canvasW) * 100));
          wVal = `${wPct.toFixed(2)}%`;
        } else {
          wVal = `${Math.round(newW)}px`;
        }

        if (isPctH && comp.style?.height && comp.style.height !== 'auto') {
          const hPct = Math.max(3, Math.min(100, (newH / canvasH) * 100));
          hVal = `${hPct.toFixed(2)}%`;
        } else if (comp.style?.height && comp.style.height !== 'auto') {
          hVal = `${Math.round(newH)}px`;
        } else {
          hVal = comp.style?.height || 'auto';
        }

        setLiveInfo({
          w: wVal,
          h: hVal
        });

        updateComponent(comp.id, {
          style: {
            ...comp.style,
            width: wVal,
            height: hVal
          }
        });
      }
    };

    const handleMouseUp = () => {
      setActiveTransform(null);
      setLiveInfo(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 3. Rotation Handle Drag
  const handleRotateStart = (e, comp) => {
    e.stopPropagation();
    if (comp.locked) return;
    setActiveTransform('rotate');

    const targetNode = document.getElementById(`comp-node-${comp.id}`);
    if (!targetNode) return;
    const rect = targetNode.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent) => {
      const rad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let deg = Math.round(rad * (180 / Math.PI) + 90);
      if (deg < 0) deg += 360;

      setLiveInfo({ deg: `${deg}°` });

      updateComponent(comp.id, {
        style: {
          ...comp.style,
          transform: `rotate(${deg}deg)`
        }
      });
    };

    const handleMouseUp = () => {
      setActiveTransform(null);
      setLiveInfo(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full bg-zinc-100/90 p-4 flex flex-col items-center justify-center relative overflow-hidden select-none"
    >
      {/* 1:1 Native Pixel Canvas Viewport (No Artificial CSS Scale Distortion) */}
      <div
        ref={canvasRef}
        className="relative w-full aspect-video max-h-full max-w-full bg-black border border-zinc-300 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center isolate select-none"
      >
        {/* Media Layer (Video.js powered) */}
        {videoSrc ? (
          <VideoJsPlayer
            src={videoSrc}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={(t) => setCurrentTime(t)}
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={handleLoadedMetadata}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="text-zinc-500 text-2xl font-medium">
            Video Canvas (Upload or generate video)
          </div>
        )}

        {/* Snap Alignment Guidelines */}
        {snapGuides.x && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-[#0d99ff] z-20 pointer-events-none" />
        )}
        {snapGuides.y && (
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 border-t-2 border-dashed border-[#0d99ff] z-20 pointer-events-none" />
        )}

        {/* Interactive Canvas Overlay Layer */}
        <div
          className="absolute inset-0 z-30 pointer-events-auto"
          onClick={() => setSelectedComponentId(null)}
        >
          {visibleComponents.map((comp) => {
            const isSelected = selectedComponentId === comp.id;
            const motion = computeOpenReelMotionState(comp, currentTime);
            const isLocked = !!comp.locked;
            const layoutStyle = getPenpotNodeLayoutStyle(comp);

            return (
              <div
                key={comp.id}
                id={`comp-node-${comp.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponentId(comp.id);
                }}
                onMouseDown={(e) => handleDragStart(e, comp)}
                style={{
                  ...layoutStyle,
                  ...motion.motionStyle,
                  cursor: isLocked
                    ? 'default'
                    : activeTransform === 'drag'
                    ? 'grabbing'
                    : 'grab',
                  userSelect: 'none',
                  touchAction: 'none'
                }}
                className={`group relative ${
                  isSelected
                    ? 'ring-2 ring-[#0d99ff] ring-offset-0'
                    : 'hover:ring-1 hover:ring-[#0d99ff]/50'
                }`}
              >
                {/* Figma / Penpot Precision Bounding Gizmo (Shown when Selected) */}
                {isSelected && (
                  <>
                    {/* Top Rotation Knob Handle */}
                    {!isLocked && (
                      <>
                        <div
                          onMouseDown={(e) => handleRotateStart(e, comp)}
                          className="absolute -top-9 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-[#0d99ff] rounded-full shadow-md cursor-grab flex items-center justify-center hover:scale-125 transition-transform z-40"
                          title="Click & Drag to Rotate"
                        >
                          <div className="w-2 h-2 bg-[#0d99ff] rounded-full" />
                        </div>
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-0.5 h-3.5 bg-[#0d99ff] z-30 pointer-events-none" />
                      </>
                    )}

                    {/* 8-Point Precision Square Resize Handles */}
                    {!isLocked && (
                      <>
                        {/* Top-Left (nw) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'nw')}
                          className="absolute -top-2.5 -left-2.5 w-4 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-nwse-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Top-Right (ne) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'ne')}
                          className="absolute -top-2.5 -right-2.5 w-4 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-nesw-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Bottom-Left (sw) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'sw')}
                          className="absolute -bottom-2.5 -left-2.5 w-4 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-nesw-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Bottom-Right (se) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'se')}
                          className="absolute -bottom-2.5 -right-2.5 w-4 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-nwse-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Mid-Top (n) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'n')}
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-3 bg-white border-2 border-[#0d99ff] rounded-xs cursor-ns-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Mid-Bottom (s) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 's')}
                          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-3 bg-white border-2 border-[#0d99ff] rounded-xs cursor-ns-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Mid-Left (w) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'w')}
                          className="absolute top-1/2 -translate-y-1/2 -left-2.5 w-3 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-ew-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                        {/* Mid-Right (e) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, comp, 'e')}
                          className="absolute top-1/2 -translate-y-1/2 -right-2.5 w-3 h-4 bg-white border-2 border-[#0d99ff] rounded-xs cursor-ew-resize shadow-sm z-40 hover:scale-125 transition-transform"
                        />
                      </>
                    )}

                    {/* Lock Indicator Badge if Locked */}
                    {isLocked && (
                      <div className="absolute -top-8 right-0 bg-amber-500 text-white rounded px-2 py-1 text-xs font-mono flex items-center gap-1 shadow z-40">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </div>
                    )}

                    {/* Live Dimension / Position Pill Tooltip */}
                    {activeTransform && liveInfo && (
                      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-zinc-900/95 text-white text-xs font-mono px-3 py-1 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none backdrop-blur-xs flex items-center gap-2 border border-zinc-700">
                        {liveInfo.deg && <span>∠ {liveInfo.deg}</span>}
                        {liveInfo.w && <span>{liveInfo.w} × {liveInfo.h} px</span>}
                        {liveInfo.x && <span>X: {liveInfo.x} Y: {liveInfo.y}</span>}
                        {liveInfo.fontSize && <span>Size: {liveInfo.fontSize}</span>}
                      </div>
                    )}
                  </>
                )}

                {/* Penpot Pixel-Perfect Component & Vector Body */}
                <PenpotComponentRenderer comp={comp} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
