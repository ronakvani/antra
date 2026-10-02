/**
 * OpenReel Open Source Motion & Video Timeline Animation Engine for Antra
 * Computes frame-accurate keyframe interpolation, position motion-tracking paths,
 * entrance/exit transitions, opacity curves, and motion matrices synchronized with video & scroll time.
 */

export const OPENREEL_ANIMATION_IN_PRESETS = [
  { id: 'fade-in', label: 'Fade In' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'scale-up', label: 'Scale Zoom In' },
  { id: 'bounce-in', label: 'Elastic Bounce' },
  { id: 'flip-in', label: '3D Flip In' }
];

export const OPENREEL_ANIMATION_OUT_PRESETS = [
  { id: 'fade-out', label: 'Fade Out' },
  { id: 'slide-down', label: 'Slide Down' },
  { id: 'slide-up', label: 'Slide Up' },
  { id: 'scale-down', label: 'Scale Zoom Out' },
  { id: 'blur-out', label: 'Blur Dissolve' }
];

/**
 * Interpolates Motion-Tracking Position Path keyframes for a component at current time.
 */
export const interpolateMotionPath = (comp, currentTime) => {
  const path = comp.motionPath;
  if (!Array.isArray(path) || path.length < 2) {
    return {
      left: comp.style?.left || '30%',
      top: comp.style?.top || '30%'
    };
  }

  // Sort keyframes chronologically by timestamp
  const sorted = [...path].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (currentTime <= sorted[0].time) {
    return {
      left: typeof sorted[0].left === 'number' ? `${sorted[0].left}%` : sorted[0].left,
      top: typeof sorted[0].top === 'number' ? `${sorted[0].top}%` : sorted[0].top
    };
  }

  // After last keyframe
  if (currentTime >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1];
    return {
      left: typeof last.left === 'number' ? `${last.left}%` : last.left,
      top: typeof last.top === 'number' ? `${last.top}%` : last.top
    };
  }

  // Find bounding keyframe interval [k1, k2]
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];

    if (currentTime >= k1.time && currentTime <= k2.time) {
      const duration = k2.time - k1.time;
      const progress = duration > 0 ? (currentTime - k1.time) / duration : 0;

      const parsePct = (val) => (typeof val === 'number' ? val : parseFloat(val) || 0);

      const k1Left = parsePct(k1.left);
      const k2Left = parsePct(k2.left);
      const k1Top = parsePct(k1.top);
      const k2Top = parsePct(k2.top);

      const interpLeft = k1Left + (k2Left - k1Left) * progress;
      const interpTop = k1Top + (k2Top - k1Top) * progress;

      return {
        left: `${interpLeft.toFixed(2)}%`,
        top: `${interpTop.toFixed(2)}%`
      };
    }
  }

  return {
    left: comp.style?.left || '30%',
    top: comp.style?.top || '30%'
  };
};

/**
 * Calculates OpenReel motion state & inline CSS matrix transforms for a component at exact currentTime.
 */
