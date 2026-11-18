import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowRight, Sparkles, X, Plus, Loader2, Timer } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import { LandingGradient } from './LandingGradient';
import { BuilderAuthHeader } from './BuilderAuthHeader';
import { transcodeToAllIntra } from '../../utils/videoTranscodingEngine';
import { syncVideoToR2 } from '../../utils/r2StorageClient';
import { getMaxDurationForUser } from '../../utils/planFeatures';
import { generateRemotionMotionVideo } from '../../utils/remotionAiEngine';
import { createGrapesComponentRecord } from '../../utils/grapesEngine';

export const LandingView = () => {
  const {
    setViewMode,
    setVideoSrc,
    setVideoDuration,
    setRemotionCode,
    setIsRemotion,
    setRemotionFps,
    referenceImages,
    setReferenceImages,
    promptText,
    setPromptText,
    manifest,
    setManifest,
    setRawVideoUrl,
    setEditedVideoUrl,
    setR2StorageInfo,
    refreshR2Stats
  } = useEditor();
  const { user } = useAuth();
  const maxPlanDuration = getMaxDurationForUser(user);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const menuRef = useRef(null);
  const arrowBtnRef = useRef(null);
  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-adjust textarea height based on content
  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [promptText]);

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        arrowBtnRef.current &&
        !arrowBtnRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Option 2: Upload Video (with automatic All-Intra I-Frame FFmpeg Transcoding)
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsGenerating(true);
      setShowMenu(false);
      setGenerationStatus('Connecting to Cloudflare R2 & checking deduplication...');

      try {
        // Step 1: Sync Raw Video to Cloudflare R2 with Deduplication
        let r2Raw = null;
        try {
          r2Raw = await syncVideoToR2(file, {
            type: 'raw',
            fileName: file.name,
            onProgress: ({ message }) => setGenerationStatus(message)
          });
          if (r2Raw && r2Raw.url) {
            setRawVideoUrl(r2Raw.url);
          }
        } catch (r2RawErr) {
          console.warn('Raw video R2 sync notice:', r2RawErr);
        }

        // Step 2: Transcode to All-Intra (I-Frames only for smooth 120fps scrubbing)
        setGenerationStatus('Converting video frames to All-Intra (I-Frames only)...');
        const transcodeResult = await transcodeToAllIntra({
          file,
          onProgress: ({ message }) => {
            setGenerationStatus(message);
          }
        });

        // Step 3: Sync Edited / Transcoded Video to Cloudflare R2 with Deduplication
        let r2Edited = null;
        if (transcodeResult.blob) {
          try {
            setGenerationStatus('Syncing edited video to Cloudflare R2...');
            r2Edited = await syncVideoToR2(transcodeResult.blob, {
              type: 'edited',
              fileName: transcodeResult.filename || `all_intra_${file.name}`,
              onProgress: ({ message }) => setGenerationStatus(message)
            });
            if (r2Edited && r2Edited.url) {
              setEditedVideoUrl(r2Edited.url);
            }
          } catch (r2EditedErr) {
            console.warn('Edited video R2 sync notice:', r2EditedErr);
          }
        }

        // Step 4: Record deduplication metadata & update free tier stats
        setR2StorageInfo({
          rawDeduplicated: r2Raw?.deduplicated || false,
          rawKey: r2Raw?.key || null,
          rawUrl: r2Raw?.url || null,
          editedDeduplicated: r2Edited?.deduplicated || false,
          editedKey: r2Edited?.key || null,
          editedUrl: r2Edited?.url || null
        });
        refreshR2Stats();

        // Step 5: Route to Editor with permanent R2 stream or transcoded stream
        const finalVideoUrl = r2Edited?.url || transcodeResult.videoUrl || r2Raw?.url;
        setVideoSrc(finalVideoUrl);
        setIsRemotion(false);
        setRemotionCode('');
        setReferenceImages([]);
        setViewMode('editor');
      } catch (err) {
        console.error('Video upload transcode error:', err);
        const fallbackUrl = URL.createObjectURL(file);
        setVideoSrc(fallbackUrl);
        setIsRemotion(false);
        setRemotionCode('');
        setReferenceImages([]);
        setViewMode('editor');
      } finally {
        setIsGenerating(false);
        setGenerationStatus('');
        if (e.target) e.target.value = '';
      }
    }
  };

  // Handle Option 1: Upload Images (max 5)
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const availableSlots = 5 - referenceImages.length;
    if (availableSlots <= 0) {
      alert('Maximum of 5 reference images allowed.');
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);

    // Read files into base64 data URLs for AI LLM vision processing
    filesToProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        setReferenceImages((prev) => {
          if (prev.length >= 5) return prev;
          return [
            ...prev,
            {
              id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              url: URL.createObjectURL(file),
              dataUrl,
              base64: dataUrl,
              file
            }
          ];
        });
      };
      reader.readAsDataURL(file);
    });

    setShowMenu(false);
    if (e.target) e.target.value = '';
  };

  const removeImage = (id) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProceed = async () => {
    const rawText = promptText.trim();
    if (!rawText && referenceImages.length === 0) return;

    setIsGenerating(true);
    setGenerationStatus('Initiating Remotion Motion AI engine...');

    try {
      const result = await generateRemotionMotionVideo({
        prompt: rawText || 'Interactive modern digital landscape with floating architectural elements',
        images: referenceImages,
        user,
        onProgress: ({ message }) => {
          setGenerationStatus(message);
        }
      });

      if (result?.code) {
        setRemotionCode(result.code);
        setIsRemotion(true);
        setVideoDuration(result.duration || 15.0);
        setRemotionFps(result.fps || 30);
      }

      // Initialize clean interactive manifest title without hardcoded domain buttons
      setManifest((prev) => ({
        ...prev,
        title: rawText ? `${rawText.slice(0, 30)} Interactive Site` : 'Interactive Experience'
      }));

      setViewMode('editor');
    } catch (err) {
      console.error('Remotion motion generation error:', err);
      setViewMode('editor');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full text-zinc-900 font-sans overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Background Video / Gradient */}
      <LandingGradient />

      {/* Top Right Builder Login & Signup Header (Green Box position) */}
      <BuilderAuthHeader />

      {/* Main Centered Content */}
      <div className="relative z-10 w-full max-w-[801px] px-4 flex flex-col items-center justify-center">
        
        {/* Title Logo: "antra" */}
        <h1 className="text-[100px] sm:text-[135px] font-normal tracking-tight text-zinc-950 mb-6 select-none leading-none text-center font-belanosima lowercase">
          antra
        </h1>

        {/* Input Bar Container & Popup Menu Anchor */}
        <div className="relative w-full">
          
          {/* Popup Menu (Positioned BELOW the input bar) */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 mt-3 w-[285px] sm:w-[315px] bg-white border border-zinc-900 rounded-[22px] shadow-2xl p-3.5 sm:p-4 text-left z-30 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Option 1: Upload Design Reference Files / Images */}
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 transition-colors group cursor-pointer block"
              >
                <div className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-500">
                  design reference
                </div>
                <div className="text-base sm:text-[17px] font-bold text-zinc-950 group-hover:text-black tracking-tight leading-snug whitespace-nowrap">
                  upload images / assets (max 5)
                </div>
              </button>

              {/* Divider line */}
              <div className="my-2 border-t border-zinc-900" />

              {/* Option 2: Source Video */}
              <button
                type="button"
                onClick={() => {
                  videoInputRef.current?.click();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 transition-colors group cursor-pointer block"
              >
                <div className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-500">
                  source video
                </div>
                <div className="text-base sm:text-[17px] font-bold text-zinc-950 group-hover:text-black tracking-tight leading-snug whitespace-nowrap">
                  upload video (max 1, 10s)
                </div>
              </button>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoUpload}
            accept="video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* Main Input Box (Expands downwards when long prompts are typed) */}
          <div className="w-full bg-white border border-zinc-200/80 rounded-2xl shadow-xl px-4 py-3 flex flex-col gap-2 transition-all">
            
            {/* Reference Images Thumbnails Preview (if attached via Option 1) */}
            {referenceImages.length > 0 && (
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 overflow-x-auto">
                <span className="text-xs font-semibold text-zinc-400 lowercase tracking-wider shrink-0">
                  Ref Images ({referenceImages.length}/5):
                </span>
                {referenceImages.map((img) => (
                  <div key={img.id} className="relative group shrink-0">
                    <img
                      src={img.url}
                      alt="Reference"
                      className="w-10 h-10 object-cover rounded-lg border border-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-1 -right-1 bg-zinc-900 text-white rounded-full p-0.5 opacity-80 hover:opacity-100 transition"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {referenceImages.length < 5 && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-10 h-10 border border-dashed border-zinc-300 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:border-zinc-400 transition"
                    title="Add another image"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Controls & Multi-line Text Area Row */}
            <div className="flex items-start gap-3 w-full min-h-[38px]">
              
              {/* Arrow Up Button (Toggles Popup Menu) */}
              <button
                ref={arrowBtnRef}
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                title="Choose source option"
                className={`p-1.5 text-zinc-900 hover:bg-zinc-100 rounded-xl transition flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${
                  showMenu ? 'bg-zinc-100' : ''
                }`}
              >
                <ArrowUp className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Text Area (Enabled for Business / Product Prompt) */}
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleProceed();
                    }
                  }}
                  placeholder="Describe your business or product for motion backdrop..."
                  className="w-full bg-transparent text-zinc-950 placeholder-zinc-400 focus:outline-none text-xl sm:text-[24px] font-normal resize-none leading-normal py-0.5 max-h-[220px] overflow-y-auto"
                />
              </div>

              {/* Right Arrow Proceed Button */}
              <button
                type="button"
                onClick={handleProceed}
                disabled={isGenerating || (!promptText.trim() && referenceImages.length === 0)}
                className="p-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 text-white disabled:text-zinc-400 rounded-xl flex items-center justify-center flex-shrink-0 transition mt-0.5 cursor-pointer disabled:cursor-not-allowed select-none shadow-sm"
                title="Generate motion backdrop"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Generation & Transcoding Status Progress Message */}
            {isGenerating && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs text-indigo-600 font-medium animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generationStatus || 'Processing media layer...'}</span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
