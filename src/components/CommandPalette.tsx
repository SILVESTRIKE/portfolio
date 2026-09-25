/*
Reason for existence: Fast application launcher and system command palette overlay accessible via Ctrl+K with keyboard fuzzy search and execution.
System impact if absent: Users must rely exclusively on dock clicks or manual clicks to navigate between apps, workspaces, and layouts.
*/

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppId, WorkspaceId, TilingLayoutMode } from '@/types';
import { useI18n } from '@/lib/i18n';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp: (id: AppId) => void;
  onSwitchWorkspace: (id: WorkspaceId) => void;
  onToggleLayout: () => void;
  onCloseActivePane: () => void;
  onToggleMaximize: () => void;
  onToggleAudio: () => void;
  currentWorkspace: WorkspaceId;
  layoutMode: TilingLayoutMode;
}

export function CommandPalette({
  isOpen,
  onClose,
  onLaunchApp,
  onSwitchWorkspace,
  onToggleLayout,
  onCloseActivePane,
  onToggleMaximize,
  onToggleAudio,
  currentWorkspace,
  layoutMode
}: CommandPaletteProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    // Applications
    {
      id: 'app-terminal',
      title: t.commands.openTerminal,
      category: t.commands.categoryApps,
      shortcut: 'Alt+T',
      action: () => onLaunchApp('app-terminal')
    },
    {
      id: 'hub-portfolio',
      title: t.commands.openPortfolio,
      category: t.commands.categoryApps,
      shortcut: 'Alt+2',
      action: () => onLaunchApp('hub-portfolio')
    },
    {
      id: 'app-about',
      title: t.commands.openAbout,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-about')
    },
    {
      id: 'app-git',
      title: t.commands.openGitKraken,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-git')
    },
    {
      id: 'hub-system',
      title: t.commands.openSystemHub,
      category: t.commands.categoryApps,
      shortcut: 'Alt+3',
      action: () => onLaunchApp('hub-system')
    },
    {
      id: 'app-monitor',
      title: t.commands.openMonitor,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-monitor')
    },
    {
      id: 'app-services',
      title: t.commands.openServices,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-services')
    },
    {
      id: 'app-files',
      title: t.commands.openFiles,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-files')
    },
    {
      id: 'app-logs',
      title: t.commands.openLogs,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-logs')
    },
    {
      id: 'app-network',
      title: t.commands.openNetwork,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-network')
    },
    {
      id: 'app-ai',
      title: t.commands.openAi,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-ai')
    },
    {
      id: 'app-spotify',
      title: t.commands.openSpotify,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-spotify')
    },
    {
      id: 'app-contact',
      title: t.apps.contact.title,
      category: t.commands.categoryApps,
      action: () => onLaunchApp('app-contact')
    },

    // Workspaces
    {
      id: 'ws-1',
      title: `${t.commands.switchWorkspace} 1: term ${currentWorkspace === 1 ? '[active]' : ''}`,
      category: t.commands.categoryWorkspaces,
      shortcut: 'Alt+1',
      action: () => onSwitchWorkspace(1)
    },
    {
      id: 'ws-2',
      title: `${t.commands.switchWorkspace} 2: dev ${currentWorkspace === 2 ? '[active]' : ''}`,
      category: t.commands.categoryWorkspaces,
      shortcut: 'Alt+2',
      action: () => onSwitchWorkspace(2)
    },
    {
      id: 'ws-3',
      title: `${t.commands.switchWorkspace} 3: ops ${currentWorkspace === 3 ? '[active]' : ''}`,
      category: t.commands.categoryWorkspaces,
      shortcut: 'Alt+3',
      action: () => onSwitchWorkspace(3)
    },
    {
      id: 'ws-4',
      title: `${t.commands.switchWorkspace} 4: hub ${currentWorkspace === 4 ? '[active]' : ''}`,
      category: t.commands.categoryWorkspaces,
      shortcut: 'Alt+4',
      action: () => onSwitchWorkspace(4)
    },

    // Layout & Windows
    {
      id: 'toggle-layout',
      title: `${t.commands.cycleLayout} (${layoutMode.toUpperCase()})`,
      category: t.commands.categoryLayout,
      shortcut: 'Alt+L',
      action: () => onToggleLayout()
    },
    {
      id: 'toggle-maximize',
      title: t.commands.toggleMaximize,
      category: t.commands.categoryLayout,
      shortcut: 'Alt+F',
      action: () => onToggleMaximize()
    },
    {
      id: 'close-pane',
      title: t.commands.closeActivePane,
      category: t.commands.categoryLayout,
      shortcut: 'Alt+Q',
      action: () => onCloseActivePane()
    },

    // Audio & Controls
    {
      id: 'toggle-audio',
      title: t.commands.toggleAudio,
      category: t.commands.categoryControls,
      action: () => onToggleAudio()
    },
    {
      id: 'replay-boot',
      title: 'Replay Boot Sequence (eDEX-UI / TRON)',
      category: t.commands.categoryControls,
      shortcut: 'boot',
      action: () => {
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('replay_boot_sequence'));
          }, 50);
        }
      }
    }
  ], [
    t,
    currentWorkspace,
    layoutMode,
    onLaunchApp,
    onSwitchWorkspace,
    onToggleLayout,
    onToggleMaximize,
    onCloseActivePane,
    onToggleAudio
  ]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(cmd =>
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Reset selectedIndex on search
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        target.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-obsidian-900 border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="p-3 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <span className="text-sky-400 font-bold text-xs tracking-wider uppercase">
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.commands.placeholder}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          <span className="text-[10px] text-slate-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1 text-xs"
        >
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">
              {t.commands.noResults} &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${isSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 bg-black/40 rounded border border-white/5 shrink-0">
                      {cmd.category}
                    </span>
                    <span className="font-medium truncate">{cmd.title}</span>
                  </div>

                  {cmd.shortcut && (
                    <span className="text-[10px] text-slate-400 bg-white/10 px-1.5 py-0.5 rounded font-mono shrink-0 ml-2">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2 border-t border-white/10 bg-black/40 flex items-center justify-between text-[10px] text-slate-500 px-3">
          <div className="flex items-center gap-2">
            <span>{t.commands.footerNavigate}</span>
            <span>{t.commands.footerSelect}</span>
            <span>{t.commands.footerClose}</span>
          </div>
          <span>{t.commands.title}</span>
        </div>
      </div>
    </div>
  );
}
