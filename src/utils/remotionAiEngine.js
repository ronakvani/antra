/**
 * Antra Remotion AI Motion Graphics Engine
 * Transforms builder briefs and design reference files into production-grade Remotion React motion graphic code.
 * Follows the strict rule: The output video is ONLY a motion graphic backdrop canvas.
 * NO buttons, clickables, or interactive web controls are generated in the video pixels.
 */

import * as Babel from '@babel/standalone';
import React from 'react';
import * as Remotion from 'remotion';
import * as LucideIcons from 'lucide-react';
import { getMaxDurationForUser } from './planFeatures.js';
import { SYSTEM_PROMPT, REMOTION_SKILL } from '../prompts/index.js';

// Currently active free-tier models on OpenRouter with zero-cost access and high rate limits
export const OPENROUTER_MODELS = {
  COHERE_CODE_FREE: 'cohere/north-mini-code:free',
  LING_FLASH_FREE: 'inclusionai/ling-3.2-flash:free',
  LIQUID_FREE: 'liquid/lfm-3-1.7b:free',
  NEMOTRON_VL_FREE: 'nvidia/nemotron-3.5-super-vl:free',
  OPENROUTER_FREE: 'openrouter/free'
};

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS.COHERE_CODE_FREE;

/**
 * Builds the comprehensive prompt combining systemprompt.md and remotionSkill.md
 */
export const buildCompositeSystemPrompt = ({ durationInFrames, durationSeconds, fps }) => {
  return `${SYSTEM_PROMPT}

==============================
REMOTION EXPERT SKILL & BEST PRACTICES
==============================
${REMOTION_SKILL}

==============================
RUNTIME SPECIFICATIONS FOR THIS GENERATION
==============================
- Canvas Resolution: 1920x1080 (16:9 widescreen)
- Target Duration: ${durationSeconds} seconds (${durationInFrames} frames at ${fps} FPS).
- Component Signature: function MotionScene()
- CRITICAL REMINDER: STRICTLY NO BUTTONS, CLICKABLES, OR FORM INPUTS INSIDE THE VIDEO CODE.
- SYNTAX REMINDER: Enclose all style transforms containing \${...} in backticks (\`...\`).
- Return ONLY clean, executable React component code.`;
};

/**
 * Cleanly extracts a meaningful brand/topic title from user prompt text
 */
const extractMeaningfulTitle = (rawPrompt = '') => {
  const p = (rawPrompt || '').trim();
  if (!p) return 'ANTRA STUDIO';

  // Strip common filler conversational prefixes
  const clean = p
    .replace(/^(my business is|we are|we provide|our product is|create a video for|making video explain|explain|make a website for|generate video for)\s+/gi, '')
    .trim();

  // If there's an obvious domain keyword (e.g., SEO, AI, Analytics, Fitness)
  if (/seo/i.test(clean)) return 'AI-POWERED SEO';
  if (/crypto|fintech|trading/i.test(clean)) return 'NEXUS PROTOCOL';
  if (/fitness|gym|workout/i.test(clean)) return 'PULSE FITNESS';
  if (/luxury|fashion/i.test(clean)) return 'AURA ATELIER';
  if (/cyber|security/i.test(clean)) return 'SENTINEL DEFENSE';

  const words = clean.split(/\s+/).filter(Boolean);
  return words.length > 0 ? words.slice(0, 3).join(' ').toUpperCase() : 'ANTRA STUDIO';
};

/**
 * Fallback procedural motion graphics generator
 * Adheres strictly to the rule: Clean motion graphic backdrop with atmospheric visuals, 
 * kinetic typography, ambient orbits, and SVG telemetry, but NO buttons or clickables.
 */
