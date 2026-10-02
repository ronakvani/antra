import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, ArrowRight, Sparkles, X, Plus, Loader2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { LandingGradient } from './LandingGradient';
import { BuilderAuthHeader } from './BuilderAuthHeader';
import { generateAntraVideo } from '../../utils/higgsfieldVideoEngine';
import { transcodeToAllIntra } from '../../utils/videoTranscodingEngine';

export const LandingView = () => {
  const {
    setViewMode,
    setVideoSrc,
    setVideoDuration,
    referenceImages,
    setReferenceImages,
    promptText,
    setPromptText
  } = useEditor();

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
        setReferenceImages([]);
        setViewMode('editor');
      } catch (err) {
        console.error('Video upload transcode error:', err);
        const fallbackUrl = URL.createObjectURL(file);
        setVideoSrc(fallbackUrl);
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

  const handleAIProceed = async () => {
    if (!promptText.trim() && referenceImages.length === 0) return;
    setIsGenerating(true);
    setGenerationStatus('Compiling Antra System Prompt...');

    try {
      // Step 1: Synthesize AI Video via Higgsfield Wan 3.0
      const result = await generateAntraVideo({
        prompt: promptText,
        referenceImages,
        onProgress: ({ message }) => {
          setGenerationStatus(message);
        }
      });

      if (result?.videoUrl) {
        // Step 2: Pass generated video through All-Intra FFmpeg Transcoder
        setGenerationStatus('Optimizing AI video: Transcoding every frame to Keyframe (I-Frame)...');
        const transcodeResult = await transcodeToAllIntra({
          url: result.videoUrl,
          onProgress: ({ message }) => {
            setGenerationStatus(message);
          }
        });

        setVideoSrc(transcodeResult.videoUrl);
        setVideoDuration(result.duration || 10.0);
      }
      setViewMode('editor');
    } catch (err) {
      console.error('AI generation pipeline error:', err);
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
              className="absolute top-full left-0 mt-3 w-[270px] sm:w-[290px] bg-white border border-zinc-900 rounded-[22px] shadow-2xl p-4 text-left z-30 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Option 1: Reference Images */}
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 transition-colors group cursor-pointer block"
              >
                <div className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-500">
                  reference
                </div>
                <div className="text-base sm:text-[19px] font-bold text-zinc-950 group-hover:text-black tracking-tight leading-snug">
                  upload images (max 5)
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
                <div className="text-base sm:text-[19px] font-bold text-zinc-950 group-hover:text-black tracking-tight leading-snug">
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
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
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
                className={`p-1.5 text-zinc-900 hover:bg-zinc-100 rounded-xl transition flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  showMenu ? 'bg-zinc-100' : ''
                }`}
              >
                <ArrowUp className="w-6 h-6 stroke-[2.5]" />
              </button>

              {/* Text Area (Shift+Enter for newline, Enter to submit, expands downwards) */}
              <textarea
                ref={textareaRef}
                rows={1}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAIProceed();
                  }
                }}
                placeholder="create your interactive website with..."
                className="flex-1 bg-transparent text-zinc-950 placeholder-zinc-500 focus:outline-none text-xl sm:text-[24px] font-normal resize-none leading-normal py-0.5 max-h-[220px] overflow-y-auto"
              />

              {/* Right Arrow Proceed Button */}
              <button
                type="button"
                onClick={handleAIProceed}
                disabled={isGenerating}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center justify-center flex-shrink-0 shadow-md mt-0.5 cursor-pointer disabled:opacity-75"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
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
