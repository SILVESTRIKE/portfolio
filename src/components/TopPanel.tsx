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
  const ramPercent = metrics?.ramPercent ?? 21;
  const ramGbUsed = metrics ? (metrics.ramUsed / 1024).toFixed(1) : '3.4';
  const ramGbTotal = metrics ? (metrics.ramTotal / 1024).toFixed(0) : '16';
  const load1 = metrics?.loadAvg?.[0] !== undefined ? metrics.loadAvg[0].toFixed(2) : (0.2 + totalCpu / 80).toFixed(2);
  const load2 = metrics?.loadAvg?.[1] !== undefined ? metrics.loadAvg[1].toFixed(2) : (0.3 + totalCpu / 100).toFixed(2);
  const load3 = metrics?.loadAvg?.[2] !== undefined ? metrics.loadAvg[2].toFixed(2) : '0.25';
  const hostname = metrics?.hostname || 'srv-doru.internal';

  const workspaces: Array<{ id: WorkspaceId; label: string }> = [
    { id: 1, label: '1:term' },
    { id: 2, label: '2:dev' },
    { id: 3, label: '3:ops' },
    { id: 4, label: '4:hub' }
  ];

  return (
    <header className="h-[42px] glass-panel border-b border-white/10 px-3 flex items-center justify-between z-50 text-xs font-mono select-none">
      {/* Left section: host badge & Hyprland-style Workspace Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-white/5 border border-white/10 rounded shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="font-semibold text-slate-100 hidden md:inline">{hostname}</span>
          <span className="font-semibold text-slate-100 md:hidden">{hostname.split('.')[0]}</span>
        </div>

        {/* Workspace Switcher (Hyprland / i3 style) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-white/10">
          {workspaces.map((ws) => {
            const isActive = currentWorkspace === ws.id;
            const count = workspaceCounts?.[ws.id] ?? 0;

            return (
              <button
                key={ws.id}
                onClick={() => onSelectWorkspace(ws.id)}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] font-mono transition-all flex items-center gap-1 sm:gap-1.5 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={`${t.panel.workspaceTooltip} ${ws.id} (${ws.label})`}
              >
                <span className="hidden sm:inline">{ws.label}</span>
                <span className="sm:hidden font-bold">{ws.id}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded ${
                    isActive ? 'bg-sky-400 text-black font-bold' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tiling Mode Toggle */}
        <button
          onClick={onToggleLayout}
          className="hidden sm:flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-white/10 text-slate-300 hover:bg-white/10 text-[11px] font-mono transition-colors"
          title={t.panel.layoutTooltip}
        >
          <span className="text-slate-500">{t.panel.layout}:</span>
          <span className="text-emerald-400 font-semibold uppercase">{layoutMode}</span>
        </button>
      </div>

      {/* Right section: System Telemetry, Uptime & Clock */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick CPU/RAM metrics */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-slate-400">
            <span className="text-slate-500 font-bold text-[11px]">{t.panel.cpu}</span>
            <span className="text-sky-400 font-medium">{totalCpu}%</span>
            <div className="w-9 h-1.5 bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-300"
                style={{ width: `${totalCpu}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-slate-400">
            <span className="text-slate-500 font-bold text-[11px]">{t.panel.ram}</span>
            <span className="text-emerald-400 font-medium">{ramGbUsed}/{ramGbTotal}G</span>
            <div className="w-9 h-1.5 bg-white/10 rounded overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${ramPercent}%` }}
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-black/40 px-2 py-0.5 rounded border border-white/5 text-slate-400">
            <span className="text-slate-500 font-bold text-[11px]">{t.panel.load}</span>
            <span className="text-slate-300">{load1} {load2} {load3}</span>
          </div>
        </div>

        {/* Spotify Live Player Pill */}
        <SpotifyPlayer mode="panel" onOpenFullPlayer={onOpenSpotify} />

        {/* Language Switcher Button */}
        <button
          onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
          className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 text-sky-300 font-bold text-[10px] transition-colors cursor-pointer"
          title={`Language: ${locale === 'en' ? 'English' : 'Tiếng Việt'} (Click to toggle)`}
        >
          <span className={locale === 'en' ? 'text-sky-300' : 'text-slate-500'}>EN</span>
          <span className="text-slate-600">/</span>
          <span className={locale === 'vi' ? 'text-sky-300' : 'text-slate-500'}>VI</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
            root
          </span>
          <span className="text-slate-300 hidden sm:inline">root@{hostname.split('.')[0]}</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-200 font-semibold">
          <span>{timeStr}</span>
          <span className="text-slate-500 text-[10px]">UTC</span>
        </div>
      </div>
    </header>
  );
}