export const generateProceduralRemotionCode = ({
  prompt = '',
  durationInFrames = 450,
  durationSeconds = 15,
  fps = 30
}) => {
  const brandTitle = extractMeaningfulTitle(prompt);

  return `function MotionScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationInFrames = ${durationInFrames};

  // Cinematic camera push-in zoom
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp'
  });

  // Entrance physics spring
  const enterScale = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6 }
  });

  // Smooth ambient rotation and floating drift
  const rotateAngle = interpolate(frame, [0, durationInFrames], [0, 360]);
  const pulseGlow = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0.85, 1.2, 0.85]);
  const floatY = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0, -14, 0]);

  // Staggered telemetry cards
  const card1Enter = spring({ frame: frame - 15, fps, config: { damping: 12, mass: 0.5 } });
  const card2Enter = spring({ frame: frame - 30, fps, config: { damping: 12, mass: 0.5 } });
  const card3Enter = spring({ frame: frame - 45, fps, config: { damping: 12, mass: 0.5 } });

  return (
    <div
      style={{ transform: \`scale(\${cameraScale})\` }}
      className="relative w-full h-full bg-[#060608] text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none font-sans"
    >
      {/* Dynamic Ambient Background Aura */}
      <div
        style={{
          background: 'radial-gradient(circle at 50% 45%, #E9546428 0%, transparent 60%)',
          transform: \`scale(\${pulseGlow})\`
        }}
        className="absolute inset-0 pointer-events-none blur-[140px]"
      />
      <div
        style={{
          background: 'radial-gradient(circle at 30% 75%, #6366F122 0%, transparent 55%)'
        }}
        className="absolute inset-0 pointer-events-none blur-[110px]"
      />

      {/* Perspective Wireframe Ground Grid */}
      <div
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          transform: 'perspective(500px) rotateX(60deg) translateY(140px) scale(1.8)',
          opacity: 0.55
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Floating Orbital Kinetic Rings */}
      <div
        style={{
          transform: \`rotate(\${rotateAngle * 0.3}deg)\`,
          border: '1px dashed rgba(233, 84, 100, 0.35)'
        }}
        className="absolute w-[680px] h-[680px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
      <div
        style={{
          transform: \`rotate(\${-rotateAngle * 0.2}deg)\`,
          border: '1px solid rgba(255,255,255,0.08)'
        }}
        className="absolute w-[840px] h-[840px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* Top Header Badge */}
      <div
        style={{ transform: \`scale(\${enterScale})\` }}
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#E95464] animate-pulse" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-300">
          MOTION CANVAS · NEXT-GEN INTELLIGENCE
        </span>
      </div>

      {/* Central Kinetic Hero Graphic */}
      <div
        style={{
          transform: \`scale(\${enterScale}) translateY(\${floatY}px)\`
        }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mt-6"
      >
        <h1
          style={{
            backgroundImage: 'linear-gradient(135deg, #ffffff 40%, #E95464 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
          className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-4 uppercase"
        >
          ${brandTitle}
        </h1>

        <p className="text-xl sm:text-2xl font-semibold tracking-wide text-zinc-200 uppercase mb-3">
          DYNAMIC SPATIAL MOTION GRAPHIC
        </p>

        {/* Dynamic Animated Pulse Wave / SVG Graphic */}
        <div className="w-full max-w-md h-12 mt-6 flex items-center justify-center opacity-85">
          <svg viewBox="0 0 400 60" className="w-full h-full stroke-[#E95464] fill-none stroke-2">
            <path
              d="M 0 30 Q 50 30 70 30 L 90 10 L 110 50 L 130 15 L 150 40 L 170 30 Q 250 30 270 30 L 290 8 L 310 52 L 330 20 L 350 30 L 400 30"
              strokeDasharray="400"
              strokeDashoffset={400 - (frame * 3) % 400}
              className="transition-all"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Floating Telemetry Cards (Visual Atmosphere Only - No Buttons) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-4">
        <div
          style={{
            transform: \`scale(\${Math.max(0, card1Enter)})\`,
            opacity: Math.max(0, Math.min(1, card1Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#E95464]/15 border border-[#E95464]/30 flex items-center justify-center text-[#E95464] shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">Engine Core</div>
            <div className="text-xl font-bold text-white tracking-tight">AI Driven</div>
          </div>
        </div>

        <div
          style={{
            transform: \`scale(\${Math.max(0, card2Enter)})\`,
            opacity: Math.max(0, Math.min(1, card2Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">Architecture</div>
            <div className="text-xl font-bold text-white tracking-tight">Zero-Latency</div>
          </div>
        </div>

        <div
          style={{
            transform: \`scale(\${Math.max(0, card3Enter)})\`,
            opacity: Math.max(0, Math.min(1, card3Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">Interaction</div>
            <div className="text-xl font-bold text-white tracking-tight">DOM Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
};

/**
 * Dispatches Remotion motion graphic generation using multi-modal inputs:
 * text prompt + uploaded design images, steered by systemprompt.md & remotionSkill.md
 */
export const generateRemotionMotionVideo = async ({
  prompt,
  images = [],
  user = null,
  apiKey = null,
  model = DEFAULT_OPENROUTER_MODEL,
  onProgress = () => {}
}) => {
  const durationSeconds = getMaxDurationForUser(user) || 15.0;
  const fps = 30;
  const durationInFrames = Math.round(durationSeconds * fps);

  onProgress({
    stage: 'plan_check',
    percent: 15,
    message: `Configuring ${durationSeconds}s canvas for ${user?.plan || 'pro'} tier...`
  });

  const resolvedApiKey =
    apiKey ||
    import.meta.env?.VITE_OPENROUTER_API_KEY ||
    localStorage.getItem('antra_openrouter_api_key') ||
    window?.ENV?.OPENROUTER_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_OPENROUTER_API_KEY : null);

  const compositeSystemPrompt = buildCompositeSystemPrompt({
    durationInFrames,
    durationSeconds,
    fps
  });

  // Attempt real OpenRouter API call if key is available
  if (resolvedApiKey) {
    const hasImages = Array.isArray(images) && images.some((img) => img.base64 || img.dataUrl);

    // If images are provided, prioritize models that support image input
    const candidateModels = hasImages
      ? [
          OPENROUTER_MODELS.LING_FLASH_FREE,
          OPENROUTER_MODELS.NEMOTRON_VL_FREE,
          OPENROUTER_MODELS.OPENROUTER_FREE
        ]
      : [
          model || OPENROUTER_MODELS.COHERE_CODE_FREE,
          OPENROUTER_MODELS.COHERE_CODE_FREE,
          OPENROUTER_MODELS.LING_FLASH_FREE,
          OPENROUTER_MODELS.LIQUID_FREE,
          OPENROUTER_MODELS.OPENROUTER_FREE
        ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    // Build user message content supporting multi-modal design images
    const userMessageContent = [];

    const userInstructions = `Here is the user brief about their business / product:
"${prompt || 'Modern interactive product experience'}".

Design Reference Files Uploaded: ${images.length} file(s).
Total Video Duration Budget: ${durationSeconds} seconds (${durationInFrames} frames at ${fps} FPS).

Instructions:
1. Generate the Remotion React component \`MotionScene()\` that visually tells the story of this product/business.
2. If design images are attached, extract their color palette, typography styling, and branding atmosphere.
3. REMEMBER: DO NOT INCLUDE BUTTONS OR CLICKABLE CONTROLS in the video code. This video is strictly the visual background backdrop.
4. SYNTAX RULE: When writing inline style={{ transform: ... }}, wrap strings containing \${...} in backticks: style={{ transform: \`scale(\${scale})\` }}
5. Return ONLY runnable React component code.`;

    userMessageContent.push({
      type: 'text',
      text: userInstructions
    });

    // Append base64 design reference images if provided
    if (hasImages) {
      for (const img of images) {
        if (img.base64 || img.dataUrl) {
          userMessageContent.push({
            type: 'image_url',
            image_url: {
              url: img.base64 || img.dataUrl
            }
          });
        }
      }
    }

    for (const currentModel of candidateModels) {
      try {
        onProgress({
          stage: 'prompting',
          percent: 40,
          message: `Synthesizing Remotion motion graphics with ${currentModel}...`
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per candidate

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${resolvedApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin || 'https://antra.website',
            'X-Title': 'Antra Remotion Motion Engine'
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              {
                role: 'system',
                content: compositeSystemPrompt
              },
              {
                role: 'user',
                content: hasImages ? userMessageContent : userInstructions
              }
            ],
            temperature: 0.7
          })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';

          // Clean markdown code blocks and wrappers
          let cleanCode = content
            .replace(/```(javascript|jsx|tsx|react)?/gi, '')
            .replace(/```/g, '')
            .trim();

          // Standardize component declaration
          if (!cleanCode.includes('function MotionScene') && cleanCode.includes('export default function')) {
            cleanCode = cleanCode.replace(/export default function\s*\w*/, 'function MotionScene');
          }

          if (cleanCode.length > 50) {
            // Test compile before accepting model output
            const testComp = compileRemotionCode(cleanCode);
            if (testComp) {
              onProgress({ stage: 'compiling', percent: 85, message: 'Compiling React Remotion timeline...' });
              await new Promise((r) => setTimeout(r, 200));
              onProgress({ stage: 'ready', percent: 100, message: 'Motion graphics ready!' });

              return {
                code: cleanCode,
                duration: durationSeconds,
                durationInFrames,
                fps,
                prompt,
                modelUsed: currentModel
              };
            } else {
              console.warn(`Model ${currentModel} returned non-compiling Remotion code, trying fallback model...`);
            }
          }
        } else {
          console.warn(`OpenRouter API model ${currentModel} returned status:`, response.status);
        }
      } catch (err) {
        console.warn(`OpenRouter API call failed for model ${currentModel}:`, err);
      }
    }
  }

  // Fallback Pipeline: Rich procedural motion graphics tailored to the user brief
  const steps = [
    { percent: 35, message: `Synthesizing ${durationSeconds}s kinetic motion canvas...` },
    { percent: 70, message: 'Interpolating ambient lighting, orbital geometry & SVG telemetry...' },
    { percent: 90, message: 'Assembling interactive Remotion composition layer...' },
    { percent: 100, message: 'Ready!' }
  ];

  for (const step of steps) {
    onProgress({ stage: 'simulating', percent: step.percent, message: step.message });
    await new Promise((r) => setTimeout(r, 150));
  }

  const proceduralCode = generateProceduralRemotionCode({
    prompt,
    durationInFrames,
    durationSeconds,
    fps
  });

  return {
    code: proceduralCode,
    duration: durationSeconds,
    durationInFrames,
    fps,
    prompt,
    modelUsed: 'procedural-motion-canvas-v2'
  };
};

