/*
Reason for existence: Top system status panel displaying server identity, live CPU/RAM meters, Hyprland-style workspace switcher, and tiling layout toggles.
System impact if absent: System level metrics, active workspaces, and tiling controls will not be visible on the desktop.
*/

'use client';

import React, { useEffect, useState } from 'react';
import { monitor } from '@/lib/monitor';
import { SystemSnapshot, WorkspaceId, TilingLayoutMode } from '@/types';
import { SpotifyPlayer } from '@/components/SpotifyPlayer';
import { useI18n } from '@/lib/i18n';
import { SYSTEM_CONFIG } from '@/config';

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

  const totalCpu = metrics?.totalCpu ?? 12;
  const ramGbUsed = metrics ? (metrics.ramUsed / 1024).toFixed(1) : '3.4';
  const hostname = SYSTEM_CONFIG.hostname;

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
    <header className="h-[42px] glass-panel border-b border-white/10 px-1.5 sm:px-3 flex items-center justify-between gap-1 sm:gap-4 z-50 text-xs font-mono select-none relative w-full overflow-hidden">
      {/* Left section: host badge, Workspace Switcher & Tiling indicator */}
      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 min-w-0">
        {/* Host Home Button -> Switch to Workspace 2 */}
        <button
          type="button"
          onClick={() => onSelectWorkspace(2)}
          className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 py-1 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-[#7aa2f7]/40 rounded shrink-0 transition-all cursor-pointer group"
          title="Home (Workspace 2: dev)"
        >
          <span className="font-semibold text-slate-100 text-[10.5px] sm:text-xs tracking-tight group-hover:text-[#7aa2f7] transition-colors">
            {hostname}
          </span>
        </button>

        {/* Workspace Switcher (Hyprland / i3 style) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-black/40 p-0.5 sm:p-1 rounded-sm border border-white/10 shrink-0">
          {workspaces.map((ws) => {
            const isActive = currentWorkspace === ws.id;
            const count = workspaceCounts?.[ws.id] ?? 0;

            return (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-sm text-[10.5px] sm:text-[11px] font-mono transition-all flex items-center gap-1 ${isActive
                  ? 'bg-[#7aa2f7]/15 text-[#7aa2f7] border border-[#7aa2f7]/40 font-bold shadow-[0_0_10px_rgba(122,162,247,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                title={`${t.panel.workspaceTooltip} ${ws.id} (${ws.label})`}
              >
                <span className="hidden md:inline">{ws.label}</span>
                <span className="md:hidden font-bold">{ws.id}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded-sm hidden sm:inline ${isActive ? 'bg-[#7aa2f7] text-black font-bold' : 'bg-white/10 text-slate-400'
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Hyprland Special Music Workspace Button */}
          <button
            onClick={() => onSelectWorkspace(currentWorkspace === 'special' ? 1 : 'special')}
            className={`px-2 py-0.5 rounded-sm text-[11px] font-mono transition-all flex items-center justify-center ${currentWorkspace === 'special'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_12px_rgba(29,185,84,0.25)]'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-white/5'
              }`}
            title="Special Workspace (Hyprland scratchpad for Music & Media)"
          >
            <span className={currentWorkspace === 'special' ? 'text-emerald-400 font-bold animate-pulse text-xs' : 'text-emerald-500/80 text-xs'}>★</span>
          </button>
        </div>

        {/* Compact Tiling Mode Indicator */}
        <button
          onClick={onToggleLayout}
          className="hidden lg:flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-sm border border-white/10 text-slate-300 hover:bg-white/10 text-[11px] font-mono transition-colors shrink-0"
          title={t.panel.layoutTooltip}
        >
          <span className="text-slate-500 text-[10px] hidden xl:inline">TILING:</span>
          <span className="text-[#7aa2f7] font-semibold uppercase text-[10px]">
            {formatLayoutMode(layoutMode)}
          </span>
        </button>
      </div>

      {/* Right section: Telemetry, Spotify, Language & Clock */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

        {/* Spotify Live Player Pill -> Switch to Special Workspace (compact on mobile) */}
        <div className="relative shrink-0">
          <SpotifyPlayer
            mode="panel"
            onOpenFullPlayer={() => onOpenSpotify?.()}
          />
        </div>

        {/* Recruiter 30s Resume Button */}
        <a
          href="/resume"
          className="hidden sm:flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-sm border border-emerald-500/40 text-emerald-300 font-bold text-[10px] transition-colors cursor-pointer shrink-0"
          title="Open Recruiter 30-Second Resume Summary"
        >
          <span>30s RESUME</span>
        </a>

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

        {/* UTC Clock - Hidden on mobile (< sm), visible on desktop */}
        <div className="hidden sm:flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-200 font-semibold shrink-0 text-[10px] sm:text-[11px] whitespace-nowrap">
          <span>{timeStr}</span>
          <span className="text-slate-500 text-[9px] sm:text-[10px] hidden min-[400px]:inline">UTC</span>
        </div>
      </div>
    </header>
  );
}
