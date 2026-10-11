import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowRight, Sparkles, X, Plus, Loader2, Timer } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import { LandingGradient } from './LandingGradient';
import { BuilderAuthHeader } from './BuilderAuthHeader';
import { transcodeToAllIntra } from '../../utils/videoTranscodingEngine';
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
    setManifest
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
      setGenerationStatus('Converting video frames to All-Intra (I-Frames only) for smooth scroll...');

      try {
        const transcodeResult = await transcodeToAllIntra({
          file,
          onProgress: ({ message }) => {
            setGenerationStatus(message);
          }
        });

        setVideoSrc(transcodeResult.videoUrl);
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
    const newImages = filesToProcess.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      url: URL.createObjectURL(file),
      file
    }));

    setReferenceImages((prev) => [...prev, ...newImages]);
    setShowMenu(false);
    if (e.target) e.target.value = '';
  };

  const removeImage = (id) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProceed = async () => {
    const rawText = promptText.trim();
    setIsGenerating(true);
    setGenerationStatus('Initiating Remotion Motion AI engine...');

    try {
      const result = await generateRemotionMotionVideo({
        prompt: rawText || 'Interactive modern digital landscape with floating architectural elements',
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

      // Auto-populate interactive overlay layers matching the prompt's theme
      const theme = result?.theme;
      if (theme && (!manifest?.components || manifest.components.length === 0)) {
        const starterLayers = [
          {
            id: `comp_${Date.now()}_badge`,
            type: 'badge',
            content: `★ ${theme.badgeText || 'INTERACTIVE EXPERIENCE'}`,
            startTime: 0,
            endTime: result?.duration || 15.0,
            animationIn: 'fade-in',
            animationOut: 'fade-out',
            animationDuration: 0.6,
            style: {
              fontFamily: "'Belanosima', sans-serif",
              fontSize: '13px',
              fontWeight: '600',
              color: theme.primaryColor || '#E95464',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${theme.primaryColor || '#E95464'}40`,
              borderRadius: '9999px',
              padding: '6px 16px',
              left: '50%',
              top: '12%',
              transform: 'translateX(-50%)',
              backdropFilter: 'blur(12px)'
            },
            ...createGrapesComponentRecord('badge', `★ ${theme.badgeText || 'INTERACTIVE EXPERIENCE'}`)
          },
          {
            id: `comp_${Date.now()}_cta`,
            type: 'button',
            content: theme.category === 'fitness' ? 'Start Free Workout →' : theme.category === 'fintech' ? 'Launch App →' : 'Explore Platform →',
            targetUrl: 'https://antra.website',
            startTime: 0.5,
            endTime: result?.duration || 15.0,
            animationIn: 'scale-up',
            animationOut: 'fade-out',
            animationDuration: 0.7,
            style: {
              fontFamily: "'Belanosima', sans-serif",
              fontSize: '15px',
              fontWeight: '700',
              color: '#FFFFFF',
              backgroundColor: theme.primaryColor || '#E95464',
              borderRadius: '14px',
              padding: '12px 28px',
              left: '50%',
              top: '80%',
              transform: 'translateX(-50%)',
              boxShadow: `0 8px 24px ${theme.primaryColor || '#E95464'}55`,
              cursor: 'pointer'
            },
            ...createGrapesComponentRecord('button', theme.category === 'fitness' ? 'Start Free Workout →' : theme.category === 'fintech' ? 'Launch App →' : 'Explore Platform →', 'https://antra.website')
          }
        ];

        setManifest((prev) => ({
          ...prev,
          title: `${theme.brandName || 'Antra'} Interactive Experience`,
          components: starterLayers
        }));
      }

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
        <h1 className="text-[100px] sm:text-[135px] font-normal tracking-tight text-zinc-950 mb-6 select-none leading-none text-center">
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
              {/* Option 1: Reference Images (Coming Soon in Pro Mode) */}
              <div className="relative group/opt1">
                <div
                  className="w-full text-left p-2 rounded-xl flex items-center justify-between gap-3 opacity-60 cursor-not-allowed select-none bg-transparent hover:bg-zinc-50/50 transition-colors"
                  title="Reference-to-video is coming soon in Pro mode. In v1, please upload a source video."
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-zinc-400">
                      reference
                    </div>
                    <div className="text-base sm:text-[17px] font-bold text-zinc-950 tracking-tight leading-snug whitespace-nowrap">
                      upload images (max 5)
                    </div>
                  </div>
                  <div
                    className="p-1 text-zinc-400 flex items-center justify-center shrink-0"
                  >
                    <Timer className="w-5 h-5" />
                  </div>
                </div>

                {/* Tooltip Card on Hover */}
                <div className="absolute left-0 top-full mt-1 hidden group-hover/opt1:flex flex-col w-64 p-2.5 bg-zinc-900 text-white text-xs rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in duration-150">
                  <span className="font-semibold text-zinc-100 lowercase">reference images (pro mode)</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed lowercase">
                    reference-to-video is coming soon in pro mode. in v1, please use the source video option below.
                  </span>
                  <div className="absolute -top-1 left-6 w-2 h-2 bg-zinc-900 rotate-45" />
                </div>
              </div>

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

              {/* Text Area (Disabled for v1 - Coming soon in Pro mode) */}
              <div
                className="flex-1 min-w-0 cursor-not-allowed"
                title="Text-to-video AI prompt is coming soon in Pro mode. In v1, please upload a source video."
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  disabled
                  value=""
                  readOnly
                  placeholder="create your interactive website with..."
                  className="w-full bg-transparent text-zinc-950 placeholder-zinc-400 focus:outline-none text-xl sm:text-[24px] font-normal resize-none leading-normal py-0.5 max-h-[220px] overflow-y-auto cursor-not-allowed select-none"
                />
              </div>

              {/* Coming Soon Timer Icon with Tooltip */}
              <div className="relative group/prompt-timer flex items-center justify-center">
                <div
                  title="Text-to-video is coming soon in Pro mode. In v1, please upload a source video."
                  className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition flex items-center justify-center flex-shrink-0 mt-0.5 cursor-not-allowed"
                >
                  <Timer className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Tooltip Card */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/prompt-timer:flex flex-col w-64 p-2.5 bg-zinc-900 text-white text-xs rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in duration-150">
                  <span className="font-semibold text-zinc-100 lowercase">text-to-video (pro mode)</span>
                  <span className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed lowercase">
                    prompt generation is coming soon in pro mode. in v1, please upload a source video using the arrow on the left.
                  </span>
                  <div className="absolute -bottom-1 right-4 w-2 h-2 bg-zinc-900 rotate-45" />
                </div>
              </div>

              {/* Right Arrow Proceed Button (Disabled) */}
              <button
                type="button"
                disabled
                className="p-2.5 bg-zinc-200 text-zinc-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-none mt-0.5 cursor-not-allowed select-none"
                title="Prompt generation is coming soon in Pro mode. In v1, please upload a source video."
              >
                <ArrowRight className="w-4 h-4" />
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
