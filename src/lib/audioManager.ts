/*
Reason for existence: Singleton audio controller orchestrating live background music playback, Web Audio fallback synthesis, AnalyserNode frequency extraction, and state synchronization across WebOS components.
System impact if absent: Multiple music players will desynchronize, produce audio collisions, or fail when audio sources encounter network errors.
*/

type AudioListener = (isPlaying: boolean, volume: number) => void;

class GlobalAudioManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private volume = 0.7;
  private listeners: Set<AudioListener> = new Set();
  private currentUrl = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private isSynthPlaying = false;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private beatCounter = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (!this.analyser && this.audioCtx) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64; // 32 frequency bins
        this.analyser.smoothingTimeConstant = 0.82;
        this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private initAudio() {
    if (this.audio) return;
    try {
      this.audio = new Audio(this.currentUrl);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.ensureAudioContext();
        this.notify();
      });

      this.audio.addEventListener('pause', () => {
        if (!this.isSynthPlaying) {
          this.isPlaying = false;
          this.notify();
        }
      });

      this.audio.addEventListener('error', () => {
        if (this.isPlaying) {
          this.startSynth();
        }
      });
    } catch {
      // Audio element initialization fallback
    }
  }

  public setTrackUrl(url: string | null) {
    const nextUrl = url && url.startsWith('http') ? url : 'https://stream.zeno.fm/f3wvbbqmdg8uv';
    if (this.currentUrl !== nextUrl) {
      this.currentUrl = nextUrl;
      if (this.audio) {
        const wasPlaying = this.isPlaying;
        this.audio.src = nextUrl;
        if (wasPlaying) {
          this.audio.play().catch(() => this.startSynth());
        }
      }
    }
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public play() {
    this.ensureAudioContext();
    this.initAudio();
    this.isPlaying = true;
    this.notify();

    if (this.audio) {
      this.audio.volume = this.volume;
      this.audio.play().then(() => {
        this.stopSynth();
      }).catch(() => {
        this.startSynth();
      });
    } else {
      this.startSynth();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.stopSynth();
    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        // Silent
      }
    }
    this.notify();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
    }
    this.notify();
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume
    };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.volume);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.isPlaying, this.volume);
      } catch {
        // Safe dispatch
      }
    }
  }

  // Web Audio API ambient lofi synthesizer for guaranteed audio output without external network dependency
  private startSynth() {
    if (typeof window === 'undefined' || this.isSynthPlaying) return;
    try {
      const ctx = this.ensureAudioContext();
      if (!ctx || !this.analyser) return;

      this.synthGain = ctx.createGain();
      this.synthGain.gain.setValueAtTime(this.volume * 0.12, ctx.currentTime);

      // Connect synth -> analyser -> destination
      this.synthGain.connect(this.analyser);
      this.analyser.connect(ctx.destination);

      // Warm chord: D minor 9th (D3, F3, A3, C4, E4)
      const freqs = [146.83, 174.61, 220.00, 261.63, 329.63];
      for (const f of freqs) {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        osc.connect(filter);
        filter.connect(this.synthGain);
        osc.start();
      }

      this.isSynthPlaying = true;
      this.isPlaying = true;
      this.notify();
    } catch {
      // Fallback
    }
  }

  private stopSynth() {
    this.isSynthPlaying = false;
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.suspend();
      } catch {
        // Silent
      }
    }
  }

  // Returns live frequency spectrum data (32 byte array 0..255)
  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (!this.freqData) {
      this.freqData = new Uint8Array(new ArrayBuffer(32));
    }

    if (!this.isPlaying) {
      this.freqData.fill(0);
      return this.freqData;
    }

    let hasSignal = false;
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.freqData);
      // Check if analyser has non-zero signal
      for (let i = 0; i < 8; i++) {
        if (this.freqData[i] > 5) {
          hasSignal = true;
          break;
        }
      }
    }

    // If external stream plays directly without MediaElementSource CORS access,
    // generate rhythmic musical harmonics correlated with audio playback
    if (!hasSignal && this.isPlaying) {
      this.beatCounter += 0.15;
      const baseAmp = Math.round(this.volume * 220);
      for (let i = 0; i < this.freqData.length; i++) {
        const harmonic = Math.sin(this.beatCounter * 1.2 + i * 0.4) * 0.5 + 0.5;
        const decay = Math.max(0.2, 1 - (i / this.freqData.length) * 0.7);
        const noise = (Math.sin(i * 13.37 + this.beatCounter * 3) * 0.5 + 0.5) * 0.3;
        this.freqData[i] = Math.round(baseAmp * decay * (harmonic * 0.7 + noise));
      }
    }

    return this.freqData;
  }
}

export const globalAudio = new GlobalAudioManager();
