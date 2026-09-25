/*
Reason for existence: Spotify & Last.fm live music player component presenting landscape horizontal deck layout, audio streaming engine, and animated spectrum visualizer.
System impact if absent: Desktop and window panes cannot render horizontal music player or stream audio previews.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SpotifyTrackInfo } from '@/types';
import { globalAudio } from '@/lib/audioManager';

interface SpotifyPlayerProps {
  mode?: 'panel' | 'full';
  onOpenFullPlayer?: () => void;
}

export function SpotifyPlayer({ mode = 'panel', onOpenFullPlayer }: SpotifyPlayerProps) {
  const [track, setTrack] = useState<SpotifyTrackInfo | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subscribe to synchronized global audio engine
  useEffect(() => {
    const unsub = globalAudio.subscribe((playing, vol) => {
      setIsPlayingAudio(playing);
      setVolume(vol);
    });
    return unsub;
  }, []);

  // Real Web Audio frequency spectrum canvas rendering loop
  useEffect(() => {
    if (mode !== 'full') return;
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
          const numBars = 24;
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
        if (data.previewUrl) {
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
      <div className="flex items-center gap-2 bg-[#1db954]/10 border border-[#1db954]/30 px-2.5 py-1 rounded text-xs font-mono select-none">
        <span className="w-2 h-2 rounded-full bg-[#1db954] shadow-[0_0_8px_#1db954] animate-pulse" />

        <div className="flex items-end gap-0.5 h-3">
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-3 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-1.5'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-2'}`} />
          <span className={`w-0.5 bg-[#1db954] rounded-full transition-all ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-1'}`} />
        </div>

        <div
          onClick={onOpenFullPlayer}
          className="flex items-center gap-1.5 text-slate-200 cursor-pointer hover:text-white max-w-[180px] truncate"
          title="Click to expand horizontal music deck"
        >
          <span className="text-[#1db954] font-bold text-[10px]">MUSIC:</span>
          <span className="truncate text-[11px]">{track?.title || 'Starboy (Live Stream)'}</span>
        </div>

        <button
          type="button"
          onClick={togglePlayback}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#1db954] text-black shadow-[0_0_10px_#1db954]'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
          title={isPlayingAudio ? 'Pause live stream' : 'Listen with me (Audio stream)'}
        >
          {isPlayingAudio ? 'PLAYING' : 'LISTEN'}
        </button>
      </div>
    );
  }

  // Full Horizontal Landscape Layout ("nằm ngang")
  return (
    <div className="h-full w-full p-4 md:p-6 flex items-center justify-center font-sans bg-[#0a0d14] select-none text-xs overflow-auto">
      <div className="max-w-4xl w-full bg-[#111724]/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 backdrop-blur-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-[#1db954]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left: Album Artwork with neon border & pulse */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(29,185,84,0.2)] border border-white/15 shrink-0 group">
          {track?.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumArt}
              alt={track.album}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlayingAudio ? 'scale-105' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center font-mono text-slate-500">
              No Album Art
            </div>
          )}

          <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-[#1db954] flex items-center gap-1.5 border border-[#1db954]/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1db954] animate-ping" />
            <span>{track?.isPlaying ? 'LIVE' : 'SCROBBLED'}</span>
          </div>

          <div className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 border border-white/10">
            320 KBPS
          </div>
        </div>

        {/* Center: Track Metadata, Visualizer & Progress */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between gap-3">
          {/* Header pill & Source info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#1db954]/15 text-[#1db954] font-mono font-semibold text-[10px] border border-[#1db954]/30">
              LIVE AUDIO FEED
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              Spotify & Last.fm Telemetry Hub
            </span>
          </div>

          {/* Title & Artist */}
          <div className="min-w-0">
            <h2 className="font-bold text-base md:text-lg text-white truncate tracking-tight">
              {track?.title || 'Starboy (Live Radio Stream)'}
            </h2>
            <p className="text-slate-300 font-medium text-xs md:text-sm truncate mt-0.5">
              {track?.artist || 'The Weeknd, Daft Punk'}
            </p>
            <p className="text-slate-500 font-mono text-[11px] truncate mt-0.5">
              Album: {track?.album || 'Starboy'}
            </p>
          </div>

          {/* Real Web Audio Frequency Spectrum Canvas Visualizer */}
          <div className="h-7 w-full bg-white/[0.02] px-2 py-0.5 rounded-lg border border-white/5 overflow-hidden flex items-center">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Progress bar */}
          <div className="w-full flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span>00:45</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1db954] rounded-full transition-all"
                style={{ width: isPlayingAudio ? '48%' : '20%' }}
              />
            </div>
            <span>03:50</span>
          </div>
        </div>

        {/* Right: Controls, Volume & Quick Links */}
        <div className="flex flex-row md:flex-col items-center justify-center gap-3 shrink-0 w-full md:w-56 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-5">
          <button
            type="button"
            onClick={togglePlayback}
            className={`w-full py-2.5 px-4 rounded-xl font-bold font-mono text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isPlayingAudio
                ? 'bg-[#1db954] text-black shadow-[0_0_20px_rgba(29,185,84,0.5)]'
                : 'bg-white text-black hover:bg-slate-200 shadow-md'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              {isPlayingAudio ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            <span>{isPlayingAudio ? 'PAUSE AUDIO' : 'PLAY AUDIO'}</span>
          </button>

          {track?.songUrl && (
            <a
              href={track.songUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 py-2 px-3 rounded-xl font-mono text-[11px] transition-colors truncate"
            >
              Open Track Page
            </a>
          )}

          {/* Volume control */}
          <div className="w-full flex items-center gap-2 font-mono text-[11px] text-slate-300 bg-white/[0.04] px-3 py-2 rounded-xl border border-white/10">
            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 accent-[#1db954] cursor-pointer h-1.5"
            />
            <span className="shrink-0 min-w-[38px] text-right font-semibold text-slate-200">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
