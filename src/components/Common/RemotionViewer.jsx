import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { compileRemotionCode } from '../../utils/remotionAiEngine';
import { Sparkles, AlertCircle } from 'lucide-react';

export const RemotionViewer = ({
  code,
  currentTime = 0,
  isPlaying = false,
  duration = 15.0,
  fps = 30,
  onTimeUpdate = () => {},
  onEnded = () => {},
  className = ''
}) => {
  const playerRef = useRef(null);
  const [compileError, setCompileError] = useState(null);

  const durationInFrames = Math.max(30, Math.round(duration * fps));

  // Compile the dynamic Remotion component with Babel Standalone
  const CompiledComponent = useMemo(() => {
    if (!code) return null;
    try {
      const comp = compileRemotionCode(code);
      if (comp) {
        setCompileError(null);
        return comp;
      } else {
        setCompileError('Could not initialize Remotion component.');
        return null;
      }
    } catch (err) {
      console.error('Remotion compile error:', err);
      setCompileError(err.message || 'Error compiling Remotion code');
      return null;
    }
  }, [code]);

  // Sync external currentTime (scrub / timeline / scroll) with Remotion Player
  useEffect(() => {
    if (!playerRef.current) return;
    const targetFrame = Math.round(currentTime * fps);
    const currentFrame = playerRef.current.getCurrentFrame();

    if (Math.abs(targetFrame - currentFrame) > 1 && !isPlaying) {
      playerRef.current.seekTo(Math.min(targetFrame, durationInFrames - 1));
    }
  }, [currentTime, fps, durationInFrames, isPlaying]);

  // Sync external isPlaying state with Remotion Player
  useEffect(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      if (!playerRef.current.isPlaying()) {
        playerRef.current.play();
      }
    } else {
      if (playerRef.current.isPlaying()) {
        playerRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Listen for internal time updates from Player when playing
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleFrameUpdate = (e) => {
      const frame = e.detail?.frame ?? 0;
      onTimeUpdate(frame / fps);
    };

    const handleEnded = () => {
      onEnded();
    };

    player.addEventListener('frameupdate', handleFrameUpdate);
    player.addEventListener('ended', handleEnded);

    return () => {
      player.removeEventListener('frameupdate', handleFrameUpdate);
      player.removeEventListener('ended', handleEnded);
    };
  }, [fps, onTimeUpdate, onEnded]);

  if (compileError || !CompiledComponent) {
    return (
      <div className={`w-full h-full bg-[#070709] flex flex-col items-center justify-center text-zinc-400 p-8 ${className}`}>
        <div className="flex items-center gap-2 text-[#E95464] text-sm font-medium mb-2">
          <AlertCircle className="w-5 h-5" />
          <span>Remotion Render Notice</span>
        </div>
        <p className="text-xs text-zinc-500 font-mono text-center max-w-md">
          {compileError || 'Generating motion graphics timeline...'}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-black overflow-hidden select-none ${className}`}>
      <Player
        ref={playerRef}
        component={CompiledComponent}
        durationInFrames={durationInFrames}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={fps}
        loop
        controls={false}
        acknowledgeRemotionLicense
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};
