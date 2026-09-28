/**
 * Authentic Bhutanese Music Audio Engine
 * Uses Web Audio API to synthesize traditional Bhutanese instruments:
 * - Dranyen (6-string fretless Himalayan lute with woody pluck harmonics)
 * - Lim (Bamboo mountain flute with breathy overtones and vibrato)
 * - Tingsha (Bronze meditation prayer chimes)
 * - Low Dungkhar drone (Warm resonant monastic brass root)
 */

export interface BhutaneseTrack {
  id: string;
  title: string;
  genre: 'Boedra' | 'Zhungdra' | 'Rigsar' | 'Meditation' | 'Tshechu';
  description: string;
  duration: number; // in seconds
  bpm: number;
  melodyNotes: { note: number; duration: number; instrument: 'dranyen' | 'lim' | 'tingsha' | 'drone' }[];
}

// Pentatonic Himalayan Scale frequencies (in Hz):
// C4 (261.63), D4 (293.66), E4 (329.63), G4 (392.00), A4 (440.00), C5 (523.25), D5 (587.33), E5 (659.25), G5 (783.99)
const NOTES = {
  C3: 130.81,
  D3: 146.83,
  G3: 196.00,
  A3: 220.00,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  A5: 880.00,
};

export const BHUTANESE_TRACKS: BhutaneseTrack[] = [
  {
    id: 'boedra-serenade',
    title: 'Boedra: Whispers of the Paro Valley',
    genre: 'Boedra',
    description: 'Traditional Bhutanese Boedra folk melody played on the resonant 6-string Dranyen lute and bamboo flute.',
    duration: 32,
    bpm: 84,
    melodyNotes: [
      { note: NOTES.C3, duration: 4.0, instrument: 'drone' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.G4, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 1.4, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 1.4, instrument: 'lim' },
      { note: NOTES.G4, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.E4, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 1.4, instrument: 'dranyen' },
      { note: NOTES.C4, duration: 2.1, instrument: 'dranyen' },
      // Repeat variation with flute
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.E4, duration: 0.7, instrument: 'lim' },
      { note: NOTES.G4, duration: 0.7, instrument: 'lim' },
      { note: NOTES.A4, duration: 1.4, instrument: 'lim' },
      { note: NOTES.C5, duration: 0.7, instrument: 'lim' },
      { note: NOTES.D5, duration: 1.4, instrument: 'dranyen' },
      { note: NOTES.E5, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 0.7, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 1.4, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 0.7, instrument: 'lim' },
      { note: NOTES.G4, duration: 1.4, instrument: 'dranyen' },
      { note: NOTES.C4, duration: 2.8, instrument: 'dranyen' },
    ],
  },
  {
    id: 'zhungdra-twilight',
    title: 'Zhungdra: Himalayan Evening Raga',
    genre: 'Zhungdra',
    description: 'Classical meditative Bhutanese Zhungdra tune evoking the sacred tranquility of Tiger\'s Nest at sunset.',
    duration: 36,
    bpm: 68,
    melodyNotes: [
      { note: NOTES.G3, duration: 6.0, instrument: 'drone' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.C4, duration: 1.2, instrument: 'dranyen' },
      { note: NOTES.D4, duration: 1.2, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 2.4, instrument: 'lim' },
      { note: NOTES.A4, duration: 1.2, instrument: 'lim' },
      { note: NOTES.G4, duration: 1.2, instrument: 'dranyen' },
      { note: NOTES.E4, duration: 2.4, instrument: 'dranyen' },
      { note: NOTES.D4, duration: 1.2, instrument: 'lim' },
      { note: NOTES.C4, duration: 3.0, instrument: 'dranyen' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.G4, duration: 1.5, instrument: 'lim' },
      { note: NOTES.C5, duration: 2.0, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 1.5, instrument: 'lim' },
      { note: NOTES.C5, duration: 1.5, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 2.5, instrument: 'lim' },
      { note: NOTES.G4, duration: 2.0, instrument: 'dranyen' },
      { note: NOTES.E4, duration: 1.5, instrument: 'dranyen' },
      { note: NOTES.D4, duration: 2.0, instrument: 'lim' },
      { note: NOTES.C4, duration: 4.0, instrument: 'dranyen' },
    ],
  },
  {
    id: 'tshechu-celebration',
    title: 'Tshechu: Festive Dranyen Rhythm',
    genre: 'Tshechu',
    description: 'Joyous Bhutanese festival folk tune celebrating happiness, long life, and community gatherings.',
    duration: 28,
    bpm: 104,
    melodyNotes: [
      { note: NOTES.D3, duration: 4.0, instrument: 'drone' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.A4, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 0.9, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 0.9, instrument: 'lim' },
      { note: NOTES.A4, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.E4, duration: 0.9, instrument: 'dranyen' },
      { note: NOTES.D4, duration: 1.35, instrument: 'dranyen' },
      // Second phrase
      { note: NOTES.D5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.E5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.G5, duration: 0.9, instrument: 'lim' },
      { note: NOTES.E5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 0.45, instrument: 'dranyen' },
      { note: NOTES.C5, duration: 0.9, instrument: 'dranyen' },
      { note: NOTES.A4, duration: 0.9, instrument: 'dranyen' },
      { note: NOTES.D5, duration: 1.8, instrument: 'dranyen' },
    ],
  },
  {
    id: 'phunsto-evening-zen',
    title: 'Phunsto Lumbu: Hearthside Butter Tea Meditation',
    genre: 'Meditation',
    description: 'Slow-tempo warm acoustic drone and gentle wooden chimes designed for soothing senior comfort and relaxation.',
    duration: 35,
    bpm: 60,
    melodyNotes: [
      { note: NOTES.C3, duration: 8.0, instrument: 'drone' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.C4, duration: 2.0, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 2.0, instrument: 'lim' },
      { note: NOTES.A4, duration: 3.0, instrument: 'lim' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.G4, duration: 2.0, instrument: 'dranyen' },
      { note: NOTES.E4, duration: 3.0, instrument: 'dranyen' },
      { note: NOTES.D4, duration: 2.0, instrument: 'lim' },
      { note: NOTES.C4, duration: 4.0, instrument: 'dranyen' },
      { note: 0, duration: 0.1, instrument: 'tingsha' },
      { note: NOTES.E4, duration: 2.0, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 2.0, instrument: 'lim' },
      { note: NOTES.C5, duration: 3.5, instrument: 'dranyen' },
      { note: NOTES.G4, duration: 2.0, instrument: 'lim' },
      { note: NOTES.C4, duration: 5.0, instrument: 'dranyen' },
    ],
  },
];

