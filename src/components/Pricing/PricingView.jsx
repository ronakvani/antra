import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';

export const PricingView = () => {
  const { setViewMode } = useEditor();
  const { user, openAuthModal } = useAuth();

  const handleSelectPlan = () => {
    if (!user) {
      openAuthModal('signup');
    } else {
      setViewMode('editor');
    }
  };

  const CheckIcon = () => (
    <div className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#E95464]/15 text-[#E95464]">
      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
    </div>
  );

  const Dash = () => (
    <span className="text-zinc-600 font-normal select-none">—</span>
  );

  return (
    <div className="min-h-screen w-full bg-[#070709] text-zinc-300 font-sans selection:bg-[#E95464]/20 selection:text-[#F2A0A1]">
      
      {/* Subtle Antra Brand Ambient Glow (Ivory #F8F4E6, Cherry #FEF4F4, Plum #F2A0A1, Crimson #E95464) */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[300px] bg-gradient-to-br from-[#E95464]/10 via-[#F2A0A1]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed top-20 right-1/4 w-[500px] h-[260px] bg-gradient-to-bl from-[#F2A0A1]/8 via-[#F8F4E6]/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Top Minimal Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#070709]/85 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode('landing')}
              className="text-xl font-normal tracking-tight text-white hover:text-[#F2A0A1] transition cursor-pointer lowercase"
            >
              antra
            </button>
            <div className="h-3 w-px bg-zinc-800 hidden sm:block" />
            <button
              onClick={() => setViewMode('landing')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-normal text-zinc-400 hover:text-white transition cursor-pointer lowercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>back to studio</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => setViewMode('editor')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-normal rounded-lg transition border border-white/10 cursor-pointer lowercase"
              >
                open studio
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-normal">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-zinc-400 hover:text-white transition cursor-pointer lowercase"
                >
                  sign in
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1.5 bg-white text-zinc-950 hover:bg-[#FEF4F4] rounded-lg transition cursor-pointer lowercase"
                >
                  sign up
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-6 pt-14 pb-32">
        
        {/* Page Title & Clean Subtitle */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-normal text-white tracking-tight lowercase">
            compare features
          </h1>
          <p className="text-sm font-normal text-zinc-400 mt-2 lowercase max-w-2xl">
            dual-layer interactive architecture combining high-performance media delivery with scroll-driven 2d motion graphics, spatial 3d scene previs, and instant ai code generation.
          </p>
        </div>

        {/* Professional Feature Comparison Matrix Table (3 Official Antra Plans: Pro, Ultra, Max) */}
        <div className="w-full border-t border-white/[0.08]">
          <table className="w-full text-left border-collapse table-fixed">
            
            {/* Table Column Headers */}
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="w-[37%] py-6 pr-4 font-normal text-sm text-transparent select-none">
                  features
                </th>

                {/* Pro Plan Column */}
                <th className="w-[21%] py-6 px-4 text-center align-top">
                  <div className="font-normal text-base text-white lowercase">pro</div>
                  <div className="font-normal text-xs text-zinc-300 mt-0.5 flex items-center justify-center gap-1.5">
                    <span className="text-white">$4.50</span>
                    <span className="text-[10px] text-zinc-500">/mo</span>
                    <span className="text-[10px] text-zinc-600 line-through">$9/mo</span>
                  </div>
                  <div className="text-[10px] font-normal text-[#E95464] mt-0.5 lowercase">
                    15-day launch price
                  </div>
                  <button
                    onClick={handleSelectPlan}
                    className="mt-2.5 w-full py-1.5 text-[11px] font-normal text-zinc-950 bg-white hover:bg-[#FEF4F4] rounded transition cursor-pointer lowercase"
                  >
                    get pro
                  </button>
                </th>

                {/* Ultra Plan Column */}
                <th className="w-[21%] py-6 px-4 text-center align-top">
                  <div className="font-normal text-base text-zinc-400 lowercase">ultra</div>
                  <div className="font-normal text-xs text-zinc-500 mt-0.5">
                    $19<span className="text-[10px] text-zinc-600">/mo</span>
                  </div>
                  <div className="text-[10px] font-normal text-zinc-500 mt-0.5 lowercase">
                    upcoming plan
                  </div>
                  <button
                    disabled
                    className="mt-2.5 w-full py-1.5 text-[11px] font-normal text-zinc-500 bg-white/[0.04] rounded border border-white/[0.06] cursor-not-allowed lowercase"
                  >
                    upcoming
                  </button>
                </th>

                {/* Max Plan Column */}
                <th className="w-[21%] py-6 px-4 text-center align-top">
                  <div className="font-normal text-base text-zinc-400 lowercase">max</div>
                  <div className="font-normal text-xs text-zinc-500 mt-0.5">
                    $39<span className="text-[10px] text-zinc-600">/mo</span>
                  </div>
                  <div className="text-[10px] font-normal text-zinc-500 mt-0.5 lowercase">
                    upcoming plan
                  </div>
                  <button
                    disabled
                    className="mt-2.5 w-full py-1.5 text-[11px] font-normal text-zinc-500 bg-white/[0.04] rounded border border-white/[0.06] cursor-not-allowed lowercase"
                  >
                    upcoming
                  </button>
                </th>
              </tr>
            </thead>

            <tbody className="text-xs font-normal divide-y divide-white/[0.04]">
              
              {/* SECTION: Core Capacity */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  core capacity
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">active published websites</td>
                <td className="py-3.5 px-4 text-center text-white lowercase">1 active site</td>
                <td className="py-3.5 px-4 text-center text-white lowercase">5 active sites</td>
                <td className="py-3.5 px-4 text-center text-white lowercase">15 active sites</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">video scrub duration</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">10 – 15 seconds</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">up to 30 seconds</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">up to 60s (multi-scene)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">domain & network routing</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 font-mono text-[11px]">[name].antra.website</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">1 custom apex domain</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">5 custom apex domains</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">edge media storage</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">500 mb (zero-egress)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">2.5 gb (zero-egress)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">10 gb (zero-egress)</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">monthly page impressions</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">uncapped edge streaming</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">100,000</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">500,000</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">branding & watermark</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 lowercase">removed (clean site)</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 lowercase">removed (clean site)</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 lowercase">removed + white-label</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">media streaming delivery</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">http 206 byte-range</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">http 206 byte-range</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">http 206 byte-range</td>
              </tr>

              {/* SECTION: AI & Reference Generation */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  ai and reference generation
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">motion graphics video</td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">reference video generation</td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">ai assistant mode</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">auto mode (standard)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">auto mode (high-reasoning)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">manual model picker</td>
              </tr>

              {/* SECTION: Photorealistic AI Video */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  photorealistic ai video
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">included ai video generations</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">pay-as-you-go ($1/clip)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">5 generations / mo</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">15 generations / mo</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">ai video diffusion quality</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">standard 1080p</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">2k continuous motion</td>
                <td className="py-3.5 px-4 text-center text-zinc-400 lowercase">4k priority queue</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">direct local video ingestion (all-intra)</td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">spatial previs to diffusion pipeline</td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>

              {/* SECTION: Interactive DOM Overlays & Logic */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  interactive dom overlays & logic
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">visual overlay canvas editor</td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">clickable hotspots & external links</td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">lead-gen forms & dynamic ctas</td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">branching narrative decision trees</td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">webhooks & crm endpoints</td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><Dash /></td>
                <td className="py-3.5 px-4 text-center"><CheckIcon /></td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">scroll depth completion & heatmaps</td>
                <td className="py-3.5 px-4 text-center text-zinc-500 lowercase">basic</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">scroll telemetry</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">full heatmaps</td>
              </tr>

              {/* SECTION: Add-Ons & Infrastructure */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  add-ons & infrastructure
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">ai video pack (5 renders)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$5.00</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$5.00</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$5.00</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">storage expansion (10 gb)</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$3.00/mo</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$3.00/mo</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$3.00/mo</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">extra custom apex domain slot</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$2.00/mo</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$2.00/mo</td>
                <td className="py-3.5 px-4 text-center text-zinc-300">$2.00/mo</td>
              </tr>

              {/* SECTION: Platform & Security */}
              <tr>
                <td colSpan={4} className="pt-10 pb-3 text-sm font-normal text-white tracking-wide lowercase">
                  platform & security
                </td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">authentication & session vault</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">cloud session vault</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">cloud session vault</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">cloud vault + sso</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">automated edge ssl certificates</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">automated ssl</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">automated ssl</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">automated ssl</td>
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-zinc-400 lowercase">support tier</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">email</td>
                <td className="py-3.5 px-4 text-center text-zinc-300 lowercase">priority email</td>
                <td className="py-3.5 px-4 text-center text-white lowercase">dedicated private channel</td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Clean Minimalist Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-normal text-zinc-500 gap-4 lowercase">
          <div>
            <span>antra infrastructure · zero-egress streaming · 2d & 3d spatial rendering engines</span>
          </div>
          <button
            onClick={() => setViewMode('landing')}
            className="hover:text-[#F2A0A1] transition cursor-pointer lowercase"
          >
            ← back to studio
          </button>
        </div>

      </main>

    </div>
  );
};
