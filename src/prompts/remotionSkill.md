# Antra Remotion Motion Graphics Skill

This skill explains how to craft production-grade, glitch-free Remotion React motion graphic code for video backdrops.

---

## 1. Runtime Scope & Injected APIs

The code is compiled in the browser via Babel and executed inside an injected sandbox scope.
You have direct access to:

- **React**:
  - `useState`, `useEffect`, `useMemo`, `useRef`, `useCallback`
- **Remotion**:
  - `AbsoluteFill`: Full-canvas absolute fill container.
  - `useCurrentFrame()`: Returns the current integer frame index (starts at 0).
  - `useVideoConfig()`: Returns `{ fps, durationInFrames, width, height }` (standard 1920x1080 canvas).
  - `interpolate(frame, inputRange, outputRange, options)`: Smooth mapping with easing/clamping.
  - `spring({ frame, fps, config })`: Realistic physics spring animation.
  - `Easing`: Easing curves such as `Easing.bezier(x1, y1, x2, y2)`, `Easing.ease`, `Easing.inOut`, `Easing.quad`.
  - `Sequence`: `<Sequence from={frame} durationInFrames={length}>` for time-sliced staging.
  - `interpolateColors(frame, inputRange, outputRange)`: Color hex interpolation.
- **Lucide Icons** (`SafeLucideIcons`):
  - Common icons available directly by tag name: `Sparkles`, `Activity`, `Flame`, `Zap`, `Shield`, `TrendingUp`, `Cpu`, `Layers`, `Globe`, `Star`, `Compass`, `Radio`, `Eye`, `Search`, `BarChart`, `Check`, etc.
  - If an icon name doesn't exist, a safe fallback is rendered automatically.
- **Styling**:
  - Tailwind CSS utility classes are available (e.g. `flex flex-col items-center justify-center text-white relative overflow-hidden`).
  - Inline `style={{ ... }}` for dynamic frame-driven transforms, opacities, rotations, and gradients.
  - **CRITICAL JSX SYNTAX RULE**: Any dynamic CSS value using `${...}` MUST be inside template literals with backticks:
    - CORRECT: `style={{ transform: \`scale(\${cameraScale}) translateY(\${floatY}px)\` }}`
    - INCORRECT: `style={{ transform: scale(${cameraScale}) translateY(${floatY}px) }}` (This causes a syntax error!)

---

## 2. Fundamental Motion Rules & Remotion Best Practices

1. **Deterministic Frame-Driven Animation**:
   - Every movement, opacity shift, rotation, and color transition MUST be driven by `frame = useCurrentFrame()`.
   - **NEVER** use `Date.now()`, `Math.random()` during render, `requestAnimationFrame`, or CSS `@keyframes` animations.
   - For continuous ambient movement, use `interpolate(frame, [0, durationInFrames], [0, 360])`.

2. **Spring Physics & Staggered Timing**:
   - Use `spring()` for natural object reveals and entrances:
     ```javascript
     const enterScale = spring({
       frame: frame - delayFrames,
       fps,
       config: { damping: 14, mass: 0.6 }
     });
     ```
   - Stagger card or shape reveals across time (e.g. at frame 0, 15, 30).

3. **Smooth Camera Moves & Depth**:
   - Add a subtle camera push-in zoom over the entire duration to create cinematic depth:
     ```javascript
     const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
       easing: Easing.bezier(0.16, 1, 0.3, 1),
       extrapolateRight: 'clamp'
     });
     ```
   - Add floating vertical drift for ambient hero graphics:
     ```javascript
     const floatY = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0, -12, 0]);
     ```

4. **Multi-Phase Timeline Architecture**:
   - **Phase 1 (0% to 25% duration)**: Atmospheric ambient background aura ignites, brand identity / kinetic hero typography springs in.
   - **Phase 2 (25% to 70% duration)**: Staggered reveal of core product concepts (animated geometric nodes, feature HUD cards, technical telemetry, visual proof of what the business does).
   - **Phase 3 (70% to 100% duration)**: Seamless ambient oscillation, glowing loops, rotating orbital rings, keeping the backdrop alive.

5. **Aesthetics & Atmosphere**:
   - Dark mode modern aesthetic: Deep blacks/charcoals (`#070709`, `#0a0a0f`) with vibrant radial glows using the brand's primary and secondary palette with heavy blurs (`blur-[120px]`).
   - Perspective wireframe grids (`transform: perspective(500px) rotateX(60deg)`), subtle particle rings, and clean typography.
   - Maintain high contrast and visual hierarchy so overlaid interactive DOM elements will read legibly.

---

## 3. Strict Prohibitions

1. **NO BUTTONS**: Do not include `<button>`, action callouts like "Click here", or clickable UI cards. This video is strictly a motion canvas.
2. **NO MARKDOWN BLOCK WRAPPERS**: Never output ` ```jsx ` or ` ``` `.
3. **NO EXTERNAL IMPORTS**: Do not write `import React from 'react'`.
4. **NO PROMPT ECHO**: Do not literally print the user's prompt as the main title unless it is a brand name. Infer a strong, punchy brand name, headline, and telemetry that captures the spirit of their product.
