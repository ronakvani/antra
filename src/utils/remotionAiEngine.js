/**
 * Antra Remotion AI Motion Graphics Engine
 * Transforms builder raw text prompts into production-grade Remotion React motion graphic code
 * with dynamic theme detection, kinetic typography, animated SVG charts, and metric HUDs.
 */

import * as Babel from '@babel/standalone';
import React from 'react';
import * as Remotion from 'remotion';
import * as LucideIcons from 'lucide-react';
import { getMaxDurationForUser } from './planFeatures.js';

export const OPENROUTER_MODELS = {
  OPENROUTER_FREE: 'openrouter/free',
  INKLING_SMALL: 'thinkingmachines/inkling-small:free',
  QWEN_FREE: 'qwen/qwen3.8-27b:free',
  NVIDIA_SUPER_FREE: 'nvidia/nemotron-3-super-120b-a12b:free',
  GEMINI_FLASH: 'google/gemini-2.5-flash',
  GEMINI_FLASH_001: 'google/gemini-2.0-flash-001',
  LLAMA_70B: 'meta-llama/llama-3.3-70b-instruct',
  DEEPSEEK_CHAT: 'deepseek/deepseek-chat',
  GEMMA_FREE: 'google/gemma-4-31b-it:free'
};

export const DEFAULT_OPENROUTER_MODEL = OPENROUTER_MODELS.OPENROUTER_FREE;

/**
 * Intelligent domain and theme extractor for user creative briefs
 */
