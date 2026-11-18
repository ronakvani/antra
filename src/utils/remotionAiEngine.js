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

// Currently active free-tier models on OpenRouter with verified live availability
export const OPENROUTER_MODELS = {
  COHERE_CODE_FREE: 'cohere/north-mini-code:free',
  LING_FLASH_FREE: 'inclusionai/ling-3.2-flash:free',
  NEMOTRON_VL_FREE: 'nvidia/nemotron-3.5-super-vl:free',
  PARTICLE_FREE: 'particle-ai/particle-1:free',
  OPENROUTER_FREE: 'openrouter/free'
};

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS.COHERE_CODE_FREE;

/**
 * Builds the comprehensive prompt combining systemprompt.md and remotionSkill.md
 */
export const buildCompositeSystemPrompt = ({ durationInFrames, durationSeconds, fps }) => {
  return `${SYSTEM_PROMPT}

==============================
REMOTION MOTION DESIGN DIRECTIVES
==============================
${REMOTION_SKILL}

==============================
RUNTIME SPECIFICATIONS
==============================
- Resolution: 1920x1080 (16:9)
- Total Duration: ${durationSeconds}s (${durationInFrames} frames at ${fps} FPS).
- Component Signature: function MotionScene() or export default function MotionScene()
- Output: Return ONLY pure, executable component code.`;
};

/**
 * Dynamic thematic palette & visual profile extractor for bespoke motion graphics
 */
const inferVisualTheme = (prompt = '') => {
  const p = prompt.toLowerCase();

  if (p.match(/seo|search|rank|keyword|traffic|google|engine/)) {
    return {
      title: 'AI SEARCH INTELLIGENCE',
      tagline: 'AUTONOMOUS INDEXING & TOP-TIER RANK ACCELERATION',
      primaryColor: '#10B981', // Emerald
      secondaryColor: '#06B6D4', // Cyan
      accentColor: '#3B82F6', // Blue
      iconName: 'Search',
      metrics: [
        { label: 'Organic Traffic', value: '+340%', icon: 'TrendingUp' },
        { label: 'Keyword Velocity', value: '14.2x Faster', icon: 'Zap' },
        { label: 'Search Visibility', value: 'Top 0.1%', icon: 'Sparkles' }
      ]
    };
  }

  if (p.match(/crypto|bitcoin|fintech|bank|trade|trading|money|defi|wallet|invest/)) {
    return {
      title: 'NEXUS PROTOCOL',
      tagline: 'NEXT-GENERATION DECENTRALIZED ASSET INFRASTRUCTURE',
      primaryColor: '#06B6D4', // Cyan
      secondaryColor: '#6366F1', // Indigo
      accentColor: '#10B981', // Emerald
      iconName: 'Shield',
      metrics: [
        { label: 'Settlement Latency', value: '0.02 ms', icon: 'Zap' },
        { label: '24h Volume', value: '$840.5M', icon: 'TrendingUp' },
        { label: 'Security Audit', value: 'Multi-Sig 100%', icon: 'Lock' }
      ]
    };
  }

  if (p.match(/fitness|gym|workout|sport|muscle|crossfit|health|diet|runner/)) {
    return {
      title: 'PULSE ENGINE',
      tagline: 'BIOMETRIC TELEMETRY & ADAPTIVE ATHLETIC TRAINING',
      primaryColor: '#FF3B30', // Crimson
      secondaryColor: '#FF9500', // Orange
      accentColor: '#FFCC00', // Gold
      iconName: 'Flame',
      metrics: [
        { label: 'Active Caloric Burn', value: '940 kcal', icon: 'Flame' },
        { label: 'Peak Zone Duration', value: '48 mins', icon: 'Activity' },
        { label: 'Recovery Score', value: '96.4%', icon: 'Sparkles' }
      ]
    };
  }

  // Universal modern tech / AI experience
  const words = prompt.trim().split(/\s+/).filter(Boolean);
  const cleanTitle = words.length > 0 ? words.slice(0, 3).join(' ').toUpperCase() : 'ANTRA STUDIO';

  return {
    title: cleanTitle,
    tagline: 'DYNAMIC HIGH-PERFORMANCE WEB VIDEO CANVAS',
    primaryColor: '#8B5CF6', // Violet
    secondaryColor: '#EC4899', // Pink
    accentColor: '#3B82F6', // Blue
    iconName: 'Sparkles',
    metrics: [
      { label: 'Frame Pipeline', value: '60 FPS Smooth', icon: 'Zap' },
      { label: 'Resolution', value: 'Full 1080p', icon: 'Layers' },
      { label: 'Interaction', value: 'DOM Overlay Ready', icon: 'Globe' }
    ]
  };
};

/**
 * Modern procedural motion graphics generator tailored to the extracted domain theme.
 * Completely free of fixed 3D wireframe grids or repetitive boxes.
 */