export class BhutaneseMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private scheduledSources: { stop: () => void }[] = [];
  private analyser: AnalyserNode | null = null;
  private currentTrack: BhutaneseTrack | null = null;
  private onEndedCallback: (() => void) | null = null;
  private startTime = 0;
  private pauseTime = 0;
  private loop = true;

  constructor() {
    // Initialized on user interaction
  }

  public getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): BhutaneseTrack | null {
    return this.currentTrack;
  }

  public setLoop(loop: boolean): void {
    this.loop = loop;
  }

  public onEnded(callback: () => void): void {
    this.onEndedCallback = callback;
  }

  /**
   * Synthesize Dranyen (Himalayan lute):
   * Karplus-Strong / Multi-harmonic plucked string synthesis with decay and warm body resonance
   */
  private playDranyenPluck(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
    // Primary fundamental oscillator
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const bodyFilter = ctx.createBiquadFilter();

    // Body resonance (wooden soundboard of Bhutanese dranyen)
    bodyFilter.type = 'bandpass';
    bodyFilter.frequency.setValueAtTime(freq * 1.5, startTime);
    bodyFilter.Q.setValueAtTime(3.2, startTime);

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // 2nd harmonic (octave pluck snap)
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(freq * 2.01, startTime);

    // 3rd harmonic
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 3.0, startTime);

    // Pluck amplitude envelope: fast attack, logarithmic acoustic decay
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.08, startTime + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(duration, 2.2));

    osc1.connect(bodyFilter);
    osc2.connect(bodyFilter);
    osc3.connect(bodyFilter);
    bodyFilter.connect(gainNode);
    gainNode.connect(dest);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    const stopTime = startTime + Math.min(duration, 2.3);
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);

    this.scheduledSources.push({
      stop: () => {
        try {
          osc1.stop();
          osc2.stop();
          osc3.stop();
        } catch (_) {}
      },
    });
  }

  /**
   * Synthesize Lim (Bhutanese bamboo flute):
   * Sine wave with breath noise and vibrato modulation
   */
  private playLimFlute(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();

    // Flute vibrato (5.5 Hz gentle Himalayan modulation)
    vibrato.frequency.setValueAtTime(5.5, startTime);
    vibratoGain.gain.setValueAtTime(3.5, startTime);
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Soft breath attack & gentle release
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.08);
    gain.gain.setValueAtTime(0.20, startTime + duration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(dest);

    vibrato.start(startTime);
    osc.start(startTime);

    const stopTime = startTime + duration + 0.05;
    vibrato.stop(stopTime);
    osc.stop(stopTime);

    this.scheduledSources.push({
      stop: () => {
        try {
          vibrato.stop();
          osc.stop();
        } catch (_) {}
      },
    });
  }

  /**
   * Synthesize Tingsha (Tibetan/Bhutanese bronze bells):
   * Inharmonic metallic bell chime with long pristine decay
   */
  private playTingshaBell(ctx: AudioContext, dest: AudioNode, startTime: number) {
    const freqs = [2180, 2920, 4420, 5840];
    const gain = ctx.createGain();

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.5);
    gain.connect(dest);

    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 3.6);
      this.scheduledSources.push({
        stop: () => {
          try {
            osc.stop();
          } catch (_) {}
        },
      });
    });
  }

  /**
   * Synthesize Himalayan Monastic Drone (Warm deep grounding foundation)
   */
  private playHimalayanDrone(ctx: AudioContext, dest: AudioNode, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, startTime);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.14, startTime + 0.8);
    gain.gain.setValueAtTime(0.14, startTime + duration - 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.scheduledSources.push({
      stop: () => {
        try {
          osc.stop();
        } catch (_) {}
      },
    });
  }

  /**
   * Play a selected Bhutanese Track
   */
  public playTrack(track: BhutaneseTrack): void {
    this.stop();
    this.currentTrack = track;
    const ctx = this.getAudioContext();

    // Create main master gain and analyzer for visualizer
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);

    // Warm subtle convolution/reverb filter for mountain monastery acoustic
    const reverbFilter = ctx.createBiquadFilter();
    reverbFilter.type = 'peaking';
    reverbFilter.frequency.setValueAtTime(800, ctx.currentTime);
    reverbFilter.gain.setValueAtTime(2.0, ctx.currentTime);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 256;

    masterGain.connect(reverbFilter);
    reverbFilter.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.isPlaying = true;
    this.startTime = ctx.currentTime;

    let cursor = ctx.currentTime + 0.1;

    // Schedule all notes
    track.melodyNotes.forEach((n) => {
      if (n.instrument === 'dranyen' && n.note > 0) {
        this.playDranyenPluck(ctx, masterGain, n.note, cursor, n.duration);
        cursor += n.duration * 0.82; // Slight musical legato/overlap
      } else if (n.instrument === 'lim' && n.note > 0) {
        this.playLimFlute(ctx, masterGain, n.note, cursor, n.duration);
        cursor += n.duration;
      } else if (n.instrument === 'tingsha') {
        this.playTingshaBell(ctx, masterGain, cursor);
        cursor += 0.3;
      } else if (n.instrument === 'drone' && n.note > 0) {
        this.playHimalayanDrone(ctx, masterGain, n.note, cursor, n.duration);
      }
    });

    const totalDuration = cursor - ctx.currentTime;

    // Setup track end & loop
    const endTimeout = setTimeout(() => {
      if (this.isPlaying && this.currentTrack?.id === track.id) {
        if (this.loop) {
          this.playTrack(track);
        } else {
          this.stop();
          if (this.onEndedCallback) this.onEndedCallback();
        }
      }
    }, totalDuration * 1000);

    this.scheduledSources.push({
      stop: () => clearTimeout(endTimeout),
    });
  }

  public stop(): void {
    this.scheduledSources.forEach((s) => s.stop());
    this.scheduledSources = [];
    this.isPlaying = false;
  }

  public togglePlay(track: BhutaneseTrack): boolean {
    if (this.isPlaying && this.currentTrack?.id === track.id) {
      this.stop();
      return false;
    } else {
      this.playTrack(track);
      return true;
    }
  }

  /**
   * Generate an offline rendered audio WAV Data URL of the track
   * so users can download it as an audio file!
   */
  public async renderTrackToWavUrl(track: BhutaneseTrack): Promise<string> {
    const sampleRate = 44100;
    const duration = track.duration;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, 0);
    masterGain.connect(offlineCtx.destination);

    let cursor = 0.1;
    track.melodyNotes.forEach((n) => {
      if (n.instrument === 'dranyen' && n.note > 0) {
        this.playDranyenPluck(offlineCtx as any, masterGain, n.note, cursor, n.duration);
        cursor += n.duration * 0.82;
      } else if (n.instrument === 'lim' && n.note > 0) {
        this.playLimFlute(offlineCtx as any, masterGain, n.note, cursor, n.duration);
        cursor += n.duration;
      } else if (n.instrument === 'tingsha') {
        this.playTingshaBell(offlineCtx as any, masterGain, cursor);
        cursor += 0.3;
      } else if (n.instrument === 'drone' && n.note > 0) {
        this.playHimalayanDrone(offlineCtx as any, masterGain, n.note, cursor, n.duration);
      }
    });

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavDataUrl(renderedBuffer);
  }
}

/**
 * Encodes an AudioBuffer to WAV format as Data URL
 */
function audioBufferToWavDataUrl(buffer: AudioBuffer): string {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * numChannels * bytesPerSample;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // Helper writing ascii
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');

  /* FMT sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  /* Data sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Interleave channels
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  const blob = new Blob([bufferArray], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Global shared engine singleton
export const sharedMusicEngine = new BhutaneseMusicEngine();
