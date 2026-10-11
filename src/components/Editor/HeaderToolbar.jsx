import React, { useState } from 'react';
import { Eye, Layout, UploadCloud, ArrowLeft, LogIn, Film, Loader2, CheckCircle2, Download, X } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import { transcodeToAllIntra } from '../../utils/videoTranscodingEngine';

import { compileGrapesPublishPackage } from '../../utils/grapesEngine';
import { generatePenpotCss, generatePenpotSpecJson } from '../../utils/penpotCodeEngine';

export const HeaderToolbar = () => {
  const { setViewMode, manifest, remotionCode, isRemotion, remotionFps, videoDuration, videoSrc, setVideoSrc } = useEditor();
  const { user, openAuthModal, getDiceBearVoxelBotAvatar } = useAuth();

  const [isTranscoding, setIsTranscoding] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState({ percent: 0, message: '' });
  const [transcodedResult, setTranscodedResult] = useState(null);
  const [showTranscodeModal, setShowTranscodeModal] = useState(false);

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

  const handlePublish = () => {
    const grapesPackage = compileGrapesPublishPackage(manifest);
    const penpotStyles = manifest.components.map((c) => ({
      id: c.id,
      type: c.type,
      penpotCss: generatePenpotCss(c),
      penpotSpec: generatePenpotSpecJson(c)
    }));

    const publishData = {
      ...manifest,
      publishedAt: new Date().toISOString(),
      grapesEnginePackage: grapesPackage,
      penpotEnginePackage: penpotStyles,
      remotionEnginePackage: isRemotion && remotionCode ? {
        code: remotionCode,
        duration: videoDuration,
        fps: remotionFps || 30
      } : null
    };

    const jsonStr = JSON.stringify(publishData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content.json';
    a.click();
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
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition flex items-center justify-center shadow-sm cursor-pointer"
            title="Publish Content JSON"
          >
            <UploadCloud className="w-5 h-5" />
          </button>

          <div className="h-6 w-[1px] bg-zinc-200 mx-1" />

          {/* Plan Badge */}
          <button
            type="button"
            onClick={() => setViewMode('pricing')}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-[#FEF4F4] text-zinc-700 hover:text-[#E95464] border border-zinc-200 text-[11px] font-normal lowercase transition flex items-center gap-1 cursor-pointer"
            title="view pricing & plan details"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E95464]" />
            <span>{user?.plan || 'pro'}</span>
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
    </>
  );
};