export const computeOpenReelMotionState = (comp, currentTime) => {
  const startTime = typeof comp.startTime === 'number' ? comp.startTime : 0;
  const endTime = typeof comp.endTime === 'number' ? comp.endTime : 20;
  const rawDuration = comp.animationDuration !== undefined ? parseFloat(comp.animationDuration) : 0.5;
  const totalDuration = Math.max(0, endTime - startTime);
  const transitionDuration = Math.min(rawDuration, totalDuration > 0 ? totalDuration / 2 : 0);

  const animIn = comp.animationIn || 'fade-in';
  const animOut = comp.animationOut || 'fade-out';

  // Compute motion-tracked position
  const trackedPos = interpolateMotionPath(comp, currentTime);

  // Component is completely out of timeframe (with small epsilon tolerance for float precision)
  if (currentTime < startTime - 0.001 || currentTime > endTime + 0.001) {
    return {
      isVisible: false,
      phase: 'hidden',
      progress: 0,
      trackedPos,
      motionStyle: { display: 'none', opacity: 0 }
    };
  }

  // 1. Entrance Phase
  const timeSinceStart = currentTime - startTime;
  if (timeSinceStart < transitionDuration && transitionDuration > 0) {
    const progress = Math.min(1, Math.max(0, timeSinceStart / transitionDuration));
    return {
      isVisible: true,
      phase: 'entering',
      progress,
      trackedPos,
      motionStyle: {
        ...getEntranceMotionStyle(animIn, progress, comp.style?.transform),
        left: trackedPos.left,
        top: trackedPos.top
      }
    };
  }

  // 2. Exit Phase
  const timeUntilEnd = endTime - currentTime;
  if (timeUntilEnd < transitionDuration && transitionDuration > 0) {
    const progress = Math.min(1, Math.max(0, timeUntilEnd / transitionDuration));
    return {
      isVisible: true,
      phase: 'exiting',
      progress,
      trackedPos,
      motionStyle: {
        ...getExitMotionStyle(animOut, progress, comp.style?.transform),
        left: trackedPos.left,
        top: trackedPos.top
      }
    };
  }

  // 3. Active Phase (Fully visible & tracking)
  return {
    isVisible: true,
    phase: 'active',
    progress: 1,
    trackedPos,
    motionStyle: {
      left: trackedPos.left,
      top: trackedPos.top,
      opacity: comp.style?.opacity !== undefined ? comp.style.opacity : 1,
      transform: comp.style?.transform || 'none'
    }
  };
};

/**
 * Computes CSS transform & opacity for entrance animation keyframes.
 */
const getEntranceMotionStyle = (preset, progress, baseTransform = '') => {
  const cleanBaseTransform = baseTransform === 'none' ? '' : baseTransform;
  const ease = progress;

  switch (preset) {
    case 'slide-up': {
      const translateY = (1 - ease) * 40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateY(${translateY}px)`.trim()
      };
    }
    case 'slide-down': {
      const translateY = (1 - ease) * -40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateY(${translateY}px)`.trim()
      };
    }
    case 'slide-left': {
      const translateX = (1 - ease) * 40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateX(${translateX}px)`.trim()
      };
    }
    case 'slide-right': {
      const translateX = (1 - ease) * -40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateX(${translateX}px)`.trim()
      };
    }
    case 'scale-up': {
      const scale = 0.7 + ease * 0.3;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} scale(${scale})`.trim()
      };
    }
    case 'bounce-in': {
      const scale = 0.5 + ease * 0.5 + Math.sin(progress * Math.PI) * 0.15;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} scale(${scale})`.trim()
      };
    }
    case 'flip-in': {
      const rotateX = (1 - ease) * 90;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} perspective(600px) rotateX(${rotateX}deg)`.trim()
      };
    }
    case 'fade-in':
    default:
      return {
        opacity: ease,
        transform: cleanBaseTransform || 'none'
      };
  }
};

/**
 * Computes CSS transform & opacity for exit animation keyframes.
 */
const getExitMotionStyle = (preset, progress, baseTransform = '') => {
  const cleanBaseTransform = baseTransform === 'none' ? '' : baseTransform;
  const ease = progress;

  switch (preset) {
    case 'slide-down': {
      const translateY = (1 - ease) * 40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateY(${translateY}px)`.trim()
      };
    }
    case 'slide-up': {
      const translateY = (1 - ease) * -40;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} translateY(${translateY}px)`.trim()
      };
    }
    case 'scale-down': {
      const scale = ease * 0.8;
      return {
        opacity: ease,
        transform: `${cleanBaseTransform} scale(${scale})`.trim()
      };
    }
    case 'blur-out': {
      const blur = (1 - ease) * 10;
      return {
        opacity: ease,
        filter: `blur(${blur}px)`,
        transform: cleanBaseTransform || 'none'
      };
    }
    case 'fade-out':
    default:
      return {
        opacity: ease,
        transform: cleanBaseTransform || 'none'
      };
  }
};
