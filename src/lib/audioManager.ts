/*
Reason for existence: Singleton audio controller orchestrating YouTube IFrame full audio streaming, live background music, Web Audio fallback synthesis, AnalyserNode frequency extraction, and state synchronization across WebOS components.
System impact if absent: Music players will fail to play full tracks, desynchronize, produce audio collisions, or fail when audio sources encounter network errors.
*/

type AudioListener = (isPlaying: boolean, volume: number, currentTime: number, duration: number) => void;

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (elementId: string, options: any) => any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

class GlobalAudioManager {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private volume = 0.7;
  private currentTime = 0;
  private duration = 0;
  private synthTimer: ReturnType<typeof setInterval> | null = null;
  private ytTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<AudioListener> = new Set();
  private currentUrl = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private isSynthPlaying = false;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private beatCounter = 0;

  // YouTube IFrame Player Engine
  private ytPlayer: any = null;
  private isYtReady = false;
  private isYtPlaying = false;
  private ytWatchdog: ReturnType<typeof setTimeout> | null = null;
  private currentYtVideoId: string | null = null;
  private activeOscillators: OscillatorNode[] = [];

  constructor() {
    // Lazy initialization: Audio and YouTube engines load on demand to avoid unsolicited tracking and adblock errors on boot
  }

  private ensureAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

