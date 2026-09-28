import React, { useState, useRef, useEffect } from 'react';
import restaurantImg from '../assets/images/seniors_restaurant_1790584984164.jpg';
import { VideoAspectRatioType, GalleryItem } from '../types';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';
import {
  Film,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

interface VeoVideoAnimatorProps {
  initialImageUrl?: string | null;
  onSaveToGallery: (item: GalleryItem) => void;
}

export const VeoVideoAnimator: React.FC<VeoVideoAnimatorProps> = ({
  initialImageUrl,
  onSaveToGallery,
}) => {
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>(initialImageUrl || restaurantImg);
  const [selectedImageData, setSelectedImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  
  // Mandatory aspect ratios: 16:9 or 9:16
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatioType>('16:9');
  const [motionPrompt, setMotionPrompt] = useState(
    'Gentle evening conversation, warm steam rising from hot butter tea cups, soft candlelight flickering, seniors smiling warmly in cozy restaurant lighting'
  );

  // Video generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<'idle' | 'starting' | 'polling' | 'downloading' | 'completed'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollTimerRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);

  // Initialize image data
  useEffect(() => {
    const src = initialImageUrl || restaurantImg;
    setSelectedImagePreview(src);
    urlToBase64(src)
      .then((data) => setSelectedImageData(data))
      .catch((err) => console.warn('Failed to load image as base64:', err));
  }, [initialImageUrl]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await fileToBase64(file);
      setSelectedImageData(data);
      const preview = URL.createObjectURL(file);
      setSelectedImagePreview(preview);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process uploaded photo.');
    }
  };

  const handleSelectRestaurantPhoto = async () => {
    try {
      setSelectedImagePreview(restaurantImg);
      const data = await urlToBase64(restaurantImg);
      setSelectedImageData(data);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to select restaurant photo.');
    }
  };

  const motionPresets = [
    'Gentle evening conversation, warm steam rising from hot butter tea cups, soft candlelight flickering, seniors smiling warmly in cozy restaurant lighting',
    'Cinematic slow pan across the rustic wooden tables, outside window twilight shifts gently into starry night',
    'Soft fireside warm embers glowing, seniors laughing and sharing traditional Himalayan momos in slow motion',
    'Delicate steam curling up from ceramic teacups with subtle depth-of-field focus shift and atmospheric golden lighting',
  ];

  const reassuringMessages = [
    'Contacting Veo 3.1 Fast video generation engine...',
    'Analyzing scene composition, lighting vectors, and spatial depth...',
    'Synthesizing temporal consistency and natural human motion...',
    'Rendering smooth physics for steaming tea and flickering flames...',
    'Polishing cinematic framing and color grading...',
    'Finalizing MP4 video container...',
  ];

  const handleGenerateVideo = async () => {
    if (!selectedImageData) {
      setErrorMessage('Please select or upload a photo to animate.');
      return;
    }

    setIsGenerating(true);
    setGenerationStage('starting');
    setErrorMessage(null);
    setGeneratedVideoUrl(null);
    setElapsedSeconds(0);
    setStatusMessage(reassuringMessages[0]);

    // Start elapsed counter
    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        // Cycle reassuring messages every 8 seconds
        const msgIdx = Math.min(Math.floor(next / 8), reassuringMessages.length - 1);
        setStatusMessage(reassuringMessages[msgIdx]);
        return next;
      });
    }, 1000);

    try {
      // Step 1: Start video generation
      const startRes = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: motionPrompt.trim(),
          aspectRatio, // 16:9 or 9:16
          image: {
            imageBytes: selectedImageData.base64,
            mimeType: selectedImageData.mimeType,
          },
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || 'Failed to start video generation.');
      }

      const operationName = startData.operationName;
      setGenerationStage('polling');

      // Step 2: Poll operation status every 5 seconds
      const pollStatus = async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName }),
          });

          const statusData = await statusRes.json();
          if (!statusRes.ok) {
            throw new Error(statusData.error || 'Polling failed.');
          }

          if (statusData.error) {
            throw new Error(statusData.error.message || 'Video generation failed.');
          }

          if (statusData.done) {
            // Step 3: Generation complete -> Download video
            clearInterval(pollTimerRef.current);
            setGenerationStage('downloading');
            setStatusMessage('Video generated! Fetching high-quality MP4...');

            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              const err = await downloadRes.json().catch(() => ({}));
              throw new Error(err.error || 'Failed to download video stream.');
            }

            const videoBlob = await downloadRes.blob();
            const videoObjectUrl = URL.createObjectURL(videoBlob);

            setGeneratedVideoUrl(videoObjectUrl);
            setGenerationStage('completed');
            setIsGenerating(false);
            clearInterval(elapsedTimerRef.current);

            // Add to gallery
            const newItem: GalleryItem = {
              id: `veo-${Date.now()}`,
              type: 'video',
              url: videoObjectUrl,
              prompt: motionPrompt.trim(),
              timestamp: Date.now(),
              aspectRatio,
              baseImageUrl: selectedImagePreview,
              model: 'veo-3.1-fast-generate-preview',
              title: 'Veo Animated Video',
            };
            onSaveToGallery(newItem);
          }
        } catch (pollErr: any) {
          clearInterval(pollTimerRef.current);
          clearInterval(elapsedTimerRef.current);
          setIsGenerating(false);
          setErrorMessage(pollErr.message || 'Error occurred while checking video progress.');
        }
      };

      // Poll every 5 seconds
      pollTimerRef.current = setInterval(pollStatus, 5000);
      // Run first poll after 3s
      setTimeout(pollStatus, 3000);

    } catch (err: any) {
      clearInterval(elapsedTimerRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setIsGenerating(false);
      setErrorMessage(err.message || 'Failed to generate video.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span>Powered by Veo 3.1 Fast Video Generation</span>
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-amber-100">
          Animate Photos into Cinematic Video
        </h2>
        <p className="text-amber-200/70 text-sm max-w-xl mx-auto">
          Bring the warmth of Phunsto Lumbu Restaurant to life. Upload any photo or use our senior evening gathering to generate temporal motion videos with Veo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Generation Controls */}
        <div className="lg:col-span-6 bg-[#16130f] border border-amber-900/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
          {/* 1. Base Photo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Starting Photo Frame
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                <span>Upload New</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-amber-600/40 bg-black/40 group aspect-[16/9] flex items-center justify-center">
              <img
                src={selectedImagePreview}
                alt="Starting frame for Veo animation"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold shadow hover:bg-amber-500"
                >
                  Upload Another
                </button>
                <button
                  onClick={handleSelectRestaurantPhoto}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-amber-200 text-xs font-semibold border border-white/20 hover:bg-neutral-700"
                >
                  Use Phunsto Lumbu
                </button>
              </div>
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-amber-300 border border-white/10">
                First Frame Reference
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* 2. Mandatory Aspect Ratio Selector (16:9 or 9:16) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                2. Video Aspect Ratio
              </label>
              <span className="text-[11px] text-amber-400/60 font-mono">
                Model: veo-3.1-fast-generate-preview
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  aspectRatio === '16:9'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-100 shadow-md shadow-amber-950/60'
                    : 'bg-[#0f0e0d] border-amber-950/60 text-amber-400/60 hover:text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-100">16:9 Landscape</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    Cinema
                  </span>
                </div>
                <p className="text-xs text-amber-300/70 mt-1">
                  Ideal for desktop, widescreen presentation, and full atmosphere.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  aspectRatio === '9:16'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-100 shadow-md shadow-amber-950/60'
                    : 'bg-[#0f0e0d] border-amber-950/60 text-amber-400/60 hover:text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-100">9:16 Portrait</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    Mobile
                  </span>
                </div>
                <p className="text-xs text-amber-300/70 mt-1">
                  Ideal for smartphone reels, vertical feeds, and personal stories.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Motion Prompt */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                3. Motion & Camera Direction
              </label>
              <span className="text-[11px] text-amber-400/60">
                Describe the natural movement
              </span>
            </div>

            <textarea
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              placeholder="Describe subtle camera motions, steam rising from cups, smiles, flickering light..."
              rows={3}
              className="w-full rounded-xl bg-[#0f0e0d] border border-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-100 text-sm p-3.5 placeholder:text-amber-700/60 resize-none outline-none transition-all"
            />

            {/* Quick Motion Presets */}
            <div className="space-y-1 pt-1">
              <p className="text-[11px] text-amber-400/70 font-medium">Motion ideas:</p>
              <div className="space-y-1.5">
                {motionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMotionPrompt(preset)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-800/30 border border-amber-900/40 text-[11px] text-amber-200/80 hover:text-amber-100 transition-colors line-clamp-1"
                    title={preset}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating || !selectedImageData}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Veo is Synthesizing Video ({elapsedSeconds}s)...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4 text-amber-300" />
                <span>Animate Photo with Veo</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generation Monitor & Video Player */}
        <div className="lg:col-span-6 bg-[#16130f] border border-amber-900/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl min-h-[460px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/60">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif-title text-base font-bold text-amber-100">
                  {generatedVideoUrl ? 'Generated Video Preview' : 'Veo Cinema Monitor'}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-900/40">
                Aspect: {aspectRatio}
              </span>
            </div>

            <div className="mt-6">
              {isGenerating ? (
                /* Active Video Generation Status Screen */
                <div className="rounded-xl bg-[#0f0e0d] border border-amber-900/40 p-8 flex flex-col items-center justify-center text-center space-y-6">
                  {/* Glowing Orbit Spinner */}
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-600/20 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-amber-400/20 border-b-amber-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                    <Film className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h4 className="font-serif-title text-lg font-bold text-amber-100">
                      Generating Video with Veo
                    </h4>
                    <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                      {statusMessage}
                    </p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Elapsed time: {elapsedSeconds} seconds</span>
                    </div>
                  </div>

                  {/* Reassuring note */}
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-left text-xs text-amber-300/80 space-y-1.5 w-full">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Veo Quality Note</span>
                    </div>
                    <p className="text-[11px] text-amber-300/70 leading-relaxed">
                      AI video rendering usually takes ~30 to 90 seconds to calculate physical lighting and temporal consistency. Please stay on this tab while it renders.
                    </p>
                  </div>
                </div>
              ) : generatedVideoUrl ? (
                /* Completed Video Player */
                <div className="space-y-4">
                  <div
                    className={`rounded-xl overflow-hidden border-2 border-amber-600/50 bg-black shadow-2xl relative mx-auto flex items-center justify-center ${
                      aspectRatio === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'w-full aspect-[16/9]'
                    }`}
                  >
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0f0e0d] border border-amber-950/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Video Generated Successfully</span>
                    </div>
                    <p className="text-xs text-amber-200/70 italic line-clamp-2">
                      "{motionPrompt}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Idle state */
                <div className="aspect-[16/9] w-full rounded-xl bg-[#0f0e0d] border border-dashed border-amber-900/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-400">
                    <Film className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-200">
                      Ready to animate
                    </p>
                    <p className="text-xs text-amber-400/60 max-w-xs mt-1">
                      Choose an aspect ratio (`16:9` or `9:16`), select your starting frame, and click "Animate Photo with Veo".
                    </p>
                  </div>
                  <button
                    onClick={handleSelectRestaurantPhoto}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Load Phunsto Lumbu Seniors Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer for Generated Video */}
          {generatedVideoUrl && (
            <div className="pt-4 border-t border-amber-950/60 flex flex-wrap gap-2.5">
              <a
                href={generatedVideoUrl}
                download={`veo-phunsto-lumbu-${aspectRatio}.mp4`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-medium text-xs shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4 Video</span>
              </a>

              <button
                onClick={() => {
                  setGeneratedVideoUrl(null);
                  handleGenerateVideo();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-200 text-xs font-medium border border-amber-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Regenerate</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
