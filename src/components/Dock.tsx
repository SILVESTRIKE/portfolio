/*
Reason for existence: Application launcher dock providing quick access buttons to launch and toggle Linux server applications.
System impact if absent: Users will have no visible dock to open, switch, or restore desktop applications.
*/

'use client';

import React from 'react';
import { AppId, WindowState } from '@/types';
import { useI18n } from '@/lib/i18n';

interface DockProps {
  windows: Record<AppId, WindowState>;
  activeId: AppId | null;
  onToggleApp: (id: AppId) => void;
}

export function Dock({ windows, activeId, onToggleApp }: DockProps) {
  const { t } = useI18n();

  const dockApps: Array<{ id: AppId; label: string; icon: React.ReactNode }> = [
    {
      id: 'app-terminal',
      label: t.dock.terminal.split(' ')[0],
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    },
    {
      id: 'hub-portfolio',
      label: t.dock.devPortfolio.split(' ')[0] + ' & ' + (t.dock.devPortfolio.split(' ')[2] || 'Dev'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )
    },
    {
      id: 'hub-system',
      label: t.dock.serverOps.split(' ')[0] + ' ' + (t.dock.serverOps.split(' ')[1] || 'Ops'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <path d="M6 10l3-3 3 6 3-3 3 3" />
        </svg>
      )
    },
    {
      id: 'hub-workspace',
      label: t.dock.aiWorkbench.split(' ')[0] + ' & ' + (t.dock.aiWorkbench.split(' ')[2] || 'Files'),
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.11L3 22l1.11-4.413A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2z" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      )
    },
    {
      id: 'app-spotify',
      label: t.dock.spotify.split(' ')[0],
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 11.5c3-1 6-.5 8.5 1M7 9c3.5-1 7.5-.5 10.5 1.5M9 14c2.5-.8 5-.4 7 .8" />
        </svg>
      )
    }
  ];

  return (
    <nav className="h-[60px] pb-2 flex justify-center items-center z-40 select-none px-2 max-w-full" aria-label="Server Applications">
      <div className="glass-panel px-2 sm:px-3 py-1.5 rounded-2xl flex items-center gap-1 sm:gap-1.5 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)] max-w-full overflow-x-auto scrollbar-none">
        {dockApps.map((app) => {
          const win = windows[app.id];
          const isOpen = win?.isOpen && !win?.isMinimized;
          const isFocused = activeId === app.id && isOpen;

          return (
            <button
              key={app.id}
              onClick={() => onToggleApp(app.id)}
              className={`relative px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex flex-col items-center gap-1 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 shrink-0 ${
                isFocused ? 'text-sky-400 bg-white/5' : ''
              }`}
              title={app.label}
              id={`dock-btn-${app.id}`}
            >
              {app.icon}
              <span className="text-[10px] font-mono font-medium leading-none">{app.label}</span>
              {win?.isOpen && (
                <span
                  className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${
                    isFocused ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
