/*
Reason for existence: Top system status panel displaying server identity, live CPU/RAM meters, Hyprland-style workspace switcher, and tiling layout toggles.
System impact if absent: System level metrics, active workspaces, and tiling controls will not be visible on the desktop.
*/

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { monitor } from '@/lib/monitor';
import { SystemSnapshot, WorkspaceId, TilingLayoutMode } from '@/types';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { useI18n } from '@/lib/i18n';

interface TopPanelProps {
  currentWorkspace: WorkspaceId;
  onSelectWorkspace: (id: WorkspaceId) => void;
  workspaceCounts: Record<WorkspaceId, number>;
  layoutMode: TilingLayoutMode;
  onToggleLayout: () => void;
  onOpenSpotify?: () => void;
}

export function TopPanel({
  currentWorkspace,
  onSelectWorkspace,
  workspaceCounts,
  layoutMode,
  onToggleLayout,
  onOpenSpotify
}: TopPanelProps) {
  const { locale, setLocale, t } = useI18n();
  const [metrics, setMetrics] = useState<SystemSnapshot | null>(null);
  const [timeStr, setTimeStr] = useState<string>('00:00:00');
  const [isSpotifyFlyoutOpen, setIsSpotifyFlyoutOpen] = useState(false);
  const spotifyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = monitor.subscribe((snap) => {
      setMetrics(snap);
    });

    const timer = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toTimeString().substring(0, 8));
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  // Close flyout on outside click
  useEffect(() => {
    if (!isSpotifyFlyoutOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (spotifyContainerRef.current && !spotifyContainerRef.current.contains(e.target as Node)) {
        setIsSpotifyFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSpotifyFlyoutOpen]);

  const totalCpu = metrics?.totalCpu ?? 12;
  const ramGbUsed = metrics ? (metrics.ramUsed / 1024).toFixed(1) : '3.4';
  const hostname = 'silvestrike.dev';

  const workspaces: Array<{ id: WorkspaceId; label: string }> = [
    { id: 1, label: '1:term' },
    { id: 2, label: '2:dev' },
    { id: 3, label: '3:ops' },
    { id: 4, label: '4:hub' }
  ];

  const formatLayoutMode = (mode: TilingLayoutMode) => {
    switch (mode) {
      case 'master-stack':
        return 'STACK';
      case 'grid':
        return 'GRID';
      case 'columns':
        return 'COLS';
      case 'monocle':
        return 'MONO';
      default:
        return mode;
    }
  };

  return (
    <header className="h-[42px] glass-panel border-b border-white/10 px-3 flex items-center justify-between z-50 text-xs font-mono select-none relative w-full overflow-hidden">
      {/* Left section: host badge, Workspace Switcher & Tiling indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        {/* Host badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-white/5 border border-white/10 rounded shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500/60 shrink-0" />
          <span className="font-semibold text-slate-100 hidden md:inline">{hostname}</span>
          <span className="font-semibold text-slate-100 md:hidden">{hostname.split('.')[0]}</span>
        </div>

        {/* Workspace Switcher (Hyprland / i3 style) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-sm border border-white/10 shrink-0">
          {workspaces.map((ws) => {
            const isActive = currentWorkspace === ws.id;
            const count = workspaceCounts?.[ws.id] ?? 0;

            return (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-sm text-[11px] font-mono transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#7aa2f7]/15 text-[#7aa2f7] border border-[#7aa2f7]/40 font-bold shadow-[0_0_10px_rgba(122,162,247,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={`${t.panel.workspaceTooltip} ${ws.id} (${ws.label})`}
              >
                <span className="hidden md:inline">{ws.label}</span>
                <span className="md:hidden font-bold">{ws.id}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded-sm hidden sm:inline ${
                    isActive ? 'bg-[#7aa2f7] text-black font-bold' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Compact Tiling Mode Indicator */}
        <button
          onClick={onToggleLayout}
          className="hidden lg:flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-sm border border-white/10 text-slate-300 hover:bg-white/10 text-[11px] font-mono transition-colors shrink-0"
          title={t.panel.layoutTooltip}
        >
          <span className="text-slate-500 text-[10px]">TILING:</span>
          <span className="text-[#7aa2f7] font-semibold uppercase text-[10px]">
            {formatLayoutMode(layoutMode)}
          </span>
        </button>
      </div>

      {/* Right section: Telemetry, Spotify, Language, Identity & Clock */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Compact CPU/RAM telemetry - Waybar style on xl+ */}
        <div className="hidden xl:flex items-center gap-2 bg-black/40 px-2.5 py-0.5 rounded-sm border border-white/5 text-[11px] text-slate-400 font-mono">
          <span>
            <span className="text-slate-500 font-bold">CPU</span>{' '}
            <span className="text-[#7aa2f7] font-medium">{totalCpu}%</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <span className="text-slate-500 font-bold">RAM</span>{' '}
            <span className="text-emerald-400 font-medium">{ramGbUsed}G</span>
          </span>
        </div>

        {/* Spotify Live Player Pill & Popover Flyout */}
        <div ref={spotifyContainerRef} className="relative shrink-0">
          <SpotifyPlayer
            mode="panel"
            onOpenFullPlayer={() => setIsSpotifyFlyoutOpen(prev => !prev)}
          />

          {isSpotifyFlyoutOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <SpotifyPlayer
                mode="flyout"
                onClose={() => setIsSpotifyFlyoutOpen(false)}
                onOpenFullPlayer={() => {
                  setIsSpotifyFlyoutOpen(false);
                  onOpenSpotify?.();
                }}
              />
            </div>
          )}
        </div>

        {/* Language Switcher Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-1.5 sm:px-2 py-0.5 rounded-sm border border-white/10 text-[#7aa2f7] font-bold text-[10px] transition-colors cursor-pointer shrink-0"
          title={`Language: ${locale === 'en' ? 'English' : 'Tiếng Việt'} (Click to toggle)`}
        >
          <span className={locale === 'en' ? 'text-[#7aa2f7]' : 'text-slate-500'}>EN</span>
          <span className="text-slate-600">/</span>
          <span className={locale === 'vi' ? 'text-[#7aa2f7]' : 'text-slate-500'}>VI</span>
        </button>

        {/* User Identity - Clean single badge */}
        <div className="flex items-center px-2 py-0.5 bg-[#7aa2f7]/10 border border-[#7aa2f7]/25 rounded-sm text-[10px] font-mono text-[#7aa2f7] font-bold uppercase shrink-0">
          <span className="hidden sm:inline">duong@{hostname.split('.')[0]}</span>
          <span className="sm:hidden">duong</span>
        </div>

        {/* UTC Clock - Guaranteed fully visible right-anchored */}
        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-200 font-semibold shrink-0 text-[11px]">
          <span>{timeStr}</span>
          <span className="text-slate-500 text-[10px]">UTC</span>
        </div>
      </div>
    </header>
  );
}
