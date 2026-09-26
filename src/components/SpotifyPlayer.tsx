/*
Reason for existence: Spotify & Last.fm live music player component presenting landscape horizontal deck layout, audio streaming engine, and animated spectrum visualizer.
System impact if absent: Desktop and window panes cannot render horizontal music player or stream audio previews.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SpotifyTrackInfo } from '@/types';
import { globalAudio } from '@/lib/audioManager';

interface SpotifyPlayerProps {
  mode?: 'panel' | 'full' | 'flyout';
  onOpenFullPlayer?: () => void;
  onClose?: () => void;
}

export function SpotifyPlayer({ mode = 'panel', onOpenFullPlayer, onClose }: SpotifyPlayerProps) {
  const [track, setTrack] = useState<SpotifyTrackInfo | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Subscribe to synchronized global audio engine
  useEffect(() => {
    const unsub = globalAudio.subscribe((playing, vol, curTime, dur) => {
      setIsPlayingAudio(playing);
      setVolume(vol);
      if (typeof curTime === 'number') setCurrentTime(curTime);
      if (typeof dur === 'number') setDuration(dur);
    });
    return unsub;
  }, []);

  // Real Web Audio frequency spectrum canvas rendering loop (runs in full and flyout modes)
  useEffect(() => {
    if (mode === 'panel') return;
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width = canvas.parentElement.clientWidth;
          const height = canvas.height = canvas.parentElement.clientHeight;

          ctx.clearRect(0, 0, width, height);

          const freqData = globalAudio.getFrequencyData();
          const numBars = mode === 'flyout' ? 16 : 24;
          const gap = 3;
          const barWidth = Math.max(2, (width - (numBars - 1) * gap) / numBars);

          for (let i = 0; i < numBars; i++) {
            const raw = freqData[i] || 0;
            const normalized = raw / 255;
            const barHeight = isPlayingAudio ? Math.max(3, normalized * (height - 2)) : 2;
            const x = i * (barWidth + gap);
            const y = height - barHeight;

            const grad = ctx.createLinearGradient(0, height, 0, 0);
            grad.addColorStop(0, 'rgba(29, 185, 84, 0.35)');
            grad.addColorStop(1, isPlayingAudio ? '#1db954' : 'rgba(255, 255, 255, 0.15)');

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, isPlayingAudio]);

  const fetchTrack = async () => {
    try {
      const res = await fetch('/api/spotify');
      if (res.ok) {
        const data = (await res.json()) as SpotifyTrackInfo;
        setTrack(data);
        if (data.youtubeVideoId) {
          globalAudio.setYouTubeTrack(data.youtubeVideoId);
        } else if (data.previewUrl) {
          globalAudio.setTrackUrl(data.previewUrl);
        }
      }
    } catch {
      // Network silent fail
    }
  };

  useEffect(() => {
    fetchTrack();
    const interval = setInterval(fetchTrack, 10000);
    return () => clearInterval(interval);
  }, []);

  const togglePlayback = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    globalAudio.toggle();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    globalAudio.setVolume(val);
  };

  // Compact TopPanel View
  if (mode === 'panel') {
    return (
      <div
        onClick={onOpenFullPlayer}
        className="flex items-center gap-1 sm:gap-2 bg-[#1db954]/10 hover:bg-[#1db954]/15 border border-[#1db954]/30 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-xs font-mono select-none sm:max-w-[200px] md:max-w-[240px] shrink-0 cursor-pointer transition-colors"
        title="Click to open Music Player in Special Workspace (Alt+S)"
      >
        <span className="text-[#1db954] text-[10px] sm:hidden">♫</span>

        <div className="hidden sm:flex items-end gap-0.5 h-3 shrink-0">
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-3 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-1.5'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-2'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-1.5'}`} />
        </div>

        <div className="hidden sm:flex items-center gap-1 text-slate-200 hover:text-white min-w-0 flex-1 truncate text-left">
          <span className="text-[#1db954] font-bold text-[10px] shrink-0">MUSIC:</span>
          <span className="truncate text-[10px] sm:text-[11px]">{track?.title || 'Starboy'}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayback(e);
          }}
          className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${isPlayingAudio
            ? 'bg-[#1db954] text-black shadow-[0_0_10px_#1db954]'
            : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          title={isPlayingAudio ? 'Pause live stream' : 'Listen with me (Audio stream)'}
        >
          {isPlayingAudio ? 'PAUSE' : 'PLAY'}
        </button>
      </div>
    );
  }

  // Floating Popover Flyout Deck (Shown when clicking TopPanel music pill)
  if (mode === 'flyout') {
    return (
      <div className="w-[320px] sm:w-[360px] bg-[#0c101a]/95 border border-emerald-500/30 rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col gap-3 font-sans select-none text-xs relative overflow-hidden ring-1 ring-white/10">
        {/* Ambient glow */}
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#1db954]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Flyout Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
            <span className="text-[#1db954] font-mono font-bold text-[10px] tracking-wider uppercase">
              {track?.isPlaying ? 'LIVE ON SPOTIFY' : 'SPOTIFY & YOUTUBE'}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px]">
            {onOpenFullPlayer && (
              <button
                type="button"
                onClick={onOpenFullPlayer}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                title="Expand to workspace pane"
              >
                [+] PANE
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-5 h-5 flex items-center justify-center rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer font-bold"
                title="Close flyout"
              >
                [x]
              </button>
            )}
          </div>
        </div>

        {/* Track Info Card */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/15 shrink-0 shadow-md">
            {track?.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.albumArt}
                alt={track.album}
                className={`w-full h-full object-cover transition-transform duration-500 ${isPlayingAudio ? 'scale-105' : 'scale-100'
                  }`}
              />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center font-mono text-slate-500 text-[9px]">
                No Art
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-black/80 px-1 py-0.2 rounded-tl text-[8px] font-mono text-slate-400">
              320K
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-white truncate leading-tight">
              {track?.title || 'Starboy'}
            </h4>
            <p className="text-slate-300 text-xs truncate mt-0.5">
              {track?.artist || 'The Weeknd'}
            </p>
            <p className="text-slate-500 text-[10px] truncate mt-0.5 font-mono">
              {track?.album || 'Starboy'}
            </p>
          </div>
        </div>

        {/* Real Audio Spectrum Canvas */}
        <div className="h-6 w-full bg-white/[0.03] px-1 py-0.5 rounded border border-white/5 overflow-hidden flex items-center relative z-10">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Controls & Volume */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/10 relative z-10">
          <button
            type="button"
            onClick={togglePlayback}
            className={`flex-1 py-1.5 px-3 rounded-lg font-bold font-mono text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${isPlayingAudio
              ? 'bg-[#1db954] text-black shadow-[0_0_15px_rgba(29,185,84,0.4)]'
              : 'bg-white text-black hover:bg-slate-200'
              }`}
          >
            <span>{isPlayingAudio ? 'PAUSE AUDIO' : 'PLAY AUDIO'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1.5 rounded-lg border border-white/10 font-mono text-[10px] text-slate-300">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 accent-[#1db954] cursor-pointer h-1"
            />
            <span className="w-7 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* External Links */}
        <div className="flex items-center gap-1.5 w-full relative z-10">
          {track?.youtubeVideoId && (
            <a
              href={`https://www.youtube.com/watch?v=${track.youtubeVideoId}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 hover:text-white py-1 px-2 rounded-lg font-mono text-[10px] transition-colors truncate"
            >
              YouTube
            </a>
          )}
          {track?.songUrl && (
            <a
              href={track.songUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white py-1 px-2 rounded-lg font-mono text-[10px] transition-colors truncate"
            >
              Spotify
            </a>
          )}
        </div>
      </div>
    );
  }

  // Full Mode: Rich Full-Screen Media Station (Fills pane beautifully, never cramped)
  return (
    <div className="h-full w-full p-4 sm:p-6 md:p-10 flex flex-col justify-between font-mono bg-[#070a12] select-none text-xs overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center gap-6 my-auto">
        {/* Main Music Deck Card */}
        <div className="w-full bg-[#0c101a]/95 border border-emerald-500/25 rounded-2xl p-5 sm:p-7 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/10 relative overflow-hidden flex flex-col gap-6">
          {/* Ambient dynamic glow */}
          <div className="absolute -left-20 -top-20 w-72 h-72 bg-[#1db954]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-[#3b82f6]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1db954] animate-pulse shadow-[0_0_10px_#1db954]" />
              <span className="text-[#1db954] font-bold text-xs tracking-wider uppercase">
                {track?.isPlaying ? 'LIVE ON SPOTIFY' : 'SPOTIFY & YOUTUBE'}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                LOSSLESS AUDIO STREAM
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                320 KBPS
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                SPECIAL:MUSIC
              </span>
            </div>
          </div>

          {/* Main Hero: Large Album Art + Track Details */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 relative z-10">
            {/* Album Cover Art */}
            <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/20 shrink-0 group">
              {track?.albumArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.albumArt}
                  alt={track.album}
                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlayingAudio ? 'scale-105' : 'scale-100'
                    }`}
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
                  No Artwork
                </div>
              )}

              <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-bold text-[#1db954] border border-[#1db954]/40 backdrop-blur-md">
                {track?.isPlaying ? 'LIVE' : 'SCROBBLED'}
              </div>
            </div>

            {/* Track Info & Visualizer Deck */}
            <div className="flex-1 w-full min-w-0 flex flex-col justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight">
                  {track?.title || 'Starboy'}
                </h2>
                <p className="text-emerald-400 font-semibold text-sm sm:text-base mt-1">
                  {track?.artist || 'The Weeknd'}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {track?.album || 'Starboy'}
                </p>
              </div>

              {/* Real Audio Spectrum Canvas */}
              <div className="h-12 sm:h-14 w-full bg-white/[0.03] px-2 py-1 rounded-xl border border-white/10 overflow-hidden flex items-center">
                <canvas ref={canvasRef} className="w-full h-full" />
              </div>

              {/* Full-width Interactive Seek Bar */}
              <div className="w-full flex items-center gap-3 text-xs text-slate-400">
                <span className="w-10 shrink-0">{formatTime(currentTime)}</span>
                <div
                  onClick={(e) => {
                    if (duration > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      globalAudio.seek(pct * duration);
                    }
                  }}
                  className={`flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative group/bar ${duration > 0 ? 'cursor-pointer hover:bg-white/20' : ''
                    }`}
                  title={duration > 0 ? 'Click to seek' : 'Audio progress'}
                >
                  <div
                    className="h-full bg-[#1db954] rounded-full transition-all duration-200 shadow-[0_0_12px_#1db954]"
                    style={{
                      width: duration > 0
                        ? `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%`
                        : isPlayingAudio
                          ? `${((currentTime % 30) / 30) * 100}%`
                          : '0%'
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right">
                  {duration > 0 ? formatTime(duration) : (isPlayingAudio ? 'LIVE' : '00:00')}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/10 relative z-10 flex-wrap">
            {/* Play/Pause Button & External Links */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className={`py-2 px-5 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 ${isPlayingAudio
                  ? 'bg-[#1db954] hover:bg-[#1ed760] text-black shadow-[0_0_20px_rgba(29,185,84,0.5)]'
                  : 'bg-white hover:bg-slate-200 text-black shadow-lg'
                  }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  {isPlayingAudio ? (
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  ) : (
                    <path d="M8 5v14l11-7z" />
                  )}
                </svg>
                <span>{isPlayingAudio ? 'PAUSE AUDIO' : 'PLAY AUDIO'}</span>
              </button>

              {/* YouTube Link */}
              {track?.youtubeVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${track.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-300 hover:text-white text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  title="Watch video on YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>
              )}

              {/* Spotify Link */}
              {track?.songUrl && (
                <a
                  href={track.songUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-full bg-[#1db954]/10 hover:bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] hover:text-white text-xs transition-colors flex items-center gap-1.5 shrink-0"
                  title="Open track on Spotify"
                >
                  <span>♫</span>
                  <span>Spotify</span>
                </a>
              )}
            </div>

            {/* Volume Pill Container */}
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 shrink-0">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 min-[380px]:w-24 accent-[#1db954] cursor-pointer h-1.5"
              />
              <span className="shrink-0 w-8 text-right font-semibold text-slate-200">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Telemetry Card */}
        <div className="w-full bg-[#0c101a]/70 border border-white/5 rounded-xl p-4 text-xs font-mono text-slate-400 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-base shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-slate-200 font-bold text-xs">Decoupled Audio Pipeline</div>
              <div className="text-slate-500 text-[11px]">Continuous lossless audio stream via YouTube IFrame & Spotify resolver</div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-[11px]">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
              STATUS: <span className="text-emerald-400 font-bold">{isPlayingAudio ? 'STREAMING' : 'READY'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
