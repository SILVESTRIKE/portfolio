/*
Reason for existence: Singleton audio controller orchestrating YouTube IFrame full audio streaming, queue auto-advance, fallback synthesis, AnalyserNode frequency extraction, and state synchronization across WebOS components.
System impact if absent: Music players will fail to play full tracks, auto-advance today's playlist, desynchronize, or fail when audio sources encounter network errors.
*/

import { MusicTrackInfo } from '@/types';
import { DEFAULT_FALLBACK_VIDEO_ID, IRON_MAN_FALLBACK_IDS } from '@/lib/musicOverrides';

type AudioListener = (isPlaying: boolean, volume: number, currentTime: number, duration: number) => void;
type TrackChangeListener = (track: MusicTrackInfo) => void;

interface YTPlayerInstance {
  setVolume: (vol: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: {
      Player: new (elementId: string, options: unknown) => YTPlayerInstance;
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
  private trackChangeListeners: Set<TrackChangeListener> = new Set();
  private currentUrl = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private isSynthPlaying = false;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private smoothBars = new Float32Array(32);

  // Queue Management
  private queue: MusicTrackInfo[] = [];
  private currentQueueIndex = -1;
  private currentTrack: MusicTrackInfo | null = null;

  // YouTube IFrame Player Engine
  private ytPlayer: YTPlayerInstance | null = null;
  private isYtReady = false;
  private isYtPlaying = false;
  private ytWatchdog: ReturnType<typeof setTimeout> | null = null;
  private currentYtVideoId: string | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private fallbackIndex = 0;

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
  public setYouTubeTrack(videoId: string | null, forcePlay = false) {
    if (!videoId) return;

    // Mutually exclusive: stop HTML5 audio and synth whenever targeting YouTube
    if (this.audio && !this.audio.paused) {
      try {
        this.audio.pause();
      } catch {
        // Ignore
      }
    }
    this.stopSynth();

    if (this.currentYtVideoId === videoId && (this.isYtReady || this.isYtPlaying)) {
      if (forcePlay && !this.isPlaying) {
        this.play();
      }
      return;
    }

    this.currentYtVideoId = videoId;
    if (typeof window === 'undefined') return;

    this.ensureYouTubeAPI();
    if (this.isYtReady && this.ytPlayer?.loadVideoById) {
      try {
        if (this.isPlaying || forcePlay) {
          this.ytPlayer.loadVideoById(videoId);
        } else if (this.ytPlayer?.cueVideoById) {
          this.ytPlayer.cueVideoById(videoId);
        }
      } catch {
        // Fallback
      }
    }
  }

  private ensureYouTubeAPI() {
    if (typeof window === 'undefined') return;

    let container = document.getElementById('yt-audio-player-host');
    if (!container) {
      container = document.createElement('div');
      container.id = 'yt-audio-player-host';
      container.style.cssText =
        'position:fixed;bottom:0;right:0;width:200px;height:150px;opacity:0.001;pointer-events:none;z-index:-1;';
      const slot = document.createElement('div');
      slot.id = 'yt-audio-player-slot';
      container.appendChild(slot);
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
        // Script load error
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
    if (this.ytPlayer || !window.YT || !window.YT.Player) return;

    const slot = document.getElementById('yt-audio-player-slot');
    if (!slot) return;

    try {
      this.ytPlayer = new window.YT.Player('yt-audio-player-slot', {
        height: '150',
        width: '200',
        host: 'https://www.youtube.com',
        videoId: this.currentYtVideoId || DEFAULT_FALLBACK_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        },
        events: {
          onReady: (event: { target: YTPlayerInstance }) => {
            this.isYtReady = true;
            try {
              event.target.setVolume(Math.round(this.volume * 100));
            } catch {
              // Ignore volume setup failure
            }
            if (this.isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === window.YT?.PlayerState.PLAYING) {
              this.isYtPlaying = true;
              this.isPlaying = true;
              this.ensureAudioContext();
              if (this.audio && !this.audio.paused) {
                this.audio.pause();
              }
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
              this.stopYtPolling();
              if (this.queue.length > 1) {
                this.playNext();
              } else {
                this.isPlaying = false;
                this.notify();
              }
            }
          },
          onError: () => {
            this.isYtPlaying = false;
            const isIronMan =
              this.currentTrack?.title.toLowerCase().includes('iron man') ||
              this.currentTrack?.artist.toLowerCase().includes('black sabbath');

            if (isIronMan) {
              this.fallbackIndex = (this.fallbackIndex + 1) % IRON_MAN_FALLBACK_IDS.length;
              const nextCandidate = IRON_MAN_FALLBACK_IDS[this.fallbackIndex];
              if (this.currentYtVideoId !== nextCandidate) {
                if (this.currentTrack) {
                  this.currentTrack = {
                    ...this.currentTrack,
                    youtubeVideoId: nextCandidate
                  };
                  this.notifyTrackChange(this.currentTrack);
                }
                this.setYouTubeTrack(nextCandidate, this.isPlaying);
                return;
              }
            }

            if (this.queue.length > 1) {
              this.playNext();
            } else {
              this.fallbackIndex = (this.fallbackIndex + 1) % IRON_MAN_FALLBACK_IDS.length;
              const nextCandidate = IRON_MAN_FALLBACK_IDS[this.fallbackIndex];
              this.setYouTubeTrack(nextCandidate, this.isPlaying);
            }
          }
        }
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
        } catch {
          // Ignore polling errors
        }
      }
    }, 500);
  }

  private stopYtPolling() {
    if (this.ytTimer) {
      clearInterval(this.ytTimer);
      this.ytTimer = null;
    }
  }

  // --- Queue Management ---
  public setQueue(tracks: MusicTrackInfo[], activeTrackId?: string) {
    this.queue = tracks;

    // 1. If currently playing or have an active track, retain its index in the updated queue
    if (this.currentTrack) {
      const idx = tracks.findIndex(
        t =>
          (t.trackId && t.trackId === this.currentTrack?.trackId) ||
          (t.title.toLowerCase() === this.currentTrack?.title.toLowerCase() &&
            t.artist.toLowerCase() === this.currentTrack?.artist.toLowerCase())
      );
      if (idx !== -1) {
        this.currentQueueIndex = idx;
        return;
      }
    }

    // 2. If activeTrackId specified and idle
    if (activeTrackId && !this.isPlaying) {
      const idx = tracks.findIndex(t => t.trackId === activeTrackId);
      if (idx !== -1) {
        this.currentQueueIndex = idx;
        if (!this.currentTrack) {
          this.currentTrack = tracks[idx];
          this.notifyTrackChange(this.currentTrack);
        }
        return;
      }
    }

    // 3. Fallback to first track if idle
    if (this.currentQueueIndex === -1 && tracks.length > 0 && !this.currentTrack) {
      this.currentQueueIndex = 0;
      this.currentTrack = tracks[0];
      this.notifyTrackChange(this.currentTrack);
    }
  }

  public setLiveTrack(track: MusicTrackInfo) {
    if (!this.isPlaying) {
      this.currentTrack = track;
      if (track.youtubeVideoId) {
        this.currentYtVideoId = track.youtubeVideoId;
      }
      this.notifyTrackChange(track);
      this.notify();
    }
  }

  public getQueue(): MusicTrackInfo[] {
    return this.queue;
  }

  public getCurrentTrack(): MusicTrackInfo | null {
    return this.currentTrack;
  }

  public async playIndex(index: number) {
    if (this.queue.length === 0) return;
    const cleanIdx = ((index % this.queue.length) + this.queue.length) % this.queue.length;
    this.currentQueueIndex = cleanIdx;
    const track = this.queue[cleanIdx];
    if (track) {
      await this.playTrack(track);
    }
  }

  public async playTrack(track: MusicTrackInfo) {
    const isSameTrack =
      this.currentTrack &&
      ((track.trackId && this.currentTrack.trackId === track.trackId) ||
        (this.currentTrack.title.toLowerCase() === track.title.toLowerCase() &&
          this.currentTrack.artist.toLowerCase() === track.artist.toLowerCase()));

    // If this exact track is already actively playing, don't restart or double-play
    if (
      this.isPlaying &&
      isSameTrack &&
      (this.isYtPlaying || (this.audio && !this.audio.paused) || this.isSynthPlaying)
    ) {
      return;
    }

    this.currentTrack = track;
    const foundIdx = this.queue.findIndex(
      t =>
        (t.trackId && t.trackId === track.trackId) ||
        (t.title.toLowerCase() === track.title.toLowerCase() &&
          t.artist.toLowerCase() === track.artist.toLowerCase())
    );
    if (foundIdx !== -1) {
      this.currentQueueIndex = foundIdx;
    }

    this.isPlaying = true;
    this.notify();
    this.notifyTrackChange(track);

    let videoId = track.youtubeVideoId;
    if (!videoId) {
      try {
        const res = await fetch(
          `/api/music?artist=${encodeURIComponent(track.artist)}&title=${encodeURIComponent(track.title)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { videoId?: string | null };
          if (data.videoId) {
            videoId = data.videoId;
            track.youtubeVideoId = videoId;
          }
        }
      } catch {
        // Fallback
      }
    }

    if (videoId) {
      this.setYouTubeTrack(videoId, true);
    } else if (track.previewUrl) {
      this.setTrackUrl(track.previewUrl);
    } else {
      this.setYouTubeTrack(DEFAULT_FALLBACK_VIDEO_ID, true);
    }
  }

  public playNext() {
    if (this.queue.length === 0) return;
    const nextIdx = this.currentQueueIndex + 1;
    this.playIndex(nextIdx);
  }

  public playPrev() {
    if (this.queue.length === 0) return;
    const prevIdx = this.currentQueueIndex - 1;
    this.playIndex(prevIdx);
  }

  public setTrackUrl(url: string | null) {
    // When switching to HTML5 audio, pause YouTube and stop synth
    if (this.isYtReady && this.ytPlayer?.pauseVideo) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // Ignore
      }
    }
    this.stopSynth();

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
    // If already actively playing, return immediately to prevent duplicate streams or restarts
    if (this.isPlaying && (this.isYtPlaying || (this.audio && !this.audio.paused) || this.isSynthPlaying)) {
      return;
    }

    this.ensureAudioContext();
    this.isPlaying = true;
    this.notify();

    if (this.currentYtVideoId) {
      this.ensureYouTubeAPI();
      if (this.isYtReady && this.ytPlayer?.playVideo) {
        try {
          this.ytPlayer.playVideo();
        } catch {
          // Ignore player error
        }
      }
      return;
    }

    if (this.currentTrack) {
      this.playTrack(this.currentTrack);
      return;
    }

    this.setYouTubeTrack(DEFAULT_FALLBACK_VIDEO_ID, true);
  }

  public pause() {
    this.isPlaying = false;
    this.stopSynth();

    if (this.isYtReady && this.ytPlayer?.pauseVideo) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        // Ignore
      }
    }

    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        // Ignore
      }
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
      } catch {
        // Fall through
      }
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
      isLive: !Number.isFinite(this.duration) || this.duration === 0
    };
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));

    if (this.isYtReady && this.ytPlayer?.setVolume) {
      try {
        this.ytPlayer.setVolume(Math.round(this.volume * 100));
      } catch {
        // Ignore
      }
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
      volume: this.volume
    };
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.volume, this.currentTime, this.duration);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeTrackChange(listener: TrackChangeListener): () => void {
    this.trackChangeListeners.add(listener);
    if (this.currentTrack) {
      listener(this.currentTrack);
    }
    return () => {
      this.trackChangeListeners.delete(listener);
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

  private notifyTrackChange(track: MusicTrackInfo) {
    for (const listener of this.trackChangeListeners) {
      try {
        listener(track);
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
      const freqs = [146.83, 174.61, 220.0, 261.63, 329.63];
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
      } catch {
        // Ignore
      }
    }
    this.activeOscillators = [];

    if (this.synthGain) {
      try {
        this.synthGain.disconnect();
      } catch {
        // Ignore
      }
      this.synthGain = null;
    }
  }

  // Returns live frequency spectrum data (32 byte array 0..255)
  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (!this.freqData) {
      this.freqData = new Uint8Array(new ArrayBuffer(32));
    }

    if (!this.isPlaying) {
      // Smooth decay to baseline when paused or stopped
      for (let i = 0; i < this.freqData.length; i++) {
        this.smoothBars[i] = Math.max(0, this.smoothBars[i] - 10);
        this.freqData[i] = Math.round(this.smoothBars[i]);
      }
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
      if (hasSignal) {
        // Apply smooth gravity to real analyser signal
        for (let i = 0; i < this.freqData.length; i++) {
          const raw = this.freqData[i];
          if (raw > this.smoothBars[i]) {
            this.smoothBars[i] += (raw - this.smoothBars[i]) * 0.45;
          } else {
            this.smoothBars[i] = Math.max(0, this.smoothBars[i] - 8);
          }
          this.freqData[i] = Math.round(this.smoothBars[i]);
        }
        return this.freqData;
      }
    }

    // Dynamic musical CAVA simulation synchronized with real time (124 BPM standard tempo, 4/4 meter)
    const nowSec = typeof window !== 'undefined' ? performance.now() / 1000 : 0;
    const bpm = 124;
    const beatPeriod = 60 / bpm; // ~0.484s per beat
    const beatPhase = (nowSec % beatPeriod) / beatPeriod; // 0 to 1 within beat
    const barProgress = (nowSec % (beatPeriod * 4)) / (beatPeriod * 4); // 4/4 measure

    // Musical envelopes: Kick on beats 1 & 3, Snare on 2 & 4, Hi-hat on eighth notes
    const isKick = beatPhase < 0.28;
    const kickEnvelope = isKick ? Math.pow(1 - beatPhase / 0.28, 1.8) : 0;
    const snareEnvelope =
      Math.floor(barProgress * 4) % 2 === 1 && beatPhase < 0.35
        ? Math.pow(1 - beatPhase / 0.35, 1.5)
        : 0;
    const hihat = Math.sin(nowSec * Math.PI * (bpm / 30)) * 0.5 + 0.5;

    const baseAmp = this.volume * 210;

    for (let i = 0; i < this.freqData.length; i++) {
      let target = 0;
      if (i < 6) {
        // Sub-bass & Bass (kick drum pulse + smooth low-end resonance)
        const bassHarmonic = Math.sin(nowSec * 3.5 + i * 0.5) * 0.25 + 0.75;
        target = baseAmp * (0.35 + kickEnvelope * 0.65) * bassHarmonic;
      } else if (i < 18) {
        // Mid-range (vocals, rhythm guitars, synths, snare)
        const midHarmonic = Math.sin(nowSec * 5.0 + i * 0.45) * 0.4 + 0.6;
        const midDecay = 1 - ((i - 6) / 12) * 0.35;
        target = baseAmp * (0.3 + snareEnvelope * 0.5) * midHarmonic * midDecay;
      } else {
        // Highs / Treble (hi-hats, cymbals, air shimmer)
        const trebleHarmonic = Math.sin(nowSec * 7.5 + i * 0.3) * 0.35 + 0.65;
        const trebleDecay = Math.max(0.18, 0.75 - ((i - 18) / 14) * 0.55);
        target = baseAmp * (0.2 + hihat * 0.35) * trebleHarmonic * trebleDecay;
      }

      // Smooth attack and realistic CAVA exponential gravity falloff
      if (target > this.smoothBars[i]) {
        this.smoothBars[i] += (target - this.smoothBars[i]) * 0.35; // Fast attack
      } else {
        this.smoothBars[i] = Math.max(0, this.smoothBars[i] - 7); // Smooth falloff
      }

      this.freqData[i] = Math.min(255, Math.max(0, Math.round(this.smoothBars[i])));
    }

    return this.freqData;
  }
}

export const globalAudio = new GlobalAudioManager();