export const analyzePromptTheme = (rawPrompt = '') => {
  const p = (rawPrompt || '').toLowerCase();

  // 1. Fitness / Gym / Workout / Sports
  if (p.match(/fitness|gym|workout|exercise|training|sport|health|athlete|muscle|crossfit|runner|running|diet/)) {
    return {
      category: 'fitness',
      brandName: 'PULSE FIT',
      tagline: 'ELEVATE YOUR PEAK PHYSICAL PERFORMANCE',
      subtext: 'Real-time biometric telemetry, adaptive workout pacing & smart recovery tracking.',
      primaryColor: '#FF3B30', // Crimson Red
      secondaryColor: '#FF9500', // Neon Orange
      accentColor: '#FFCC00', // Gold
      badgeText: 'FITNESS INTELLIGENCE · APP LAUNCH',
      stats: [
        { label: 'Active Burn', value: '842 kcal', icon: 'Flame', sub: '+18% vs avg' },
        { label: 'Heart Rate', value: '168 BPM', icon: 'Activity', sub: 'Zone 4 Peak' },
        { label: 'Workout Target', value: '94.2%', icon: 'Trophy', sub: 'Daily Goal Met' }
      ],
      chartType: 'ecg'
    };
  }

  // 2. Crypto / Fintech / Banking / Trading
  if (p.match(/crypto|bitcoin|finance|fintech|bank|trading|wallet|invest|stock|wealth|money|defi|payment/)) {
    return {
      category: 'fintech',
      brandName: 'NEXUS CAPITAL',
      tagline: 'NEXT-GENERATION DECENTRALIZED PROTOCOL',
      subtext: 'Institutional liquidity, zero-latency execution & encrypted multi-sig vaults.',
      primaryColor: '#10B981', // Emerald Green
      secondaryColor: '#06B6D4', // Cyan
      accentColor: '#6366F1', // Indigo
      badgeText: 'FINANCIAL PROTOCOL · WEB3 LAUNCH',
      stats: [
        { label: '24h Volume', value: '$284.9M', icon: 'TrendingUp', sub: '+24.6% today' },
        { label: 'Execution', value: '0.02 ms', icon: 'Zap', sub: 'Sub-second' },
        { label: 'Total Value', value: '$1.42B', icon: 'Shield', sub: 'Audited Vault' }
      ],
      chartType: 'candles'
    };
  }

  // 3. AI / Developer / SaaS / Software / Tech
  if (p.match(/ai|software|saas|developer|code|cloud|api|neural|agent|tech|database|startup|bot|machine learning/)) {
    return {
      category: 'ai_saas',
      brandName: 'SYNAPSE AI',
      tagline: 'AUTONOMOUS REASONING AGENTS AT HYPERSCALE',
      subtext: 'Self-orchestrating multi-agent systems engineered for instant code compilation & deployment.',
      primaryColor: '#8B5CF6', // Violet
      secondaryColor: '#EC4899', // Hot Pink
      accentColor: '#3B82F6', // Blue
      badgeText: 'COGNITIVE CLUSTER · v2.0 LAUNCH',
      stats: [
        { label: 'Throughput', value: '14.8k tok/s', icon: 'Cpu', sub: 'Low Latency' },
        { label: 'Reasoning Score', value: '99.4%', icon: 'Sparkles', sub: 'Top Benchmark' },
        { label: 'Uptime', value: '99.99%', icon: 'Layers', sub: 'Zero Cold Start' }
      ],
      chartType: 'nodes'
    };
  }

  // 4. Luxury / Real Estate / Fashion / Architecture
  if (p.match(/luxury|fashion|real estate|penthouse|architecture|interior|jewelry|perfume|hotel|design|clothing|brand/)) {
    return {
      category: 'luxury',
      brandName: 'AURA ATELIER',
      tagline: 'UNCOMPROMISED MODERN ARCHITECTURAL ELEGANCE',
      subtext: 'Mastercrafted spatial design, bespoke material palettes & timeless monolithic beauty.',
      primaryColor: '#F59E0B', // Warm Gold
      secondaryColor: '#E2E8F0', // Platinum
      accentColor: '#F43F5E', // Rose
      badgeText: 'HAUTE COUTURE · PRIVATE COLLECTION',
      stats: [
        { label: 'Curation', value: 'Edition 01', icon: 'Star', sub: 'Private Reserve' },
        { label: 'Material', value: 'Titanium Glass', icon: 'Sliders', sub: 'Ultra Precision' },
        { label: 'Global Atelier', value: 'Paris · Tokyo', icon: 'Compass', sub: 'Exclusivity' }
      ],
      chartType: 'rings'
    };
  }

  // 5. Gaming / Entertainment / Media
  if (p.match(/game|gaming|esports|stream|music|video|arcade|rpg|metaverse|play/)) {
    return {
      category: 'gaming',
      brandName: 'VORTEX ARENA',
      tagline: 'HYPER-IMMERSIVE COMPETITIVE GAMING REALM',
      subtext: 'Zero-latency spatial audio, ultra-high tickrate engine & global matchmaking matrix.',
      primaryColor: '#EC4899',
      secondaryColor: '#8B5CF6',
      accentColor: '#06B6D4',
      badgeText: 'NEXT-GEN ESPORTS · GLOBAL ACCESS',
      stats: [
        { label: 'FPS Engine', value: '240 FPS', icon: 'Zap', sub: 'Ultra-Smooth' },
        { label: 'Global Rank', value: '#1 Apex', icon: 'Trophy', sub: 'Championship' },
        { label: 'Active Squads', value: '1.2M', icon: 'Radio', sub: 'Live Online' }
      ],
      chartType: 'radar'
    };
  }

  // 6. Cyber / Security / Cloud Infrastructure
  if (p.match(/security|cyber|cloud|privacy|auth|shield|protect|encrypt|firewall|guard|server|infra/)) {
    return {
      category: 'cybersecurity',
      brandName: 'SENTINEL DEFENSE',
      tagline: 'AUTONOMOUS ZERO-TRUST CLOUD INFRASTRUCTURE',
      subtext: 'Edge-isolated multi-region encryption with automated real-time threat neutralization.',
      primaryColor: '#06B6D4', // Cyan
      secondaryColor: '#3B82F6', // Blue
      accentColor: '#10B981', // Emerald
      badgeText: 'ZERO-TRUST ENCLAVE · SOC-2 COMPLIANT',
      stats: [
        { label: 'Threat Blocked', value: '99.98%', icon: 'Shield', sub: 'Real-time AI Guard' },
        { label: 'Edge Latency', value: '0.8 ms', icon: 'Zap', sub: 'Global Routing' },
        { label: 'Uptime SLA', value: '99.999%', icon: 'Lock', sub: 'Multi-Region' }
      ],
      chartType: 'nodes'
    };
  }

  // 7. E-Commerce / Retail / D2C Brands
  if (p.match(/shop|store|ecommerce|e-commerce|product|retail|buy|sell|cart|checkout|d2c|goods/)) {
    return {
      category: 'ecommerce',
      brandName: 'VELOCITY STORE',
      tagline: 'CURATED HIGH-PERFORMANCE DIGITAL COMMERCE',
      subtext: 'Frictionless one-click checkout, hyper-personalized drops & global lightning delivery.',
      primaryColor: '#F43F5E', // Rose
      secondaryColor: '#FB923C', // Coral
      accentColor: '#8B5CF6', // Purple
      badgeText: 'GLOBAL COMMERCE · EDITION 2026',
      stats: [
        { label: 'Conversion', value: '4.8x Lift', icon: 'TrendingUp', sub: 'Optimized Flow' },
        { label: 'Dispatch', value: 'Instant', icon: 'Zap', sub: 'Global Hub' },
        { label: 'Customer CSAT', value: '4.98 / 5', icon: 'Star', sub: 'Verified Orders' }
      ],
      chartType: 'ecg'
    };
  }

  // Default Universal / Futuristic Digital Experience
  const words = rawPrompt.trim().split(/\s+/).filter(Boolean);
  const cleanTitle = words.length > 0 ? words.slice(0, 3).join(' ').toUpperCase() : 'ANTRA STUDIO';

  return {
    category: 'universal',
    brandName: cleanTitle,
    tagline: 'INTERACTIVE SPATIAL WEB EXPERIENCE',
    subtext: 'Scroll-driven interactive canvas engineered with Remotion motion graphics & React DOM layers.',
    primaryColor: '#E95464',
    secondaryColor: '#F2A0A1',
    accentColor: '#6366F1',
    badgeText: 'MOTION BACKDROP · REMOTION ENGINE',
    stats: [
      { label: 'Frame Rate', value: '60 FPS', icon: 'Sparkles', sub: 'Hardware Accelerated' },
      { label: 'DOM Layer', value: 'Interactive', icon: 'Layers', sub: 'Penpot Components' },
      { label: 'Pipeline', value: 'Zero Latency', icon: 'Zap', sub: 'React Powered' }
    ],
    chartType: 'ecg'
  };
};

