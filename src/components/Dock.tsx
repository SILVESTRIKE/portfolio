/*
Reason for existence: Linux tmux-style bottom workstation status bar providing active process toggles, workspace session information, and desktop shortcut indicators.
System impact if absent: Desktop workstation lacks bottom system status indicators, hotkey reference, and app task switching.
*/

'use client';

import React from 'react';
import { AppId, WindowState } from '@/types';
import { useI18n } from '@/lib/i18n';
import { SYSTEM_CONFIG } from '@/config';

interface DockProps {
  windows: Record<AppId, WindowState>;
  activeId: AppId | null;
  onToggleApp: (id: AppId) => void;
}

export function Dock({ windows, activeId, onToggleApp }: DockProps) {
  const { t } = useI18n();

  const dockApps: Array<{ id: AppId; label: string }> = [
    { id: 'hub-portfolio', label: t.dock.devPortfolioShort || 'portfolio' },
    { id: 'app-contact', label: t.dock.contactShort || 'contact' },
    { id: 'app-terminal', label: t.dock.terminalShort || 'terminal' },
    { id: 'hub-system', label: t.dock.serverOpsShort || 'system' },
    { id: 'hub-workspace', label: t.dock.aiWorkbenchShort || 'workbench' },
    { id: 'app-spotify', label: 'music' }
  ];

  return (
    <footer
      className="h-[28px] bg-[#0a0d14] border-t border-white/10 px-3 flex items-center justify-between text-[11px] font-mono select-none z-40 text-slate-400 shrink-0"
      aria-label="Server Workstation Status Line"
    >
      {/* Left: tmux session & directory */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="bg-[#7aa2f7]/20 text-[#7aa2f7] px-1.5 py-0.2 rounded-sm font-bold text-[10px]">
          [tmux:0]
        </span>
        <span className="text-slate-300 font-semibold hidden sm:inline">
          root@{SYSTEM_CONFIG.serverHost}
        </span>
        <span className="text-slate-600 hidden sm:inline">:</span>
        <span className="text-slate-400 hidden md:inline">
          ~/portfolio
        </span>
        <span className="text-[#9ece6a] text-[10px] hidden lg:inline">
          (main)
        </span>
      </div>

      {/* Center: Running / Open Application Taskbar Tags */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
        {dockApps.map((app) => {
          const win = windows[app.id];
          const isOpen = win?.isOpen && !win?.isMinimized;
          const isFocused = activeId === app.id && isOpen;

          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`px-2.5 py-0.5 rounded-sm transition-all flex items-center gap-1.5 text-[10px] sm:text-[11px] cursor-pointer whitespace-nowrap shrink-0 ${isFocused
                ? 'bg-[#7aa2f7]/20 text-[#7aa2f7] border border-[#7aa2f7]/40 font-bold shadow-[0_0_8px_rgba(122,162,247,0.15)]'
                : isOpen
                  ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
              title={`Toggle ${app.label}`}
              id={`dock-btn-${app.id}`}
            >
              {isOpen && (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isFocused ? 'bg-[#7aa2f7] shadow-[0_0_6px_#7aa2f7]' : 'bg-slate-400'
                    }`}
                />
              )}
              <span className="whitespace-nowrap">{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Keybinding Cheatsheet & Layout */}
      <div className="flex items-center gap-2 shrink-0 text-[10px]">
        <span className="text-slate-500 hidden xl:inline">
          <kbd className="px-1 py-0.2 bg-white/5 border border-white/10 rounded-sm text-slate-400">Ctrl+K</kbd> launcher
        </span>
        <span className="text-slate-500 hidden lg:inline">
          <kbd className="px-1 py-0.2 bg-white/5 border border-white/10 rounded-sm text-slate-400">Super+M</kbd> monocle
        </span>
      </div>
    </footer>
  );
}
