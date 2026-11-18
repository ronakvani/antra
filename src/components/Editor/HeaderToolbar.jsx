import React, { useState, useEffect } from 'react';
import { Eye, Layout, UploadCloud, ArrowLeft, LogIn, Film, Loader2, CheckCircle2, Download, X, AlertTriangle, Sparkles, ChevronRight, Layers, Cloud } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import { transcodeToAllIntra } from '../../utils/videoTranscodingEngine';
import { syncVideoToR2 } from '../../utils/r2StorageClient';
import { R2StorageModal } from '../Common/R2StorageModal';

import { compileGrapesPublishPackage } from '../../utils/grapesEngine';
import { generatePenpotCss, generatePenpotSpecJson } from '../../utils/penpotCodeEngine';
import { checkSiteLimitAllowed, recordSiteCreation, logUserActivity } from '../../utils/supabaseTracking';

export const HeaderToolbar = () => {
  const { 
    setViewMode, 
    setSelectedPlan, 
    manifest, 
    remotionCode, 
    isRemotion, 
    remotionFps, 
    videoDuration, 
    videoSrc, 
    setVideoSrc,
    rawVideoUrl,
    editedVideoUrl,
    setEditedVideoUrl,
    r2Stats,
    refreshR2Stats
  } = useEditor();
  const { user, openAuthModal, getDiceBearVoxelBotAvatar } = useAuth();

  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState({ percent: 0, message: '' });
  const [transcodedResult, setTranscodedResult] = useState(null);
  const [showTranscodeModal, setShowTranscodeModal] = useState(false);
  const [showR2Modal, setShowR2Modal] = useState(false);

  // Supabase limit & site tracking states
  const [siteLimitInfo, setSiteLimitInfo] = useState({
    allowed: true,
    count: 0,
    maxSites: 1,
    remaining: 1,
    plan: 'pro'
  });
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishNotice, setPublishNotice] = useState(null);

  // Refresh limit metrics on mount and when user/plan changes
  useEffect(() => {
    let isMounted = true;
    async function fetchLimits() {
      try {
        const info = await checkSiteLimitAllowed(user);
        if (isMounted) setSiteLimitInfo(info);
      } catch (err) {
        console.warn('Failed to load site limit metrics:', err);
      }
    }
    fetchLimits();
    return () => {
      isMounted = false;
    };
  }, [user, user?.plan]);

  const handleTranscodeAllIntra = async () => {
    setShowTranscodeModal(true);
    setIsTranscoding(true);
    setTranscodedResult(null);
    setTranscodeProgress({ percent: 10, message: 'Preparing All-Intra transcoding pipeline...' });

    try {
      const result = await transcodeToAllIntra({
        url: videoSrc || '/antra-gradient.mp4',
        onProgress: ({ percent, message }) => {
          setTranscodeProgress({ percent, message });
        }
      });

      // Sync transcoded All-Intra video to Cloudflare R2 with automatic deduplication
      if (result.blob) {
        setTranscodeProgress({ percent: 97, message: 'Syncing to Cloudflare R2 with deduplication check...' });
        try {
          const r2Edited = await syncVideoToR2(result.blob, {
            type: 'edited',
            fileName: result.filename || 'all_intra_video.mp4',
            onProgress: ({ message }) => setTranscodeProgress({ percent: 98, message })
          });

          if (r2Edited && r2Edited.url) {
            result.videoUrl = r2Edited.url;
            result.r2Deduplicated = r2Edited.deduplicated;
            result.r2Key = r2Edited.key;
            setEditedVideoUrl(r2Edited.url);
            refreshR2Stats();
          }
        } catch (r2Err) {
          console.warn('R2 edited sync notice:', r2Err);
        }
      }

      setTranscodedResult(result);
      if (result.videoUrl) {
        setVideoSrc(result.videoUrl);
      }
    } catch (err) {
      console.error('All-Intra transcode error:', err);
      setTranscodeProgress({ percent: 100, message: `Transcode warning: ${err.message}` });
    } finally {
      setIsTranscoding(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishNotice(null);

    // 1. Verify feature limit against Supabase user subscription
    const currentLimit = await checkSiteLimitAllowed(user);
    setSiteLimitInfo(currentLimit);

    if (!currentLimit.allowed) {
      setIsPublishing(false);
      setShowLimitModal(true);
      await logUserActivity({
        user,
        action: 'website_publish_attempted',
        details: {
          blocked: true,
          reason: 'plan_limit_exceeded',
          current_sites: currentLimit.count,
          max_sites_allowed: currentLimit.maxSites,
          plan: currentLimit.plan
        }
      });
      return;
    }

    // 2. Compile publishing artifacts
    const grapesPackage = compileGrapesPublishPackage(manifest);
    const penpotStyles = manifest.components.map((c) => ({
      id: c.id,
      type: c.type,
      penpotCss: generatePenpotCss(c),
      penpotSpec: generatePenpotSpecJson(c)
    }));

    const publishData = {
      ...manifest,
      rawVideoUrl: rawVideoUrl || null,
      editedVideoUrl: editedVideoUrl || null,
      videoSrc: editedVideoUrl || videoSrc,
      publishedAt: new Date().toISOString(),
      grapesEnginePackage: grapesPackage,
      penpotEnginePackage: penpotStyles,
      remotionEnginePackage: isRemotion && remotionCode ? {
        code: remotionCode,
        duration: videoDuration,
        fps: remotionFps || 30
      } : null
    };

    // 3. Persist website record & increment site count in Supabase
    const siteTitle = manifest.title || 'Antra Interactive Experience';
    const siteSubdomain = siteTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 32);

    const recordResult = await recordSiteCreation({
      user,
      title: siteTitle,
      manifest: publishData,
      subdomain: siteSubdomain
    });

    if (!recordResult.success) {
      setIsPublishing(false);
      setShowLimitModal(true);
      return;
    }

    if (recordResult.limitCheck) {
      setSiteLimitInfo(recordResult.limitCheck);
    }

    // 4. Trigger download of content.json
    const jsonStr = JSON.stringify(publishData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();

    setPublishNotice({
      type: 'success',
      text: `published to supabase: site ${recordResult.limitCheck.count}/${recordResult.limitCheck.maxSites} used`
    });
    setTimeout(() => setPublishNotice(null), 4500);
    setIsPublishing(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between text-zinc-900 select-none shadow-sm">
        {/* Brand & Back */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode('landing')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-600 hover:text-zinc-950 cursor-pointer"
            title="Back to Landing"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-3xl font-normal tracking-tight text-zinc-950">
            antra
          </span>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
          {/* All-Intra MP4 Transcode & Export Button */}
          <button
            onClick={handleTranscodeAllIntra}
            className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl transition flex items-center gap-2 border border-zinc-200 text-xs font-medium cursor-pointer shadow-xs"
            title="Convert to All-Intra (I-Frames Only) for 120fps Scroll Scrubbing"
          >
            <Film className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">All-Intra MP4</span>
          </button>

          <button
            onClick={() => setViewMode('preview')}
            className="p-2.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center justify-center border border-zinc-200 cursor-pointer"
            title="Preview"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            className="p-2.5 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center justify-center border border-zinc-200 cursor-pointer"
            title="Layout Mode"
          >
            <Layout className="w-5 h-5" />
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white rounded-xl transition flex items-center justify-center shadow-sm cursor-pointer"
            title="Publish Content JSON to Supabase"
          >
            {isPublishing ? (
              <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </button>

          {/* Cloudflare R2 Storage (10GB Free Tier) Status & Deduplication Tracker */}
          <button
            onClick={() => setShowR2Modal(true)}
            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100/80 text-orange-700 border border-orange-200/80 rounded-xl transition flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-2xs"
            title="Cloudflare R2 Storage (10GB Free Tier) • SHA-256 Deduplication Active"
          >
            <Cloud className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden md:inline">R2 Storage</span>
            {r2Stats?.totalMb ? (
              <span className="text-[10px] font-mono bg-white/90 px-1.5 py-0.5 rounded text-orange-800 border border-orange-200/60">
                {r2Stats.totalMb} MB
              </span>
            ) : (
              <span className="text-[10px] font-medium text-orange-600/90 hidden sm:inline">10GB</span>
            )}
          </button>

          <div className="h-6 w-[1px] bg-zinc-200 mx-1" />

          {/* Plan & Site Limit Counter Badge */}
          <button
            type="button"
            onClick={() => {
              if (siteLimitInfo.count >= siteLimitInfo.maxSites) {
                setShowLimitModal(true);
              } else {
                setViewMode('pricing');
              }
            }}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-normal lowercase transition flex items-center gap-1.5 cursor-pointer ${
              siteLimitInfo.count >= siteLimitInfo.maxSites
                ? 'bg-rose-50/80 border-rose-200 text-[#E95464] hover:bg-rose-100/70'
                : 'bg-zinc-100 hover:bg-[#FEF4F4] text-zinc-700 hover:text-[#E95464] border-zinc-200'
            }`}
            title={`active plan: ${siteLimitInfo.plan || user?.plan || 'pro'} • sites created: ${siteLimitInfo.count}/${siteLimitInfo.maxSites}`}
          >
            {siteLimitInfo.count >= siteLimitInfo.maxSites ? (
              <AlertTriangle className="w-3 h-3 text-[#E95464] shrink-0" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#E95464] shrink-0" />
            )}
            <span>{siteLimitInfo.plan || user?.plan || 'pro'}</span>
            <span className="text-zinc-300">|</span>
            <span className="font-mono text-[10px] text-zinc-600">
              {siteLimitInfo.count}/{siteLimitInfo.maxSites} sites
            </span>
          </button>

          {user ? (
            <div
              className="flex items-center gap-2 pl-1 cursor-pointer"
              onClick={() => openAuthModal('login')}
              title={`logged in as ${user.username || user.email}`}
            >
              <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 p-0.5 overflow-hidden flex items-center justify-center shadow-inner">
                <img
                  src={user.avatarUrl || getDiceBearVoxelBotAvatar(user.avatarSeed || user.username || user.email)}
                  alt="Builder Avatar"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="p-2 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 rounded-xl transition flex items-center gap-1.5 text-xs font-normal border border-zinc-200 cursor-pointer lowercase"
              title="Builder Sign In"
            >
              <LogIn className="w-4 h-4 text-zinc-500" />
              <span>sign in</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Publish Notice Toast */}
      {publishNotice && (
        <div className="fixed top-20 right-8 z-50 animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
          <div className="bg-zinc-950 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-zinc-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-normal lowercase">{publishNotice.text}</span>
          </div>
        </div>
      )}

      {/* Plan Site Limit Reached Warning Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 max-w-lg w-full p-7 text-zinc-900 relative">
            <button
              onClick={() => setShowLimitModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E95464] shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#E95464] text-[11px] font-medium lowercase">
                  <span>plan limit reached</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-950 tracking-tight leading-snug">
                  website limit reached on {siteLimitInfo.plan || 'pro'}
                </h3>
              </div>
            </div>

            {/* Body Explanation */}
            <p className="text-sm text-zinc-600 leading-relaxed mb-5">
              your <span className="font-semibold text-zinc-900 lowercase">{siteLimitInfo.plan || 'pro'}</span> plan allows creating and publishing up to <span className="font-semibold text-zinc-900">{siteLimitInfo.maxSites} website{siteLimitInfo.maxSites > 1 ? 's' : ''}</span>. you have already created <span className="font-semibold text-zinc-900">{siteLimitInfo.count}</span>. to publish more interactive experiences, choose a higher tier below:
            </p>

            {/* Tier Comparison Cards */}
            <div className="space-y-3 mb-6">
              {/* Ultra Tier Upgrade Card */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 hover:bg-[#FEF4F4]/40 hover:border-[#F2A0A1] transition flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 lowercase">antra ultra</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FEF4F4] text-[#E95464] border border-[#F2A0A1]/50">
                      5 websites
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    up to 5 live sites • 30s video scrub • 3d spatial previs • $19/mo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (setSelectedPlan) setSelectedPlan('ultra');
                    setShowLimitModal(false);
                    setViewMode('checkout');
                  }}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-[#E95464] text-white rounded-xl text-xs font-medium lowercase transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <span>upgrade</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Max Tier Upgrade Card */}
              <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 hover:bg-[#FEF4F4]/40 hover:border-[#F2A0A1] transition flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 lowercase">antra max</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      15 websites
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    up to 15 live sites • 60s video • diffusion pipeline • white-label • $39/mo
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (setSelectedPlan) setSelectedPlan('max');
                    setShowLimitModal(false);
                    setViewMode('checkout');
                  }}
                  className="px-3.5 py-2 bg-zinc-900 hover:bg-[#E95464] text-white rounded-xl text-xs font-medium lowercase transition flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <span>upgrade</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowLimitModal(false);
                  setViewMode('pricing');
                }}
                className="text-zinc-600 hover:text-zinc-950 underline underline-offset-4 lowercase cursor-pointer"
              >
                compare all plan limits & tags
              </button>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-normal lowercase transition cursor-pointer"
              >
                stay on {siteLimitInfo.plan || 'pro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All-Intra Transcoding Modal */}
      {showTranscodeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 text-zinc-900 relative">
            <button
              onClick={() => setShowTranscodeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-950 leading-tight">
                  All-Intra MP4 Transcoding
                </h3>
                <p className="text-xs text-zinc-500">
                  FFmpeg client-side keyframe generator (-g 1)
                </p>
              </div>
            </div>

            {/* Progress / Status Bar */}
            <div className="space-y-3 my-4">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                <span>{transcodeProgress.message || 'Processing...'}</span>
                <span>{transcodeProgress.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300 rounded-full"
                  style={{ width: `${transcodeProgress.percent}%` }}
                />
              </div>
            </div>

            {/* Cloudflare R2 Deduplication Status Banner */}
            {transcodedResult && (
              <div className="mb-4 p-2.5 bg-orange-50/80 border border-orange-200/70 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="text-orange-950 font-medium">
                    {transcodedResult.r2Deduplicated
                      ? 'Reused existing copy from Cloudflare R2 (Deduplicated)'
                      : transcodedResult.r2Key
                      ? 'Saved to Cloudflare R2'
                      : 'Cloudflare R2 Video Ready'}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  transcodedResult.r2Deduplicated
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-white text-orange-800 border border-orange-200'
                }`}>
                  {transcodedResult.r2Deduplicated ? '0 MB added (Deduplicated)' : '10GB Free Tier'}
                </span>
              </div>
            )}

            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-xs text-zinc-600 space-y-1 mb-5">
              <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Why All-Intra?
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Standard MP4s lag when scrolled backwards. All-Intra renders every single frame as an independent Keyframe (I-Frame), enabling 120 FPS bidirectional scroll scrubbing.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              {isTranscoding ? (
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transcoding in browser WebAssembly...</span>
                </div>
              ) : transcodedResult?.videoUrl ? (
                <>
                  <a
                    href={transcodedResult.videoUrl}
                    download={transcodedResult.filename || 'all_intra_video.mp4'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All-Intra MP4</span>
                  </a>
                  <button
                    onClick={() => setShowTranscodeModal(false)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium transition cursor-pointer"
                  >
                    Done
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowTranscodeModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare R2 Storage & Quota Management Modal */}
      <R2StorageModal
        isOpen={showR2Modal}
        onClose={() => setShowR2Modal(false)}
      />
    </>
  );
};