/**
 * System prompt strictly guiding the LLM to output valid Remotion React code
 */
export const buildRemotionSystemPrompt = ({ durationInFrames, durationSeconds, fps, theme }) => {
  return `You are Antra's Motion Graphics Engine. You generate modern, high-aesthetic Remotion React motion graphic scenes.

CREATIVE DIRECTIVE:
- The user prompt is a creative brief/instruction (e.g. "create a app launch video of fitness and gym").
- DO NOT just print the user's prompt as a raw title text!
- Transform the prompt into an authentic, branded motion graphics experience (e.g. for fitness: brand name "${theme.brandName}", punchy headline "${theme.tagline}", animated live stats/HUD metric cards with icons, ECG heartbeat pulse lines, energetic glowing neon rings, and kinetic typography).

SPECIFICATIONS & CONSTRAINTS:
1. Output ONLY valid React component code that exports default function MotionScene().
2. Do NOT output markdown code blocks (\`\`\`), no import statements, no comments outside the code.
3. Total duration is ${durationInFrames} frames (${durationSeconds}s at ${fps} FPS).
4. Available hooks & globals in runtime scope:
   - React (useState, useEffect, useMemo, useRef)
   - Remotion: useCurrentFrame, useVideoConfig, interpolate, spring, Easing, Sequence, Img
   - LucideIcons (e.g., Flame, Activity, Zap, Sparkles, Trophy, Shield, TrendingUp, Cpu, Layers, Code, Globe, Star, Compass, ArrowRight)
5. Design Aesthetic:
   - Modern, sleek, dark-mode luxury, high contrast, smooth 60fps bezier curves.
   - Dynamic radial ambient glowing backgrounds (colors: ${theme.primaryColor}, ${theme.secondaryColor}).
   - Multi-phase timeline:
     * Phase 1 (0 to 30% frames): Smooth spring entrance of main brand badge and headline.
     * Phase 2 (30% to 75% frames): Staggered entrance of 3 floating metric HUD cards with animated icons and progress meters.
     * Phase 3 (75% to 100% frames): Continuous ambient floating particles, rotating vector rings, and glowing pulse loops.
6. Responsive layout fitting full 1920x1080 16:9 canvas (using absolute positioning, flex, or grid with Tailwind classes and inline styles).
7. Return ONLY clean executable JavaScript React code.`;
};