      this.audio.addEventListener('timeupdate', () => {
        if (!this.currentYtVideoId && this.audio) {
          this.currentTime = this.audio.currentTime || 0;
          if (Number.isFinite(this.audio.duration)) {
            this.duration = this.audio.duration;
          }
          this.notify();
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (!this.currentYtVideoId && this.audio && Number.isFinite(this.audio.duration)) {
          this.duration = this.audio.duration;
          this.notify();
        }
      });

      this.audio.addEventListener('pause', () => {
        if (!this.isSynthPlaying && !this.isYtReady) {
          this.isPlaying = false;
          this.notify();
        }
      });

      this.audio.addEventListener('error', () => {
        if (this.isPlaying && !this.currentYtVideoId) {
          this.startSynth();
        }
      });
    } catch {
      // Audio element initialization fallback
    }
  }

  // --- YouTube IFrame Engine ---
  public setYouTubeTrack(videoId: string | null) {
    if (!videoId) return;
    // Guard against redundant re-loading when the same track is fetched repeatedly
    if (this.currentYtVideoId === videoId && (this.isYtReady || this.isYtPlaying)) return;
    this.currentYtVideoId = videoId;
    if (typeof window === 'undefined') return;

    // Only load video if currently playing; otherwise wait until user clicks Play
    if (this.isPlaying) {
      this.ensureYouTubeAPI();
      if (this.isYtReady && this.ytPlayer?.loadVideoById) {
        try {
          this.ytPlayer.loadVideoById(videoId);
          if (this.audio && !this.audio.paused) {
            this.audio.pause();
          }
          this.stopSynth();
        } catch {
          // Fallback
        }
      }
    }
  }

  private ensureYouTubeAPI() {
    if (typeof window === 'undefined') return;

    let container = document.getElementById('yt-audio-player-host');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-player-host';
      // Keep in viewport with microscopic opacity so Chromium allocates video rendering compositor without "No available adapters"
      container.style.cssText =
        'position:fixed;bottom:0;right:0;width:200px;height:150px;opacity:0.001;pointer-events:none;z-index:-1;';
      document.body.appendChild(container);
    }

    if (window.YT && window.YT.Player) {
      this.initYouTubePlayer();
      return;
    }

    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => {
        // Fallback gracefully if AdBlock blocks youtube iframe script
        if (this.isPlaying) {
          this.initAudio();
          this.audio?.play().catch(() => this.startSynth());
        }
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.initYouTubePlayer();
      };
    }
  }

  private initYouTubePlayer() {
    if (this.ytPlayer || !window.YT || !this.currentYtVideoId) return;

    try {
      this.ytPlayer = new window.YT.Player('yt-audio-player-host', {
        height: '150',
        width: '200',
        host: 'https://www.youtube-nocookie.com',
        videoId: this.currentYtVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
        },
        events: {
          onReady: (event: any) => {
            this.isYtReady = true;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch {}
            if (this.isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT?.PlayerState.PLAYING) {
              if (this.ytWatchdog) {
                clearTimeout(this.ytWatchdog);
                this.ytWatchdog = null;
              }
              this.isYtPlaying = true;
              this.isPlaying = true;
              this.ensureAudioContext();
              if (this.audio && !this.audio.paused) {
                this.audio.pause();
              }
              // Prevent audio collision: stop fallback synth if it was running
              this.stopSynth();
              this.startYtPolling();
              this.notify();
            } else if (event.data === window.YT?.PlayerState.PAUSED) {
              this.isYtPlaying = false;
              this.isPlaying = false;
              this.stopYtPolling();
              this.notify();
            } else if (event.data === window.YT?.PlayerState.ENDED) {
              this.isYtPlaying = false;
              this.isPlaying = false;
              this.stopYtPolling();
              this.notify();
            }
          },
          onError: () => {
            // When AdBlock, embed restrictions, or network blocks YouTube, fallback to HTML5 audio/synth
            this.isYtReady = false;
            this.isYtPlaying = false;
            // Clear unplayable videoId so future plays do not repeat the failing cycle
            this.currentYtVideoId = null;
            if (this.ytWatchdog) {
              clearTimeout(this.ytWatchdog);
              this.ytWatchdog = null;
            }
            if (this.isPlaying) {
              this.initAudio();
              this.audio?.play().catch(() => this.startSynth());
            }
          },
        },
      });
    } catch {
      // Fallback
    }
  }

  private startYtPolling() {
    if (this.ytTimer) return;
    this.ytTimer = setInterval(() => {
      if (this.ytPlayer && this.isYtReady) {
        try {
          const cur = this.ytPlayer.getCurrentTime();
          const dur = this.ytPlayer.getDuration();
          if (typeof cur === 'number') this.currentTime = cur;
          if (typeof dur === 'number' && dur > 0) this.duration = dur;
          this.notify();
        } catch {}
      }
    }, 500);
  }

  private stopYtPolling() {
    if (this.ytTimer) {
      clearInterval(this.ytTimer);
      this.ytTimer = null;
    }
  }

  public setTrackUrl(url: string | null) {
    const nextUrl = url && url.startsWith('http') ? url : 'https://stream.zeno.fm/f3wvbbqmdg8uv';
    if (this.currentUrl !== nextUrl) {
      this.currentUrl = nextUrl;
      if (this.audio) {
        const wasPlaying = this.isPlaying && !this.currentYtVideoId;
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
    this.isPlaying = true;
    this.notify();

    // Prefer YouTube full audio
    if (this.currentYtVideoId) {
      this.ensureYouTubeAPI();
      if (this.isYtReady && this.ytPlayer?.playVideo) {
        try {
          this.ytPlayer.playVideo();
        } catch {}
      }

      // Arm watchdog: if YouTube is blocked by client adblock or doesn't reach PLAYING in 1.2s, auto fallback to HTML5 stream
      if (this.ytWatchdog) clearTimeout(this.ytWatchdog);
      this.ytWatchdog = setTimeout(() => {
        if (this.isPlaying && !this.isYtPlaying) {
          this.initAudio();
          this.audio?.play().catch(() => this.startSynth());
        }
      }, 1200);
      return;
    }

    this.initAudio();
    if (this.audio) {
      this.audio.volume = this.volume;
      this.audio
        .play()
        .then(() => {
          this.stopSynth();
        })
        .catch(() => {
          this.startSynth();
        });
    } else {
      this.startSynth();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.isYtPlaying = false;
    if (this.ytWatchdog) {
      clearTimeout(this.ytWatchdog);
      this.ytWatchdog = null;
    }
    this.stopSynth();
    this.stopYtPolling();

    if (this.isYtReady && this.ytPlayer?.pauseVideo) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    }

    if (this.audio) {
      try {
        this.audio.pause();
      } catch {}
    }
    this.notify();
  }

  public seek(seconds: number) {
    if (this.currentYtVideoId && this.isYtReady && this.ytPlayer?.seekTo) {
      try {
        this.ytPlayer.seekTo(seconds, true);
        this.currentTime = seconds;
        this.notify();
        return;
      } catch {}
    }

    if (this.audio && Number.isFinite(this.audio.duration) && this.audio.duration > 0) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
      this.currentTime = this.audio.currentTime;
      this.notify();
    }
  }

  public getTime() {
    return {
      currentTime: this.currentTime,
      duration: this.duration,
      isLive: !Number.isFinite(this.duration) || this.duration === 0,
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));

    if (this.isYtReady && this.ytPlayer?.setVolume) {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
      } catch {}
    }

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
      volume: this.volume,
    };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.volume, this.currentTime, this.duration);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.isPlaying, this.volume, this.currentTime, this.duration);
      } catch {
        // Safe dispatch
      }
    }
  }

  // Web Audio API ambient lofi synthesizer for guaranteed audio output without external network dependency
  private startSynth() {
    if (typeof window === 'undefined' || this.isSynthPlaying) return;
    try {
      this.stopSynth();
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
        this.activeOscillators.push(osc);
      }

      this.isSynthPlaying = true;
      this.isPlaying = true;
      if (!this.synthTimer) {
        this.synthTimer = setInterval(() => {
          this.currentTime += 1;
          this.notify();
        }, 1000);
      }
      this.notify();
    } catch {
      // Fallback
    }
  }

  private stopSynth() {
    this.isSynthPlaying = false;
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    for (const osc of this.activeOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeOscillators = [];

    if (this.synthGain) {
      try {
        this.synthGain.disconnect();
      } catch {}
      this.synthGain = null;
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
      for (let i = 0; i < 8; i++) {
        if (this.freqData[i] > 5) {
          hasSignal = true;
          break;
        }
      }
    }

    // Dynamic musical harmonics for visualizer when playing iframe stream
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
