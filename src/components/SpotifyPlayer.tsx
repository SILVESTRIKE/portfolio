/*
Reason for existence: Caelestia/Terminal style music player widget supporting live Last.fm scrobble telemetry, today's playlist history, YouTube audio playback, and responsive visualizers.
System impact if absent: Desktop status panel and workspace panes cannot display now-playing telemetry or stream music.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MusicTelemetryResponse, MusicTrackInfo } from '@/types';
import { globalAudio } from '@/lib/audioManager';

interface SpotifyPlayerProps {
  mode?: 'panel' | 'full' | 'flyout';
  onOpenFullPlayer?: () => void;
  onClose?: () => void;
}

const STORAGE_KEY_LAST_TELEMETRY = 'silvestrike_music_telemetry_cache';

let sharedTelemetry: MusicTelemetryResponse | null = null;
const sharedListeners = new Set<(data: MusicTelemetryResponse | null) => void>();
let pollingTimer: ReturnType<typeof setInterval> | null = null;
let activeMountCount = 0;

async function syncMusicTelemetry() {
  if (typeof document !== 'undefined' && document.hidden) {
    return;
  }

  try {
    const res = await fetch('/api/music');
    if (res.ok) {
      const data = (await res.json()) as MusicTelemetryResponse;
      if (data && data.current) {
        const prevTrack = sharedTelemetry?.current;
        const trackChanged =
          !prevTrack ||
          prevTrack.title !== data.current.title ||
          prevTrack.artist !== data.current.artist;

        sharedTelemetry = data;
        try {
          localStorage.setItem(STORAGE_KEY_LAST_TELEMETRY, JSON.stringify(data));
        } catch {
          // Ignore localStorage errors
        }

        sharedListeners.forEach(fn => fn(data));

        // Update audio queue with today's tracks
        if (data.today && data.today.length > 0) {
          globalAudio.setQueue(data.today, data.current.trackId);
        }

        // Synchronize live telemetry to globalAudio when idle
        globalAudio.setLiveTrack(data.current);
      }
    }
  } catch {
    // Fail silently
  }
}

function useMusicTelemetry(): MusicTelemetryResponse | null {
  const [telemetry, setTelemetry] = useState<MusicTelemetryResponse | null>(null);

  useEffect(() => {
    if (!sharedTelemetry) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_LAST_TELEMETRY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.current) {
            sharedTelemetry = parsed;
            setTelemetry(parsed);
          }
        }
      } catch {
        // Ignore localStorage error
      }
    } else {
      setTelemetry(sharedTelemetry);
    }

    sharedListeners.add(setTelemetry);
    activeMountCount++;

    if (activeMountCount === 1) {
      syncMusicTelemetry();
      pollingTimer = setInterval(syncMusicTelemetry, 25000);
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncMusicTelemetry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      sharedListeners.delete(setTelemetry);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activeMountCount--;
      if (activeMountCount <= 0) {
        activeMountCount = 0;
        if (pollingTimer) {
          clearInterval(pollingTimer);
          pollingTimer = null;
        }
      }
    };
  }, []);

  return telemetry;
}

export function SpotifyPlayer({ mode = 'panel', onOpenFullPlayer, onClose }: SpotifyPlayerProps) {
  const telemetry = useMusicTelemetry();
  const [currentTrack, setCurrentTrack] = useState<MusicTrackInfo | null>(
    () => globalAudio.getCurrentTrack() || telemetry?.current || null
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showFlyout, setShowFlyout] = useState(false);

  // Sync track when telemetry loads and no track is active yet
  useEffect(() => {
    if (!currentTrack && telemetry?.current) {
      setCurrentTrack(telemetry.current);
    }
  }, [telemetry, currentTrack]);

  // Subscribe to audio state
  useEffect(() => {
    const unsubAudio = globalAudio.subscribe((playing, vol, curTime, dur) => {
      setIsPlayingAudio(playing);
      setVolume(vol);
      if (typeof curTime === 'number') setCurrentTime(curTime);
      if (typeof dur === 'number') setDuration(dur);
    });

    const unsubTrack = globalAudio.subscribeTrackChange(track => {
      setCurrentTrack(track);
    });

    return () => {
      unsubAudio();
      unsubTrack();
    };
  }, []);

  // Visualizer canvas loop for flyout and full modes
  useEffect(() => {
    if (mode === 'panel') return;
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = (canvas.width = canvas.parentElement.clientWidth);
          const height = (canvas.height = canvas.parentElement.clientHeight);

          ctx.clearRect(0, 0, width, height);

          const freqData = globalAudio.getFrequencyData();
          const numBars = mode === 'flyout' ? 16 : 32;
          const gap = 3;
          const barWidth = Math.max(2, (width - (numBars - 1) * gap) / numBars);

          for (let i = 0; i < numBars; i++) {
            const raw = freqData[i] || 0;
            const normalized = raw / 255;
            const barHeight = isPlayingAudio ? Math.max(3, normalized * (height - 2)) : 2;

            const grad = ctx.createLinearGradient(0, height, 0, 0);
            grad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            grad.addColorStop(0.7, 'rgba(52, 211, 153, 0.9)');
            grad.addColorStop(1, 'rgba(125, 211, 252, 1)');

            ctx.fillStyle = grad;
            ctx.fillRect(
              i * (barWidth + gap),
              height - barHeight,
              barWidth,
              barHeight
            );
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, isPlayingAudio]);

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (isPlayingAudio) {
      globalAudio.pause();
    } else {
      if (globalAudio.getCurrentTrack()) {
        globalAudio.play();
      } else if (currentTrack) {
        globalAudio.playTrack(currentTrack);
      } else if (telemetry?.current) {
        globalAudio.playTrack(telemetry.current);
      } else {
        globalAudio.play();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    globalAudio.seek(pos * duration);
  };

  const isNowPlayingLive = currentTrack?.isPlaying ?? false;
  const relativeTimeLabel = currentTrack?.relativeTime || (isNowPlayingLive ? 'now playing' : 'recently');
  const todayList = telemetry?.today || [];

  // ==========================================
  // MODE 1: PANEL (TopPanel & Dock Status Pill)
  // ==========================================
  if (mode === 'panel') {
    return (
      <div className="relative">
        <div
          onClick={() => setShowFlyout(!showFlyout)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded border font-mono text-[11px] cursor-pointer transition-all ${
            isPlayingAudio
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-black/50 border-white/10 text-slate-300 hover:border-emerald-500/30 hover:text-white'
          }`}
          title="Click to toggle music widget HUD"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isPlayingAudio
                ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'
                : isNowPlayingLive
                ? 'bg-emerald-500'
                : 'bg-amber-400/80'
            }`}
          />

          <span className="font-semibold text-slate-400 text-[10px]">
            {isPlayingAudio ? '[PLAYING]' : isNowPlayingLive ? '[LIVE]' : '[IDLE]'}
          </span>

          <span className="max-w-[140px] sm:max-w-[190px] truncate text-slate-200">
            {currentTrack?.title || 'Iron Man'} - {currentTrack?.artist || 'Black Sabbath'}
          </span>

          <span className="text-[10px] text-emerald-400/80 font-mono hidden md:inline">
            {isPlayingAudio ? '||||' : '..'}
          </span>
        </div>

        {/* Panel Dropdown Flyout */}
        {showFlyout && (
          <div className="absolute right-0 top-full mt-2 w-80 z-50">
            <SpotifyPlayer
              mode="flyout"
              onOpenFullPlayer={() => {
                setShowFlyout(false);
                onOpenFullPlayer?.();
              }}
              onClose={() => setShowFlyout(false)}
            />
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // MODE 2: FLYOUT (Corner HUD Card)
  // ==========================================
  if (mode === 'flyout') {
    return (
      <div className="w-80 bg-[#090d16]/95 border border-emerald-500/30 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl font-mono text-xs flex flex-col gap-3 select-none relative overflow-hidden ring-1 ring-white/10">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-emerald-400 font-bold uppercase">
              {isNowPlayingLive ? 'LAST.FM LIVE' : 'STATION IDLE'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenFullPlayer && (
              <button
                type="button"
                onClick={onOpenFullPlayer}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Expand to Full Player"
              >
                [+] PANE
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors font-bold"
                title="Close"
              >
                [x]
              </button>
            )}
          </div>
        </div>

        {/* Track Details */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/15 shrink-0 bg-black">
            {currentTrack?.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform ${
                  isPlayingAudio ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                NO ART
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-xs truncate">
              {currentTrack?.title || 'Iron Man'}
            </h4>
            <p className="text-slate-300 text-[11px] truncate mt-0.5">
              {currentTrack?.artist || 'Black Sabbath'}
            </p>
            <p className="text-slate-500 text-[9px] truncate mt-0.5">
              {relativeTimeLabel}
            </p>
          </div>
        </div>

        {/* Cava Visualizer */}
        <div className="h-6 w-full bg-black/40 rounded border border-white/5 overflow-hidden flex items-center px-1">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() => globalAudio.playPrev()}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] font-bold"
            title="Previous track"
          >
            [|&lt;]
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex-1 py-1 px-2 rounded font-bold text-[10px] transition-all flex items-center justify-center ${
              isPlayingAudio
                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-white text-black hover:bg-slate-200'
            }`}
          >
            {isPlayingAudio ? '[PAUSE]' : '[PLAY AUDIO]'}
          </button>

          <button
            type="button"
            onClick={() => globalAudio.playNext()}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 text-[10px] font-bold"
            title="Next track"
          >
            [&gt;|]
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODE 3: FULL (Maximized Workspace Station)
  // ==========================================
  return (
    <div className="h-full w-full p-3 sm:p-5 md:p-6 flex flex-col justify-between font-mono bg-[#060911] text-slate-200 select-none overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col gap-4">
        {/* Terminal Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">root@srv-silvestrike:~$</span>
            <span className="text-slate-300">cava-player --scrobbler=lastfm</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span
              className={`px-2 py-0.5 rounded border ${
                isNowPlayingLive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              {isNowPlayingLive ? 'LIVE SCROBBLING' : 'IDLE / RECENT'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
              TIMEZONE: VN (UTC+7)
            </span>
          </div>
        </div>

        {/* Main Content: Hero Deck (Left) + Today Scrobbles Queue (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Player Deck */}
          <div className="lg:col-span-7 bg-[#0b101c]/90 border border-emerald-500/30 rounded-xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Album Art with CRT Glow */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden shadow-2xl border border-white/20 shrink-0 bg-black group">
                {currentTrack?.albumArt ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentTrack.albumArt}
                    alt={currentTrack.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isPlayingAudio ? 'scale-105' : 'scale-100'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                    NO ARTWORK
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-black/85 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                  {isPlayingAudio ? 'AUDIO ON' : 'STANDBY'}
                </div>
              </div>

              {/* Track Metadata */}
              <div className="flex-1 min-w-0 text-center sm:text-left flex flex-col justify-center">
                <span className="text-[10px] text-emerald-400 tracking-wider font-semibold uppercase">
                  {currentTrack?.source === 'fallback' ? 'FALLBACK AUDIOTRACK' : 'CURRENT SELECTION'}
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-white truncate mt-1">
                  {currentTrack?.title || 'Iron Man'}
                </h3>
                <p className="text-slate-300 text-sm truncate mt-1">
                  {currentTrack?.artist || 'Black Sabbath'}
                </p>
                <p className="text-slate-500 text-xs truncate mt-0.5">
                  {currentTrack?.album || 'Paranoid'}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    STATUS: {relativeTimeLabel}
                  </span>
                  {currentTrack?.youtubeVideoId && (
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                      YOUTUBE EMBEDDED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cava Audio Spectrum Visualizer */}
            <div className="h-14 w-full bg-black/50 rounded-lg border border-white/10 overflow-hidden flex items-center px-2 relative">
              <canvas ref={canvasRef} className="w-full h-full" />
              <div className="absolute top-1 left-2 text-[9px] text-slate-500">
                CAVA SPECTRUM 32-BAND
              </div>
            </div>

            {/* Seek Bar & Timers */}
            <div className="flex flex-col gap-1.5">
              <div
                onClick={handleSeek}
                className="w-full h-2 bg-white/10 hover:bg-white/20 rounded cursor-pointer relative overflow-hidden transition-colors"
                title="Click to seek"
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200"
                  style={{
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : 'LIVE AUDIO'}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => globalAudio.playPrev()}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
                  title="Previous song"
                >
                  [|&lt; PREV]
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`px-5 py-1.5 rounded font-bold text-xs transition-all flex items-center gap-2 ${
                    isPlayingAudio
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-white text-black hover:bg-slate-200'
                  }`}
                >
                  <span>{isPlayingAudio ? '[|| PAUSE]' : '[&gt; PLAY]'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => globalAudio.playNext()}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
                  title="Next song"
                >
                  [NEXT &gt;|]
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded border border-white/10 text-[10px] text-slate-300">
                <span className="text-slate-400">VOL:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={e => {
                    const next = parseFloat(e.target.value);
                    setVolume(next);
                    globalAudio.setVolume(next);
                  }}
                  className="w-16 sm:w-20 accent-emerald-500 cursor-pointer h-1"
                />
                <span className="w-7 text-right">{Math.round(volume * 100)}%</span>
              </div>
            </div>

            {/* External Links */}
            <div className="flex items-center gap-2 pt-1 text-[10px]">
              {currentTrack?.youtubeVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${currentTrack.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-300 hover:text-white py-1 rounded transition-colors"
                >
                  [OPEN ON YOUTUBE]
                </a>
              )}
              {currentTrack?.songUrl && (
                <a
                  href={currentTrack.songUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white py-1 rounded transition-colors"
                >
                  [VIEW ON LAST.FM]
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Today's Scrobbles / History */}
          <div className="lg:col-span-5 bg-[#090d17]/90 border border-white/10 rounded-xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl backdrop-blur-xl max-h-[520px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">&gt;</span>
                <span className="font-bold text-white uppercase">
                  TODAY&apos;S SCROBBLES
                </span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {todayList.length}
                </span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                SPOTIFY / YT / NCT
              </span>
            </div>

            {/* Scrollable Track Queue */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 text-xs">
              {todayList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-mono text-[11px]">
                  No scrobbles logged today yet. Playing fallback &quot;Iron Man&quot;.
                </div>
              ) : (
                todayList.map((item, idx) => {
                  const isCurrent =
                    Boolean(currentTrack) &&
                    ((currentTrack?.trackId && item.trackId && currentTrack.trackId === item.trackId) ||
                     (currentTrack?.title.toLowerCase() === item.title.toLowerCase() &&
                      currentTrack?.artist.toLowerCase() === item.artist.toLowerCase()));

                  return (
                    <div
                      key={item.trackId || idx}
                      onClick={() => globalAudio.playIndex(idx)}
                      className={`flex items-center justify-between gap-3 p-2 rounded border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] text-slate-500 w-5 text-right font-mono">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        {isCurrent && isPlayingAudio ? (
                          <span className="text-emerald-400 font-bold animate-pulse">
                            [PLAYING]
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {item.relativeTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Attribution */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>DATA BY LAST.FM</span>
              <span>AUDIO VIA YOUTUBE IFRAME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
