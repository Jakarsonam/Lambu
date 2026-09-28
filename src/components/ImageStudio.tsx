import React, { useState, useRef, useEffect } from 'react';
import restaurantImg from '../assets/images/seniors_restaurant_1790584984164.jpg';
import { AspectRatioType, GalleryItem } from '../types';
import { fileToBase64, urlToBase64 } from '../utils/imageUtils';
import {
  Sparkles,
  Upload,
  RefreshCw,
  Download,
  Film,
  Image as ImageIcon,
  Sliders,
  Check,
  AlertCircle,
  Wand2,
  Columns,
  Eye,
  ArrowRight
} from 'lucide-react';

interface ImageStudioProps {
  initialBaseImageUrl?: string | null;
  onAnimateInVeo: (imageUrl: string) => void;
  onSaveToGallery: (item: GalleryItem) => void;
}

export const ImageStudio: React.FC<ImageStudioProps> = ({
  initialBaseImageUrl,
  onAnimateInVeo,
  onSaveToGallery,
}) => {
  const [mode, setMode] = useState<'create' | 'edit'>(initialBaseImageUrl ? 'edit' : 'create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('16:9');
  const [imageSize, setImageSize] = useState<'1K' | '2K'>('1K');
  
  // Base image state for editing
  const [baseImagePreview, setBaseImagePreview] = useState<string | null>(initialBaseImageUrl || null);
  const [baseImageData, setBaseImageData] = useState<{ base64: string; mimeType: string } | null>(null);

  // Generation state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<'split' | 'result' | 'original'>('split');
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If initial base image is passed, load its base64 data
  useEffect(() => {
    if (initialBaseImageUrl) {
      setMode('edit');
      setBaseImagePreview(initialBaseImageUrl);
      urlToBase64(initialBaseImageUrl)
        .then((data) => setBaseImageData(data))
        .catch((err) => console.warn('Failed to convert initial image to base64:', err));
    }
  }, [initialBaseImageUrl]);

  const loadRestaurantAsBase = async () => {
    try {
      setMode('edit');
      setBaseImagePreview(restaurantImg);
      const data = await urlToBase64(restaurantImg);
      setBaseImageData(data);
    } catch (e) {
      console.error('Failed to load restaurant image:', e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await fileToBase64(file);
      setBaseImageData(data);
      const preview = URL.createObjectURL(file);
      setBaseImagePreview(preview);
      setMode('edit');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read uploaded photo.');
    }
  };

  const promptPresets = [
    'Seniors enjoying butter tea and laughter by the cedar hearth at Phunsto Lumbu Restaurant in evening',
    'Elderly couple sharing steaming vegetable momos with warm glowing lanterns, cinematic cozy lighting',
    'Old friends playing traditional Tibetan dice game Sho in a warm rustic mountain restaurant at twilight',
    'Traditional Himalayan ceramic teacups with steaming herbal brew on rustic wooden table, soft evening bokeh',
  ];

  const editPromptPresets = [
    'Add an antique copper teapot steaming gently in the center of the wooden table',
    'Change the background view outside the window to snow-draped Himalayan peaks at sunset',
    'Add warm golden fairy lights hanging softly from the ceiling beams',
    'Transform the atmosphere into a serene twilight candlelight dinner',
    'Enhance with traditional Tibetan silk tapestries and prayer flags in soft evening focus',
  ];

  const aspectRatios: { value: AspectRatioType; label: string; iconLabel: string }[] = [
    { value: '16:9', label: '16:9 Landscape', iconLabel: 'Widescreen' },
    { value: '1:1', label: '1:1 Square', iconLabel: 'Social' },
    { value: '4:3', label: '4:3 Classic', iconLabel: 'Standard' },
    { value: '3:4', label: '3:4 Portrait', iconLabel: 'Tall' },
    { value: '9:16', label: '9:16 Vertical', iconLabel: 'Story' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a description or editing instructions.');
      return;
    }

    if (mode === 'edit' && !baseImageData) {
      setErrorMessage('Please select or upload an image to edit.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setGeneratedImageUrl(null);
    setResultText(null);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1800);

    try {
      const payload: any = {
        prompt: prompt.trim(),
        aspectRatio,
        imageSize,
      };

      if (mode === 'edit' && baseImageData) {
        payload.image = {
          data: baseImageData.base64,
          mimeType: baseImageData.mimeType,
        };
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      setGeneratedImageUrl(data.imageUrl);
      setResultText(data.text || null);

      // Save to gallery
      const galleryItem: GalleryItem = {
        id: `img-${Date.now()}`,
        type: 'image',
        url: data.imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        aspectRatio,
        baseImageUrl: mode === 'edit' ? baseImagePreview || undefined : undefined,
        model: data.model || 'gemini-3.1-flash-image-preview',
        title: mode === 'edit' ? 'Edited Image' : 'Created Image',
      };
      onSaveToGallery(galleryItem);
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMessage(err.message || 'Error occurred while creating image.');
    } finally {
      setIsLoading(false);
    }
  };

  const useResultAsNewBase = async () => {
    if (!generatedImageUrl) return;
    try {
      const data = await urlToBase64(generatedImageUrl);
      setBaseImageData(data);
      setBaseImagePreview(generatedImageUrl);
      setMode('edit');
      setPrompt('');
      setGeneratedImageUrl(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Powered by Gemini 3.1 Flash Image</span>
        </div>
        <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-amber-100">
          Create & Edit Restaurant Imagery
        </h2>
        <p className="text-amber-200/70 text-sm max-w-xl mx-auto">
          Synthesize new heartwarming evening scenes from natural text prompts, or remix and edit existing photos with precise visual instructions.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#181512] border border-amber-900/40 shadow-inner">
          <button
            onClick={() => setMode('create')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'create'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-amber-300/70 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Create New Scene</span>
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'edit'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-amber-300/70 hover:text-amber-100 hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Edit / Remix Photo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-6 bg-[#16130f] border border-amber-900/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
          {/* Base Image Selection (Only in Edit Mode) */}
          {mode === 'edit' && (
            <div className="space-y-3 pb-6 border-b border-amber-950/60">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
                1. Select Photo to Edit
              </label>

              {baseImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-amber-600/40 bg-black/40 group aspect-[16/9] flex items-center justify-center">
                  <img
                    src={baseImagePreview}
                    alt="Base for editing"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow hover:bg-amber-500 transition-colors"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={loadRestaurantAsBase}
                      className="px-3.5 py-2 rounded-xl bg-neutral-800 text-amber-200 text-xs font-semibold border border-white/20 hover:bg-neutral-700 transition-colors"
                    >
                      Reset to Phunsto Lumbu
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={loadRestaurantAsBase}
                    className="p-4 rounded-xl border border-amber-500/30 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-900/30 text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-amber-100">
                      Phunsto Lumbu Photo
                    </p>
                    <p className="text-[11px] text-amber-300/70">
                      Edit the seniors evening gathering photograph
                    </p>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-amber-800/60 hover:border-amber-500/60 bg-black/20 hover:bg-white/5 text-left space-y-2 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-amber-100">
                      Upload Custom Photo
                    </p>
                    <p className="text-[11px] text-amber-300/70">
                      JPEG, PNG or WebP up to 10MB
                    </p>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          )}

          {/* Prompt Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {mode === 'create' ? 'Prompt Description' : 'Editing Instructions'}
              </label>
              <span className="text-[11px] text-amber-400/60">
                {mode === 'create' ? 'Describe scene in detail' : 'State what to add, remove, or change'}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'create'
                    ? 'e.g., A warm evening inside Phunsto Lumbu restaurant. Seniors smiling around a rustic wooden table with hot butter tea and momos, soft lantern glow...'
                    : 'e.g., Add an antique brass kettle on the table and soft snow falling gently outside the window...'
                }
                rows={4}
                className="w-full rounded-xl bg-[#0f0e0d] border border-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-100 text-sm p-3.5 placeholder:text-amber-700/60 resize-none outline-none transition-all"
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-amber-400/70 font-medium">Quick suggestions:</p>
              <div className="flex flex-wrap gap-1.5">
                {(mode === 'create' ? promptPresets : editPromptPresets).map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(preset)}
                    className="text-left px-2.5 py-1 rounded-lg bg-amber-950/30 hover:bg-amber-800/30 border border-amber-900/40 text-[11px] text-amber-200/80 hover:text-amber-100 transition-colors line-clamp-1 max-w-full"
                    title={preset}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratio Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {aspectRatios.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setAspectRatio(item.value)}
                  className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                    aspectRatio === item.value
                      ? 'bg-amber-600/30 border-amber-500 text-amber-100 shadow-sm shadow-amber-950/50'
                      : 'bg-[#0f0e0d] border-amber-950/60 text-amber-400/60 hover:text-amber-200 hover:border-amber-800/40'
                  }`}
                >
                  <div className="text-xs font-bold">{item.value}</div>
                  <div className="text-[10px] text-amber-300/60">{item.iconLabel}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Choice */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Target Resolution
            </span>
            <div className="inline-flex p-1 rounded-lg bg-[#0f0e0d] border border-amber-950/60">
              {(['1K', '2K'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    imageSize === size
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-400/60 hover:text-amber-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Generating Image with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{mode === 'create' ? 'Generate Image' : 'Apply Edits to Image'}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview & Results */}
        <div className="lg:col-span-6 bg-[#16130f] border border-amber-900/40 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl min-h-[420px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-amber-950/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <h3 className="font-serif-title text-base font-bold text-amber-100">
                  {generatedImageUrl ? 'Generated Result' : 'Studio Canvas'}
                </h3>
              </div>

              {generatedImageUrl && mode === 'edit' && baseImagePreview && (
                <div className="inline-flex p-1 rounded-lg bg-[#0f0e0d] border border-amber-950/60 text-xs">
                  <button
                    onClick={() => setCompareMode('split')}
                    className={`px-2.5 py-0.5 rounded ${
                      compareMode === 'split' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400/70'
                    }`}
                  >
                    Compare
                  </button>
                  <button
                    onClick={() => setCompareMode('result')}
                    className={`px-2.5 py-0.5 rounded ${
                      compareMode === 'result' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400/70'
                    }`}
                  >
                    Edited
                  </button>
                  <button
                    onClick={() => setCompareMode('original')}
                    className={`px-2.5 py-0.5 rounded ${
                      compareMode === 'original' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400/70'
                    }`}
                  >
                    Original
                  </button>
                </div>
              )}
            </div>

            {/* Display Area */}
            <div className="mt-6">
              {isLoading ? (
                <div className="aspect-[16/9] w-full rounded-xl bg-[#0f0e0d] border border-amber-900/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-amber-600/30 border-t-amber-400 animate-spin" />
                    <Sparkles className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-200">
                      {loadingStep === 1 && 'Analyzing prompt and creative aesthetics...'}
                      {loadingStep === 2 && 'Synthesizing lighting, textures, and composition...'}
                      {loadingStep === 3 && 'Refining details with Gemini 3.1 Flash Image...'}
                      {loadingStep >= 4 && 'Polishing high-resolution output...'}
                    </p>
                    <p className="text-xs text-amber-400/60">
                      Processing on Google AI Studio server-side engine
                    </p>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <div className="space-y-4">
                  {/* Image Display */}
                  <div className="rounded-xl overflow-hidden border border-amber-600/40 bg-black/60 shadow-2xl relative">
                    {compareMode === 'split' && mode === 'edit' && baseImagePreview ? (
                      <div className="grid grid-cols-2 divide-x divide-amber-900/60">
                        <div className="relative">
                          <img
                            src={baseImagePreview}
                            alt="Original"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover aspect-[16/9]"
                          />
                          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/80 text-amber-300 border border-white/10">
                            Original
                          </span>
                        </div>
                        <div className="relative">
                          <img
                            src={generatedImageUrl}
                            alt="Edited"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover aspect-[16/9]"
                          />
                          <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white shadow">
                            Gemini Edit
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={compareMode === 'original' && baseImagePreview ? baseImagePreview : generatedImageUrl}
                          alt="Generated scene"
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[380px] object-contain mx-auto"
                        />
                        <span className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg bg-black/80 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                          {compareMode === 'original' ? 'Original Photo' : 'Gemini 3.1 Flash Image'}
                        </span>
                      </div>
                    )}
                  </div>

                  {resultText && (
                    <p className="text-xs text-amber-200/70 italic bg-black/30 p-3 rounded-lg border border-amber-950/40">
                      "{resultText}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-xl bg-[#0f0e0d] border border-dashed border-amber-900/40 flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-400">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-200">
                      Your canvas awaits
                    </p>
                    <p className="text-xs text-amber-400/60 max-w-xs mt-1">
                      Enter a prompt or select a photo on the left to see Gemini create or edit images in real time.
                    </p>
                  </div>
                  <button
                    onClick={loadRestaurantAsBase}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                  >
                    Or remix the Phunsto Lumbu Seniors Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer for generated image */}
          {generatedImageUrl && (
            <div className="pt-4 border-t border-amber-950/60 flex flex-wrap gap-2.5">
              <button
                onClick={() => onAnimateInVeo(generatedImageUrl)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-medium text-xs shadow-md transition-all"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Animate this with Veo</span>
              </button>

              <button
                onClick={useResultAsNewBase}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-200 text-xs font-medium border border-amber-500/30 transition-colors"
                title="Edit this image again"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Again</span>
              </button>

              <a
                href={generatedImageUrl}
                download="gemini-phunsto-lumbu.png"
                className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs border border-amber-500/30 transition-colors"
                title="Download PNG"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