/**
 * Safe Proxy for Lucide Icons to prevent undefined component errors during dynamic compilation
 */
const SafeLucideIcons = new Proxy(LucideIcons, {
  get: (target, prop) => {
    if (typeof prop === 'string' && prop in target) {
      return target[prop];
    }
    return target.Sparkles || target.Activity || target.Zap || (() => null);
  }
});

/**
 * Dynamically compiles Remotion JSX code into a live React component
 */
export const compileRemotionCode = (codeString) => {
  if (!codeString || typeof codeString !== 'string') {
    return null;
  }

  try {
    let cleanCode = codeString.trim();

    // 1. Strip all ES module import statements
    cleanCode = cleanCode.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    cleanCode = cleanCode.replace(/import\s+['"][^'"]+['"];?/g, '');

    // 2. Standardize default export to function MotionScene or const MotionScene
    if (cleanCode.includes('export default function')) {
      cleanCode = cleanCode.replace(/export\s+default\s+function\s*(\w*)/, 'function MotionScene');
    } else if (cleanCode.includes('export default')) {
      cleanCode = cleanCode.replace(/export\s+default\s+/, 'const MotionScene = ');
    } else {
      cleanCode = cleanCode.replace(/export\s+/g, '');
    }

    // 3. Auto-fix unquoted template strings in style props (e.g. style={{ transform: scale(${s}) }})
    cleanCode = cleanCode.replace(/style=\{\{([^}]+)\}\}/g, (match, body) => {
      // Look for prop: unquoted_with_dollar_curly
      const fixedBody = body.replace(/([a-zA-Z0-9_-]+)\s*:\s*([^'"`,\n]+\$\{[^}]+\}[^'"`,\n]*)/g, (m, prop, val) => {
        return `${prop}: \`${val.trim()}\``;
      });
      return `style={{${fixedBody}}}`;
    });

    // 4. Transform JSX using Babel Standalone
    const transformed = Babel.transform(cleanCode, {
      presets: ['react'],
      filename: 'remotionScene.jsx'
    }).code;

    // 5. Construct comprehensive sandbox scope with injected Remotion hooks, React, and Lucide Icons
    const sandboxScope = {
      React,
      ...React,
      Remotion,
      ...Remotion,
      AbsoluteFill: Remotion.AbsoluteFill || (({ children, style, className }) => React.createElement('div', { style: { position: 'absolute', inset: 0, ...style }, className }, children)),
      LucideIcons: SafeLucideIcons,
      ...SafeLucideIcons,
      durationSeconds: 15,
      durationInFrames: 450,
      fps: 30
    };

    const argNames = Object.keys(sandboxScope);
    const argValues = Object.values(sandboxScope);

    // 6. Inject destructured icon bindings and hooks so JSX tag names work directly
    const hookInjects = `
      const useCurrentFrame = Remotion?.useCurrentFrame || React.useContext;
      const useVideoConfig = Remotion?.useVideoConfig || (() => ({ fps: 30, durationInFrames: 450, width: 1920, height: 1080 }));
      const interpolate = Remotion?.interpolate || ((val, inR, outR) => (Array.isArray(outR) ? outR[0] : 0));
      const spring = Remotion?.spring || (() => 1);
      const Easing = Remotion?.Easing || { bezier: () => () => 1, ease: () => 1, inOut: () => () => 1 };
      const Sequence = Remotion?.Sequence || (({ children }) => children);
      const Img = Remotion?.Img || (props => React.createElement('img', props));
      const AbsoluteFill = Remotion?.AbsoluteFill || (({ children, style, className }) => React.createElement('div', { style: { position: 'absolute', inset: 0, ...style }, className }, children));
      const interpolateColors = Remotion?.interpolateColors || (() => '#ffffff');
      const { useState, useEffect, useMemo, useRef, useCallback } = React;
      const {
        Flame, Activity, Zap, Sparkles, Trophy, Dumbbell, Heart, TrendingUp,
        ArrowRight, ChevronRight, Shield, Layers, Code, Globe, Star, Check,
        CheckCircle, Play, Pause, Clock, Compass, Sliders, Smartphone, Laptop,
        CreditCard, BarChart2, BarChart, Cpu, Wifi, Eye, RefreshCw, Radio, Target,
        Search, AlertCircle
      } = LucideIcons;
    `;

    // 7. Return evaluated component function
    const factory = new Function(
      ...argNames,
      `
      try {
        ${hookInjects}
        ${transformed}
        if (typeof MotionScene === 'function') return MotionScene;
        if (typeof Scene === 'function') return Scene;
        if (typeof App === 'function') return App;
        if (typeof Video === 'function') return Video;
        if (typeof MyComp === 'function') return MyComp;
        if (typeof Composition === 'function') return Composition;
        const possible = [typeof MotionScene !== 'undefined' ? MotionScene : null, typeof Scene !== 'undefined' ? Scene : null, typeof App !== 'undefined' ? App : null];
        for (const p of possible) {
          if (typeof p === 'function') return p;
        }
      } catch (innerErr) {
        console.warn('Remotion dynamic execution error:', innerErr);
      }
      return null;
    `
    );

    return factory(...argValues);
  } catch (err) {
    console.error('Failed to compile Remotion code:', err);
    return null;
  }
};
