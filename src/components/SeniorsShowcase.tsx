import React, { useState } from 'react';
import restaurantImg from '../assets/images/seniors_restaurant_1790584984164.jpg';
import {
  Film,
  Sparkles,
  Download,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  Heart,
  Utensils,
  Flame,
  ShieldCheck,
  CheckCircle2,
  X,
  Share2,
  Music,
  Play
} from 'lucide-react';

interface SeniorsShowcaseProps {
  onAnimateInVeo: (imageUrl: string) => void;
  onEditInStudio: (imageUrl: string) => void;
  onOpenMusic?: () => void;
}

export const SeniorsShowcase: React.FC<SeniorsShowcaseProps> = ({
  onAnimateInVeo,
  onEditInStudio,
  onOpenMusic,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlayingAmbience, setIsPlayingAmbience] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Gentle fireside warm ambience synthesis with Web Audio API (no external audio files needed)
  const toggleAmbience = () => {
    if (isPlayingAmbience && audioCtx) {
      audioCtx.close();
      setAudioCtx(null);
      setIsPlayingAmbience(false);
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Warm low drone simulating hearth & singing bowl resonance (136.1 Hz Om frequency)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      // Subtle pink noise for crackling fire warmth
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.5, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      whiteNoise.start();

      setAudioCtx(ctx);
      setIsPlayingAmbience(true);
    } catch (e) {
      console.warn('AudioContext not permitted yet:', e);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Showcase Container */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c1813] via-[#16130f] to-[#0f0e0d] border border-amber-900/40 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-700/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Phunsto Lumbu Restaurant • Evening Gathering</span>
          </div>

          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-100 tracking-tight leading-tight">
            Perfect for Seniors in evening
          </h2>

          <p className="text-amber-200/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            A serene sanctuary where warm Himalayan butter tea flows, laughter is shared across hand-carved cedar tables, and evening brings quiet comfort and nourishing food.
          </p>
        </div>

        {/* The Generated Masterpiece Image */}
        <div className="relative group max-w-5xl mx-auto rounded-2xl overflow-hidden border-2 border-amber-600/30 bg-black/60 shadow-2xl glow-amber-card">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
            <img
              src={restaurantImg}
              alt="Seniors chilling out in Phunsto Lumbu Restaurant with caption Perfect for Seniors in evening"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Permanent Caption Overlay Banner */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex flex-wrap gap-2 items-center">
              <div className="backdrop-blur-md bg-black/75 border border-amber-500/50 text-amber-100 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide shadow-xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Perfect for Seniors in evening</span>
              </div>
              <div className="backdrop-blur-md bg-black/60 border border-white/10 text-amber-300/90 px-3 py-1.5 rounded-xl text-[11px] font-medium hidden sm:inline-flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>5:00 PM – 9:00 PM Social Hours</span>
              </div>
            </div>

            {/* Quick interactive floating controls on the photo */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2">
              <button
                onClick={toggleAmbience}
                title={isPlayingAmbience ? 'Mute Fireside Ambience' : 'Play Hearthside Ambience'}
                className={`p-2.5 rounded-xl backdrop-blur-md text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isPlayingAmbience
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/30'
                    : 'bg-black/60 text-amber-200 border-white/20 hover:bg-black/80'
                }`}
              >
                {isPlayingAmbience ? (
                  <>
                    <Volume2 className="w-4 h-4 animate-bounce" />
                    <span className="hidden sm:inline">Ambience On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span className="hidden sm:inline">Play Ambience</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsLightboxOpen(true)}
                className="p-2.5 rounded-xl backdrop-blur-md bg-black/60 text-amber-200 border border-white/20 hover:bg-black/80 hover:text-white transition-all"
                title="Fullscreen View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Gradient Overlay for Action Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left w-full sm:w-auto">
                <p className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  Phunsto Lumbu Heritage Retreat
                </p>
                <p className="text-sm font-serif-title text-amber-100 italic">
                  "Gentle warmth, laughter, and lifelong stories by the cedar hearth."
                </p>
              </div>

              {/* Action Buttons to Animate with Veo or Edit with Gemini */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                {onOpenMusic && (
                  <button
                    onClick={onOpenMusic}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-950/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Music className="w-4 h-4 fill-neutral-950" />
                    <span>Play Bhutanese Music</span>
                  </button>
                )}

                <button
                  onClick={() => onAnimateInVeo(restaurantImg)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-amber-950/60 hover:shadow-amber-700/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Film className="w-4 h-4" />
                  <span>Animate with Veo</span>
                </button>

                <button
                  onClick={() => onEditInStudio(restaurantImg)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-200 border border-amber-500/30 hover:border-amber-500/60 font-medium text-xs sm:text-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Remix & Edit</span>
                </button>

                <a
                  href={restaurantImg}
                  download="phunsto-lumbu-seniors-evening.jpg"
                  className="p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 hover:text-white transition-colors"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 hover:text-white transition-colors relative"
                  title="Share Link"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedNotification && (
                    <span className="absolute -top-8 right-0 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Phunsto Lumbu is Perfect for Seniors */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-serif-title text-2xl sm:text-3xl font-bold text-amber-100">
            Thoughtfully Crafted for Senior Comfort
          </h3>
          <p className="text-amber-300/70 text-sm mt-2">
            Every evening detail at Phunsto Lumbu is tuned to promote relaxation, gentle digestion, and meaningful conversations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Warm Ambiance & Hearing Comfort */}
          <div className="p-6 rounded-2xl bg-[#171410] border border-amber-900/30 hover:border-amber-600/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="font-serif-title text-lg font-bold text-amber-100">
              Acoustic & Lighting Comfort
            </h4>
            <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed">
              Gentle amber lighting eliminates glare. Soft wool tapestries and Himalayan woodwork absorb background noise, making conversations easy and strain-free for hearing aids.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Acoustic comfort certified</span>
            </div>
          </div>

          {/* Card 2: Wholesome Gentle Dining */}
          <div className="p-6 rounded-2xl bg-[#171410] border border-amber-900/30 hover:border-amber-600/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="font-serif-title text-lg font-bold text-amber-100">
              Nourishing & Easy-to-Digest Menu
            </h4>
            <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed">
              Steamed vegetable & yak momos, warm organic bone broths, soothing ginger honey lemon tea, and low-sodium Himalayan herbal infusions prepared fresh every evening.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Low-sodium & gentle digestion</span>
            </div>
          </div>

          {/* Card 3: Ergonomic & Accessible */}
          <div className="p-6 rounded-2xl bg-[#171410] border border-amber-900/30 hover:border-amber-600/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif-title text-lg font-bold text-amber-100">
              Zero-Step Accessibility
            </h4>
            <p className="text-amber-200/70 text-xs sm:text-sm leading-relaxed">
              Step-free entrance ramps, firm ergonomic lumbar-support chairs, wide aisles for walkers and wheelchairs, and dedicated attentive senior host care throughout the evening.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full ADA & mobility compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Evening Schedule & Special Senior Perk Card */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1b1712] to-amber-950/40 border border-amber-600/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5" />
              <span>Daily Evening Sanctuary: 5:00 PM – 9:00 PM</span>
            </div>
            <h4 className="font-serif-title text-xl sm:text-2xl font-bold text-amber-100">
              Complimentary Himalayan Butter Tea for Seniors
            </h4>
            <p className="text-amber-200/75 text-xs sm:text-sm max-w-lg leading-relaxed">
              Join fellow seniors for an evening of warmth. Every guest aged 60+ enjoys our traditional churned butter tea and sweet roasted tsampa snacks on the house.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onAnimateInVeo(restaurantImg)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm transition-all shadow-md"
            >
              <Film className="w-4 h-4" />
              <span>Generate Video from this Photo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-6xl w-full max-h-[85vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-2xl max-h-[75vh]">
              <img
                src={restaurantImg}
                alt="Perfect for Seniors in evening - Phunsto Lumbu Restaurant"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
              <div className="absolute bottom-4 left-4 backdrop-blur-md bg-black/80 text-amber-100 px-4 py-2 rounded-xl text-sm font-bold border border-amber-500/50">
                Perfect for Seniors in evening • Phunsto Lumbu Restaurant
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  onAnimateInVeo(restaurantImg);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center gap-2"
              >
                <Film className="w-4 h-4" />
                <span>Animate with Veo</span>
              </button>
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  onEditInStudio(restaurantImg);
                }}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-200 font-medium text-sm flex items-center gap-2 border border-amber-500/30"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Edit with Gemini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
