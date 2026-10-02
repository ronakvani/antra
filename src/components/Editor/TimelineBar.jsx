import React, { useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

export const TimelineBar = () => {
  const {
    currentTime,
    setCurrentTime,
    videoDuration,
    isPlaying,
    setIsPlaying,
    manifest,
    selectedComponentId,
    setSelectedComponentId
  } = useEditor();
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);

  const calculateTimeFromClientX = useCallback((clientX) => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    const dur = videoDuration || 20.0;
    return parseFloat((percentage * dur).toFixed(2));
  }, [videoDuration]);

  // Scrub click & drag handler
  const handleTrackMouseDown = (e) => {
    isDraggingRef.current = true;
    const newTime = calculateTimeFromClientX(e.clientX);
    setCurrentTime(newTime);

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const scrubTime = calculateTimeFromClientX(moveEvent.clientX);
      setCurrentTime(scrubTime);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard shortcut: Spacebar to toggle Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsPlaying]);

  const togglePlay = () => {
    if (!isPlaying && currentTime >= (videoDuration || 20.0) - 0.1) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const durationSeconds = Math.max(1, Math.round(videoDuration || 10));
  const ticks = Array.from({ length: durationSeconds + 1 }, (_, i) => i);

  return (
    <footer className="h-20 bg-white border-t border-zinc-200 px-8 flex items-center justify-between select-none shadow-sm">
      {/* Controls & Timestamp */}
      <div className="flex items-center gap-4 text-sm text-zinc-900">
        <button
          onClick={togglePlay}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition shadow-sm cursor-pointer"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="font-mono text-zinc-900 font-medium">
          {currentTime.toFixed(1)}s / {(videoDuration || 20.0).toFixed(1)}s
        </span>
      </div>

      {/* Timeline Scrub Track */}
      <div className="flex-1 ml-6">
        <div
          ref={trackRef}
          onMouseDown={handleTrackMouseDown}
          className="relative h-11 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Interactive Component Spans */}
          <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
            {manifest.components.map((c) => {
              const dur = videoDuration || 20.0;
              const startPct = (c.startTime / dur) * 100;
              const widthPct = Math.max(2, ((c.endTime - c.startTime) / dur) * 100);
              const isSelected = selectedComponentId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedComponentId(c.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  title={`${c.content || c.type} (${c.startTime}s - ${c.endTime}s)`}
                  className={`absolute h-6 rounded-md border text-[10px] font-mono px-1.5 flex items-center justify-between transition cursor-pointer overflow-hidden pointer-events-auto ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-600 text-indigo-900 font-semibold shadow-xs z-20'
                      : 'bg-zinc-200/80 border-zinc-300 text-zinc-700 hover:bg-zinc-300 z-10'
                  }`}
                >
                  <span className="truncate">{c.content || c.type}</span>
                </div>
              );
            })}
          </div>

          {/* Playhead */}
          <div
            style={{ left: `${(currentTime / (videoDuration || 20.0)) * 100}%` }}
            className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 z-20 shadow pointer-events-none"
          >
            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full -translate-x-[4px] -translate-y-1" />
          </div>

          {/* Tick Marks & Labels */}
          <div className="flex justify-between items-end px-2 pb-1 z-10 text-[10px] text-zinc-500 font-mono pointer-events-none">
            {ticks.map((t) => (
              <div key={t} className="flex flex-col items-center">
                <div className="w-px h-1.5 bg-zinc-300 mb-0.5" />
                <span>{t}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