/**
 * Generates customized, rich procedural Remotion code tailored to the extracted domain
 */
export const generateProceduralRemotionCode = ({ prompt = '', durationInFrames = 450, durationSeconds = 15, fps = 30 }) => {
  const theme = analyzePromptTheme(prompt);

  return `function MotionScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const durationSeconds = ${durationSeconds};
  const durationInFrames = ${durationInFrames};

  // Camera subtle push-in zoom
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateRight: 'clamp'
  });

  // Intro physics spring scale
  const enterScale = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6 }
  });

  // Continuous ambient rotations & pulse
  const rotateAngle = interpolate(frame, [0, durationInFrames], [0, 360]);
  const pulseGlow = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0.8, 1.25, 0.8]);
  const floatY = interpolate(frame, [0, Math.round(durationInFrames / 2), durationInFrames], [0, -14, 0]);

  // Staggered timeline sequences for 3 Metric Cards
  const card1Enter = spring({ frame: frame - 15, fps, config: { damping: 12, mass: 0.5 } });
  const card2Enter = spring({ frame: frame - 30, fps, config: { damping: 12, mass: 0.5 } });
  const card3Enter = spring({ frame: frame - 45, fps, config: { damping: 12, mass: 0.5 } });

  // Animated ECG / Pulse Wave Progress
  const pulseOffset = interpolate(frame, [0, durationInFrames], [0, 100]);

  return (
    <div
      style={{ transform: \`scale(\${cameraScale})\` }}
      className="relative w-full h-full bg-[#060608] text-white flex flex-col items-center justify-between p-12 overflow-hidden select-none font-sans"
    >
      {/* Dynamic Ambient Background Aura */}
      <div
        style={{
          background: 'radial-gradient(circle at 50% 45%, ${theme.primaryColor}28 0%, transparent 60%)',
          transform: \`scale(\${pulseGlow})\`
        }}
        className="absolute inset-0 pointer-events-none blur-[140px]"
      />
      <div
        style={{
          background: 'radial-gradient(circle at 25% 75%, ${theme.secondaryColor}20 0%, transparent 55%)'
        }}
        className="absolute inset-0 pointer-events-none blur-[100px]"
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

      {/* Floating Kinetic Orbital Rings */}
      <div
        style={{
          transform: \`rotate(\${rotateAngle * 0.3}deg)\`,
          border: '1px dashed ${theme.primaryColor}55'
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
        <Sparkles className="w-3.5 h-3.5 text-[${theme.primaryColor}] animate-pulse" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-300">
          ${theme.badgeText}
        </span>
      </div>

      {/* Central Kinetic Headline & Mission Hero */}
      <div
        style={{
          transform: \`scale(\${enterScale}) translateY(\${floatY}px)\`
        }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mt-6"
      >
        <h1
          style={{
            backgroundImage: 'linear-gradient(135deg, #ffffff 30%, ${theme.secondaryColor} 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
          className="text-5xl sm:text-7xl font-black tracking-tight leading-none mb-4 uppercase"
        >
          ${theme.brandName}
        </h1>

        <p className="text-xl sm:text-2xl font-semibold tracking-wide text-zinc-200 uppercase mb-3">
          ${theme.tagline}
        </p>

        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          ${theme.subtext}
        </p>

        {/* Dynamic Animated Pulse Wave / ECG SVG */}
        <div className="w-full max-w-md h-12 mt-6 flex items-center justify-center opacity-85">
          <svg viewBox="0 0 400 60" className="w-full h-full stroke-[${theme.primaryColor}] fill-none stroke-2">
            <path
              d="M 0 30 Q 50 30 70 30 L 90 10 L 110 50 L 130 15 L 150 40 L 170 30 Q 250 30 270 30 L 290 8 L 310 52 L 330 20 L 350 30 L 400 30"
              strokeDasharray="400"
              strokeDashoffset={400 - (frame * 3) % 400}
              className="transition-all"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Floating Staggered 3-Card HUD Metrics */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-4">
        {/* Metric 1 */}
        <div
          style={{
            transform: \`scale(\${Math.max(0, card1Enter)})\`,
            opacity: Math.max(0, Math.min(1, card1Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[${theme.primaryColor}]/15 border border-[${theme.primaryColor}]/30 flex items-center justify-center text-[${theme.primaryColor}] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">
              ${theme.stats[0].label}
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              ${theme.stats[0].value}
            </div>
            <div className="text-[10px] font-mono text-[${theme.primaryColor}]">
              ${theme.stats[0].sub}
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            transform: \`scale(\${Math.max(0, card2Enter)})\`,
            opacity: Math.max(0, Math.min(1, card2Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[${theme.secondaryColor}]/15 border border-[${theme.secondaryColor}]/30 flex items-center justify-center text-[${theme.secondaryColor}] shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">
              ${theme.stats[1].label}
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              ${theme.stats[1].value}
            </div>
            <div className="text-[10px] font-mono text-[${theme.secondaryColor}]">
              ${theme.stats[1].sub}
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            transform: \`scale(\${Math.max(0, card3Enter)})\`,
            opacity: Math.max(0, Math.min(1, card3Enter))
          }}
          className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl flex items-center gap-3.5 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-[${theme.accentColor}]/15 border border-[${theme.accentColor}]/30 flex items-center justify-center text-[${theme.accentColor}] shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400 leading-tight">
              ${theme.stats[2].label}
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              ${theme.stats[2].value}
            </div>
            <div className="text-[10px] font-mono text-[${theme.accentColor}]">
              ${theme.stats[2].sub}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;
};

/**
 * Dispatches Remotion motion graphic generation to OpenRouter or seamless procedural fallback
 */
export const generateRemotionMotionVideo = async ({
  prompt,
  user = null,
  apiKey = null,
  model = DEFAULT_OPENROUTER_MODEL,
  onProgress = () => {}
}) => {
  const durationSeconds = getMaxDurationForUser(user) || 15.0;
  const fps = 30;
  const durationInFrames = Math.round(durationSeconds * fps);
  const theme = analyzePromptTheme(prompt);

  onProgress({
    stage: 'plan_check',
    percent: 15,
    message: `Configuring ${durationSeconds}s ${theme.category} timeline for ${user?.plan || 'pro'} tier...`
  });

  const resolvedApiKey =
    apiKey ||
    import.meta.env?.VITE_OPENROUTER_API_KEY ||
    localStorage.getItem('antra_openrouter_api_key') ||
    window?.ENV?.OPENROUTER_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_OPENROUTER_API_KEY : null);

  // Attempt real OpenRouter API call if key is available
  if (resolvedApiKey) {
    const candidateModels = [
      model,
      OPENROUTER_MODELS.OPENROUTER_FREE,
      OPENROUTER_MODELS.INKLING_SMALL,
      OPENROUTER_MODELS.QWEN_FREE,
      OPENROUTER_MODELS.NVIDIA_SUPER_FREE,
      OPENROUTER_MODELS.GEMINI_FLASH,
      OPENROUTER_MODELS.GEMINI_FLASH_001,
      OPENROUTER_MODELS.LLAMA_70B,
      OPENROUTER_MODELS.DEEPSEEK_CHAT
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    for (const currentModel of candidateModels) {
      try {
        onProgress({
          stage: 'prompting',
          percent: 40,
          message: `Synthesizing ${theme.category} Remotion React code with ${currentModel}...`
        });

        const systemPrompt = buildRemotionSystemPrompt({
          durationInFrames,
          durationSeconds,
          fps,
          theme
        });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
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
                content: systemPrompt
              },
              {
                role: 'user',
                content: `Generate a sleek Remotion motion graphics background for: "${prompt}". 
Topic: ${theme.category}. 
Brand title: "${theme.brandName}". 
Headline: "${theme.tagline}". 
Total Duration: ${durationSeconds}s (${durationInFrames} frames). Include 3 floating animated metric HUD cards, SVG charts, and glowing pulse effects.`
              }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';

          // Clean markdown backticks and wrappers
          let cleanCode = content
            .replace(/```(javascript|jsx|tsx|react)?/gi, '')
            .replace(/```/g, '')
            .trim();

          // Standardize function declaration
          if (!cleanCode.includes('function MotionScene') && cleanCode.includes('export default function')) {
            cleanCode = cleanCode.replace(/export default function\s*\w*/, 'function MotionScene');
          }

          if (cleanCode.length > 50) {
            // Test compile before accepting model output
            const testComp = compileRemotionCode(cleanCode);
            if (testComp) {
              onProgress({ stage: 'compiling', percent: 85, message: 'Compiling React Remotion timeline...' });
              await new Promise((r) => setTimeout(r, 250));
              onProgress({ stage: 'ready', percent: 100, message: 'Motion graphics ready!' });

              return {
                code: cleanCode,
                duration: durationSeconds,
                durationInFrames,
                fps,
                prompt,
                theme,
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

  // Developer / Fallback Pipeline (High-fidelity procedural generation tailored to theme)
  const steps = [
    { percent: 35, message: `Synthesizing ${durationSeconds}s ${theme.brandName} kinetic timeline...` },
    { percent: 70, message: `Interpolating ${theme.category} HUD metrics, ECG pulse & SVG geometry...` },
    { percent: 90, message: 'Assembling interactive Remotion composition layer...' },
    { percent: 100, message: 'Ready!' }
  ];

  for (const step of steps) {
    onProgress({ stage: 'simulating', percent: step.percent, message: step.message });
    await new Promise((r) => setTimeout(r, 200));
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
    theme,
    modelUsed: 'procedural-thematic-remotion-v2'
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
    return target.Sparkles || target.Activity || (() => null);
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

    // 3. Transform JSX using Babel Standalone
    const transformed = Babel.transform(cleanCode, {
      presets: ['react'],
      filename: 'remotionScene.jsx'
    }).code;

    // 4. Construct comprehensive sandbox scope with injected Remotion hooks, React, and Lucide Icons
    const sandboxScope = {
      React,
      ...React,
      Remotion,
      ...Remotion,
      LucideIcons: SafeLucideIcons,
      ...SafeLucideIcons,
      durationSeconds: 15,
      durationInFrames: 450,
      fps: 30
    };

    const argNames = Object.keys(sandboxScope);
    const argValues = Object.values(sandboxScope);

    // 5. Inject destructured icon bindings and hooks so JSX tag names (<Flame />, <Activity />, <Zap />) work directly
    const hookInjects = `
      const useCurrentFrame = Remotion?.useCurrentFrame || React.useContext;
      const useVideoConfig = Remotion?.useVideoConfig || (() => ({ fps: 30, durationInFrames: 450, width: 1920, height: 1080 }));
      const interpolate = Remotion?.interpolate || ((val, inR, outR) => (Array.isArray(outR) ? outR[0] : 0));
      const spring = Remotion?.spring || (() => 1);
      const Easing = Remotion?.Easing || { bezier: () => () => 1, ease: () => 1 };
      const Sequence = Remotion?.Sequence || (({ children }) => children);
      const Img = Remotion?.Img || (props => React.createElement('img', props));
      const interpolateColors = Remotion?.interpolateColors || (() => '#ffffff');
      const { useState, useEffect, useMemo, useRef, useCallback } = React;
      const {
        Flame, Activity, Zap, Sparkles, Trophy, Dumbbell, Heart, TrendingUp,
        ArrowRight, ChevronRight, Shield, Layers, Code, Globe, Star, Check,
        CheckCircle, Play, Pause, Clock, Compass, Sliders, Smartphone, Laptop,
        CreditCard, BarChart2, BarChart, Cpu, Wifi, Eye, RefreshCw, Radio, Target
      } = LucideIcons;
    `;

    // 6. Return evaluated component function
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
        // Fallback: search declared functions in scope
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