export const generateProceduralRemotionCode = ({
  prompt = '',
  durationInFrames = 450,
  durationSeconds = 15,
  fps = 30
}) => {
  const theme = inferVisualTheme(prompt);

  return `function MotionScene() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle continuous cinematic camera movement
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp'
  });

  // Scene transition timelines
  const s1End = Math.round(durationInFrames * 0.35);
  const s2End = Math.round(durationInFrames * 0.75);

  const heroSpring = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const pulseLoop = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0.85, 1.25, 0.85]);
  const floatY = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0, -16, 0]);

  // Animated progress curves
  const progress1 = interpolate(frame, [15, s1End], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const progress2 = interpolate(frame, [s1End, s2End], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill className="bg-[#050508] text-white flex flex-col items-center justify-center overflow-hidden select-none font-sans">
      {/* Dynamic Ambient Background Aura */}
      <div
        style={{
          background: 'radial-gradient(circle at 50% 50%, ${theme.primaryColor}22 0%, transparent 65%)',
          transform: \`scale(\${pulseLoop})\`
        }}
        className="absolute inset-0 pointer-events-none blur-[140px]"
      />
      <div
        style={{
          background: 'radial-gradient(circle at 80% 20%, ${theme.secondaryColor}18 0%, transparent 55%)'
        }}
        className="absolute inset-0 pointer-events-none blur-[120px]"
      />

      {/* Cinematic Main Scene (0 to End) */}
      <div
        style={{ transform: \`scale(\${cameraScale})\` }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-between p-16"
      >
        {/* Top Header Identity */}
        <div
          style={{ transform: \`scale(\${heroSpring})\` }}
          className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-xl"
        >
          <${theme.iconName} className="w-4 h-4 text-[${theme.primaryColor}] animate-pulse" />
          <span className="text-xs font-mono tracking-widest uppercase text-zinc-300">
            ${theme.title} · NEXT-GEN INTELLIGENCE
          </span>
        </div>

        {/* Central Kinetic Kinetic Typography & Kinetic SVG Visualizer */}
        <div
          style={{
            transform: \`scale(\${heroSpring}) translateY(\${floatY}px)\`
          }}
          className="flex flex-col items-center text-center max-w-4xl"
        >
          <h1
            style={{
              backgroundImage: 'linear-gradient(135deg, #ffffff 40%, ${theme.secondaryColor} 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
            className="text-6xl sm:text-8xl font-black tracking-tight uppercase mb-4 leading-none"
          >
            ${theme.title}
          </h1>

          <p className="text-lg sm:text-xl font-medium tracking-wide text-zinc-300 uppercase max-w-2xl mb-8">
            ${theme.tagline}
          </p>

          {/* Dynamic SVG Animated Trajectory Graph */}
          <div className="w-full max-w-lg h-20 opacity-80">
            <svg viewBox="0 0 500 80" className="w-full h-full fill-none stroke-2">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="${theme.primaryColor}" />
                  <stop offset="100%" stopColor="${theme.secondaryColor}" />
                </linearGradient>
              </defs>
              <path
                d="M 10 70 Q 120 70 180 50 T 320 25 T 490 10"
                stroke="url(#grad)"
                strokeDasharray="500"
                strokeDashoffset={500 - (progress1 * 500)}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle
                cx={10 + (progress1 * 480)}
                cy={70 - (progress1 * 60)}
                r="5"
                fill="${theme.secondaryColor}"
                className="transition-all"
              />
            </svg>
          </div>
        </div>

        {/* Bottom Kinetic Metric Badges (Visual Data Only - No Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-6 w-full max-w-4xl">
          ${theme.metrics
            .map(
              (m, i) => `
          <div
            style={{
              transform: \`translateY(\${(1 - progress1) * 20}px)\`,
              opacity: progress1
            }}
            className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-3.5 shadow-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-[${theme.primaryColor}]/15 flex items-center justify-center text-[${theme.primaryColor}]">
              <${m.icon} className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">${m.label}</div>
              <div className="text-lg font-bold text-white tracking-tight">${m.value}</div>
            </div>
          </div>`
            )
            .join('')}
        </div>
      </div>
    </AbsoluteFill>
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

    // Fast, responsive free candidate models
    const candidateModels = hasImages
      ? [
          OPENROUTER_MODELS.NEMOTRON_VL_FREE,
          OPENROUTER_MODELS.LING_FLASH_FREE,
          OPENROUTER_MODELS.OPENROUTER_FREE
        ]
      : [
          model || OPENROUTER_MODELS.COHERE_CODE_FREE,
          OPENROUTER_MODELS.COHERE_CODE_FREE,
          OPENROUTER_MODELS.PARTICLE_FREE,
          OPENROUTER_MODELS.LING_FLASH_FREE,
          OPENROUTER_MODELS.OPENROUTER_FREE
        ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    // Build user message content supporting multi-modal design images
    const userMessageContent = [];

    const userInstructions = `Here is the user brief about their business or product:
"${prompt || 'Modern interactive product experience'}".

Video Duration: ${durationSeconds} seconds (${durationInFrames} frames at ${fps} FPS).

Instructions:
1. Write the Remotion React component \`function MotionScene()\` tailored to this specific business/product.
2. DO NOT use generic templates, fixed grids, or repetitive 3-box HUDs. Create a unique, cinematic visual sequence.
3. DO NOT include any HTML buttons or interactive controls inside the video.
4. Output ONLY clean React component code.`;

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
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

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

  // Fallback Pipeline: Bespoke procedural motion graphics tailored to the user brief
  const steps = [
    { percent: 35, message: `Synthesizing ${durationSeconds}s kinetic motion canvas...` },
    { percent: 70, message: 'Interpolating ambient lighting, orbital trajectory & SVG telemetry...' },
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
 * Dynamically compiles Remotion JSX code into a live React component.
 * Supports TypeScript, JSX, and auto-repairs common minor LLM syntax mistakes.
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

    // 3. Auto-repair unquoted template literal syntax in styles (e.g., transform: scale(${x}))
    cleanCode = cleanCode.split('\n').map((line) => {
      return line.replace(
        /^(\s*[a-zA-Z0-9_-]+\s*:\s*)([^\`\'\"\n]+?\$\{[^\n]+\}[^\`\'\"\n,;]*)(,?)$/,
        (m, p1, p2, p3) => `${p1}\`${p2.trim()}\`${p3}`
      );
    }).join('\n');

    // 4. Transform JSX and TypeScript using Babel Standalone
    const transformed = Babel.transform(cleanCode, {
      presets: ['react', 'typescript'],
      filename: 'remotionScene.tsx'
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
        Search, AlertCircle, Lock
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
