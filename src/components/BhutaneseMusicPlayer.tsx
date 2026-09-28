import React, { useState, useEffect, useRef } from 'react';
import {
  BHUTANESE_TRACKS,
  BhutaneseTrack,
  sharedMusicEngine,
} from '../utils/bhutaneseAudio';
import { GalleryItem } from '../types';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Download,
  Volume2,
  VolumeX,
  Disc3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Share2,
  Info,
  ExternalLink
} from 'lucide-react';

interface BhutaneseMusicPlayerProps {
  onSaveToGallery?: (item: GalleryItem) => void;
  autoPlayOnMount?: boolean;
}

export const BhutaneseMusicPlayer: React.FC<BhutaneseMusicPlayerProps> = ({
  onSaveToGallery,
  autoPlayOnMount = false,
}) => {
  // Playback state
  const [currentTrack, setCurrentTrack] = useState<BhutaneseTrack>(BHUTANESE_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeSourceType, setActiveSourceType] = useState<'acoustic' | 'ai'>('acoustic');
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.85);

  // AI Lyria Generation state
  const [musicModel, setMusicModel] = useState<'lyria-3-clip-preview' | 'lyria-3-pro-preview'>('lyria-3-clip-preview');
  const [prompt, setPrompt] = useState<string>(
    'Traditional Bhutanese folk music featuring 6-string Dranyen lute, soft bamboo Lim flute, and gentle meditation bells, warm evening mountain atmosphere'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quotaNotice, setQuotaNotice] = useState<boolean>(false);
  const [downloadingWav, setDownloadingWav] = useState<boolean>(false);

  // Audio elements & Canvas Visualizer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);

  // Handle auto-play on mount if requested
  useEffect(() => {
    if (autoPlayOnMount) {
      handlePlayTrack(BHUTANESE_TRACKS[0]);
    }
    return () => {
      sharedMusicEngine.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 36;
    let visualizerData = new Uint8Array(bars);

    const render = () => {
      const analyser = sharedMusicEngine.getAnalyser();

      if (analyser && isPlaying && activeSourceType === 'acoustic') {
        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        // sample across frequency spectrum
        const step = Math.floor(freqData.length / bars);
        for (let i = 0; i < bars; i++) {
          visualizerData[i] = freqData[i * step] || 0;
        }
      } else if (isPlaying) {
        // Fallback rhythmic animation
        const time = Date.now() * 0.005;
        for (let i = 0; i < bars; i++) {
          visualizerData[i] = Math.floor(
            60 + 50 * Math.sin(time + i * 0.3) + 30 * Math.cos(time * 0.7 + i * 0.5)
          );
        }
      } else {
        // Idle flat bars
        for (let i = 0; i < bars; i++) {
          visualizerData[i] = Math.max(8, visualizerData[i] * 0.9);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bars) - 2;
      for (let i = 0; i < bars; i++) {
        const val = visualizerData[i];
        const barHeight = Math.max(4, (val / 255) * canvas.height * 0.9);
        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Gradient from warm amber to golden orange
        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#b45309');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, activeSourceType]);

  const handlePlayTrack = (track: BhutaneseTrack) => {
    // If AI audio was playing, pause it
    if (aiAudioRef.current) {
      aiAudioRef.current.pause();
    }
    setActiveSourceType('acoustic');
    setCurrentTrack(track);
    sharedMusicEngine.setLoop(isLooping);
    sharedMusicEngine.playTrack(track);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    if (activeSourceType === 'acoustic') {
      const playing = sharedMusicEngine.togglePlay(currentTrack);
      setIsPlaying(playing);
    } else if (activeSourceType === 'ai' && aiAudioRef.current) {
      if (isPlaying) {
        aiAudioRef.current.pause();
        setIsPlaying(false);
      } else {
        aiAudioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePlayAIAudio = () => {
    if (!generatedAudioUrl || !aiAudioRef.current) return;
    sharedMusicEngine.stop();
    setActiveSourceType('ai');
    aiAudioRef.current.currentTime = 0;
    aiAudioRef.current.play();
    setIsPlaying(true);
  };

  const handleDownloadAcousticWav = async (track: BhutaneseTrack) => {
    try {
      setDownloadingWav(true);
      const wavUrl = await sharedMusicEngine.renderTrackToWavUrl(track);
      const a = document.createElement('a');
      a.href = wavUrl;
      a.download = `${track.id}-bhutanese-music.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error rendering WAV:', e);
    } finally {
      setDownloadingWav(false);
    }
  };

  const promptSuggestions = [
    'Traditional Bhutanese Boedra with resonant 6-string Dranyen lute, bamboo Lim flute, and gentle meditation chimes',
    'Soothing Himalayan Zhungdra twilight meditation melody for elderly seniors, soft acoustic hearth warmth',
    'Bhutanese Tshechu celebration folk rhythm with alegre wooden flute, festive acoustic percussion, and bells',
    'Peaceful monastic chant drone with singing bowls and gentle Dranyen arpeggios, tranquil alpine sanctuary',
    'Bhutanese mountain valley evening ballad with traditional strings, soothing acoustic tempo, and river echoes',
  ];

  const handleGenerateLyria = async () => {
    if (!prompt.trim()) {
      setErrorMessage('Please enter a music prompt description.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setQuotaNotice(false);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: musicModel, // 'lyria-3-clip-preview' (30s) or 'lyria-3-pro-preview'
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isQuotaError || res.status === 429) {
          setQuotaNotice(true);
          throw new Error(
            'Lyria requires a paid tier API key (0 tokens available on Free Tier). You can listen to our full authentic Bhutanese acoustic tracks below right now!'
          );
        }
        throw new Error(data.error || 'Failed to generate music.');
      }

      setGeneratedAudioUrl(data.audioUrl);
      setGeneratedPrompt(prompt.trim());
      setActiveSourceType('ai');

      // Save to gallery
      if (onSaveToGallery) {
        const item: GalleryItem = {
          id: `music-${Date.now()}`,
          type: 'music',
          url: data.audioUrl,
          prompt: prompt.trim(),
          timestamp: Date.now(),
          model: musicModel,
          title: `Bhutanese Lyria Track (${musicModel === 'lyria-3-clip-preview' ? '30s Clip' : 'Full Track'})`,
        };
        onSaveToGallery(item);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred during music generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Hidden audio element for AI generated audio */}
      {generatedAudioUrl && (
        <audio
          ref={aiAudioRef}
          src={generatedAudioUrl}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
        />
      )}

      {/* Hero: Now Playing Master Player */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1f1a14] via-[#17130f] to-[#0f0e0d] border border-amber-600/30 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-700/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Rotating Vinyl / Disc & Identity */}
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {/* Glowing decorative disc */}
              <div
                className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-amber-600/40 bg-neutral-950 p-2 shadow-2xl shadow-amber-950/80 flex items-center justify-center transition-all ${
                  isPlaying ? 'rotate-disc-animation glow-amber-card' : ''
                }`}
                style={{
                  animation: isPlaying ? 'spin 12s linear infinite' : 'none',
                }}
              >
                <div className="w-full h-full rounded-full border border-amber-800/40 bg-[#15110d] flex items-center justify-center relative overflow-hidden">
                  {/* Concentric vinyl grooving rings */}
                  <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-8 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-white/5 pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-amber-400 flex items-center justify-center text-white shadow-lg">
                    <Disc3 className="w-8 h-8 animate-pulse text-amber-200" />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-black animate-ping' : 'bg-black/40'}`} />
                  <span>{isPlaying ? 'Now Playing' : 'Paused'}</span>
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs uppercase font-semibold tracking-widest text-amber-400">
                {activeSourceType === 'acoustic' ? currentTrack.genre : 'AI Generated Track'}
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-amber-100 mt-1">
                {activeSourceType === 'acoustic' ? currentTrack.title : 'Lyria Bhutanese Composition'}
              </h3>
              <p className="text-xs text-amber-300/70 max-w-xs mt-1">
                {activeSourceType === 'acoustic'
                  ? currentTrack.description
                  : `"${generatedPrompt}"`}
              </p>
            </div>
          </div>

          {/* Right Column: Waveform Visualizer & Playback Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Traditional Dranyen Lute & Bamboo Flute Engine</span>
              </div>
              <span className="text-xs text-amber-400/80 font-mono">
                {currentTrack.bpm} BPM • Pentatonic Scale
              </span>
            </div>

            {/* Audio Waveform Canvas */}
            <div className="rounded-2xl bg-neutral-950/80 border border-amber-900/40 p-4 shadow-inner relative overflow-hidden">
              <canvas
                ref={canvasRef}
                width={540}
                height={100}
                className="w-full h-24 rounded-lg"
              />
              <div className="flex items-center justify-between text-[11px] text-amber-400/60 font-mono mt-2 px-1">
                <span>00:00</span>
                <span className="flex items-center gap-1 text-amber-300">
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{isPlaying ? 'Live Audio Stream' : 'Press Play to Begin'}</span>
                </span>
                <span>00:{currentTrack.duration < 10 ? `0${currentTrack.duration}` : currentTrack.duration}</span>
              </div>
            </div>

            {/* Main Interactive Play Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                {/* Big Play / Pause Button */}
                <button
                  onClick={handleTogglePlay}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-neutral-950 font-bold flex items-center justify-center shadow-xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause Music' : 'Play Music'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-neutral-950" />
                  ) : (
                    <Play className="w-7 h-7 fill-neutral-950 ml-1" />
                  )}
                </button>

                <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-amber-300">
                    {isPlaying ? 'Playing Audio' : 'Click to Play'}
                  </p>
                  <p className="text-[11px] text-amber-400/60">
                    {activeSourceType === 'acoustic' ? 'Authentic Himalayan Synthesis' : 'Lyria AI Engine'}
                  </p>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsLooping(!isLooping);
                    sharedMusicEngine.setLoop(!isLooping);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isLooping
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                      : 'bg-neutral-900 border-white/10 text-amber-400/60 hover:text-amber-200'
                  }`}
                  title={isLooping ? 'Looping enabled' : 'Looping disabled'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Loop</span>
                </button>

                {activeSourceType === 'acoustic' && (
                  <button
                    onClick={() => handleDownloadAcousticWav(currentTrack)}
                    disabled={downloadingWav}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title="Export WAV File"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">
                      {downloadingWav ? 'Rendering...' : 'Download WAV'}
                    </span>
                  </button>
                )}

                {activeSourceType === 'ai' && generatedAudioUrl && (
                  <a
                    href={generatedAudioUrl}
                    download="bhutanese-lyria-music.mp3"
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download MP3</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Bhutanese Track Playlist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-950/60">
          <div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-amber-100">
              Bhutanese Heritage Playlist
            </h3>
            <p className="text-xs text-amber-300/70 mt-0.5">
              Select an authentic folk arrangement to play immediately with traditional Bhutanese instrument acoustics.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400/70">
            {BHUTANESE_TRACKS.length} Arrangements
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BHUTANESE_TRACKS.map((track) => {
            const isThisPlaying = isPlaying && currentTrack.id === track.id && activeSourceType === 'acoustic';
            return (
              <div
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group ${
                  isThisPlaying
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/50'
                    : 'bg-[#15120e] border-amber-900/40 hover:border-amber-700/60 hover:bg-[#1a1612]'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isThisPlaying
                      ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/30'
                      : 'bg-amber-600/20 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isThisPlaying ? (
                    <Pause className="w-5 h-5 fill-neutral-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-serif-title text-sm sm:text-base font-bold text-amber-100 truncate group-hover:text-amber-200">
                      {track.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold whitespace-nowrap">
                      {track.genre}
                    </span>
                  </div>

                  <p className="text-xs text-amber-300/70 mt-1 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-amber-400/60 mt-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{track.duration}s</span>
                    </span>
                    <span>•</span>
                    <span>{track.bpm} BPM</span>
                    <span>•</span>
                    <span className="text-amber-400 hover:text-amber-300 underline" onClick={(e) => { e.stopPropagation(); handleDownloadAcousticWav(track); }}>
                      Save WAV
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Music Generation Studio (Lyria Models) */}
      <section className="rounded-3xl bg-[#16130f] border border-amber-900/40 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-950/60">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Music Generation Models</span>
            </div>
            <h3 className="font-serif-title text-2xl font-bold text-amber-100">
              Compose with Google Lyria AI
            </h3>
            <p className="text-xs text-amber-300/70 mt-1">
              Generate original audio tracks using <code className="text-amber-300 font-mono">lyria-3-clip-preview</code> (up to 30s clips) or <code className="text-amber-300 font-mono">lyria-3-pro-preview</code> (full-length tracks).
            </p>
          </div>

          {/* Model selector buttons */}
          <div className="inline-flex p-1.5 rounded-xl bg-neutral-950 border border-amber-900/40 text-xs">
            <button
              onClick={() => setMusicModel('lyria-3-clip-preview')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                musicModel === 'lyria-3-clip-preview'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-400/70 hover:text-amber-200'
              }`}
            >
              lyria-3-clip (30s)
            </button>
            <button
              onClick={() => setMusicModel('lyria-3-pro-preview')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                musicModel === 'lyria-3-pro-preview'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-amber-400/70 hover:text-amber-200'
              }`}
            >
              lyria-3-pro (Full)
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300">
            Music Prompt & Instrument Direction
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the mood, instruments, rhythm, and musical style..."
            className="w-full rounded-xl bg-neutral-950 border border-amber-900/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-amber-100 text-sm p-3.5 placeholder:text-amber-700/60 resize-none outline-none"
          />

          {/* Suggestion Chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] text-amber-400/70 font-medium">Bhutanese style suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(suggestion)}
                  className="text-left px-2.5 py-1 rounded-lg bg-amber-950/30 hover:bg-amber-800/30 border border-amber-900/40 text-[11px] text-amber-200/80 hover:text-amber-100 transition-colors line-clamp-1"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quota / Tier Information Banner if free tier triggers */}
        {quotaNotice && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lyria Music Tier Requirement Notice</span>
            </div>
            <p className="text-amber-300/80 leading-relaxed text-[11px]">
              The Lyria models (<code className="text-amber-200">lyria-3-clip-preview</code> and <code className="text-amber-200">lyria-3-pro-preview</code>) are Google Cloud paid-tier capabilities. If your API key is on the Free Tier, enjoy our built-in high-fidelity Bhutanese acoustic instruments above which run directly in your browser with zero limits.
            </p>
          </div>
        )}

        {errorMessage && !quotaNotice && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit & Generate Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateLyria}
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
          >
            {isGenerating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-amber-200" />
                <span>Lyria is Synthesizing {musicModel === 'lyria-3-clip-preview' ? '30s Clip' : 'Full Track'}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Music with {musicModel}</span>
              </>
            )}
          </button>

          {generatedAudioUrl && (
            <button
              onClick={handlePlayAIAudio}
              className="py-3.5 px-5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
            >
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>Play AI Track</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
