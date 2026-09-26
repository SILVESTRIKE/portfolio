/*
Reason for existence: Interactive Linux bash terminal application providing multi-tab sessions, Neofetch developer dossier, inline ghost auto-suggest, quick command shortcuts, and system tools execution.
System impact if absent: Users will not have a functional terminal shell, home dossier view, or quick navigation commands.
*/

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { vfs } from '@/lib/fs';
import { services } from '@/lib/services';
import { logManager } from '@/lib/logs';
import { monitor } from '@/lib/monitor';
import { AppId } from '@/types';

import { FastfetchBanner } from './terminal/FastfetchBanner';
import {
  ALL_TERMINAL_COMMANDS,
  executeTerminalCommand,
  escapeHtml
} from './terminal/terminalCommands';

interface TerminalAppProps {
  onOpenApp?: (id: AppId) => void;
}

interface TermOutputLine {
  id: string;
  type: 'prompt' | 'text' | 'html' | 'fastfetch';
  content?: string;
  color?: string;
}

interface TerminalSession {
  id: string;
  title: string;
  currentDir: string;
  lines: TermOutputLine[];
  historyIndex: number;
}

const STORAGE_KEY_HISTORY = 'silvestrike_terminal_history';
const MAX_HISTORY = 50;

const SUGGEST_COMMANDS = ALL_TERMINAL_COMMANDS;

const INITIAL_WELCOME_BANNER = `
<div class="font-mono mb-2 text-slate-400 text-[11px] leading-relaxed select-none border-b border-white/10 pb-1.5">
  <div class="text-[#7aa2f7] font-bold text-xs tracking-wide">SILVESTRIKE WebOS Terminal v2.3</div>
  <div class="text-[10px] text-slate-500">Type <span class="text-[#7aa2f7] font-semibold">'help'</span> for command index, or use quick action shortcuts below.</div>
</div>
`;

export function TerminalApp({ onOpenApp }: TerminalAppProps) {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: 'session-1',
      title: 'bash:1',
      currentDir: '/home/silvestrike',
      lines: [
        {
          id: 'welcome-banner',
          type: 'html',
          content: INITIAL_WELCOME_BANNER
        },
        {
          id: 'init-prompt',
          type: 'html',
          content: '<span style="color: #9ece6a; font-weight: 600;">duong@srv-silvestrike:~$ </span><span>fastfetch</span>'
        },
        {
          id: 'init-fastfetch',
          type: 'fastfetch'
        }
      ],
      historyIndex: -1
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session-1');
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persistent history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCommandHistory(parsed.slice(-MAX_HISTORY));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveHistory = useCallback((cmd: string) => {
    setCommandHistory((prev) => {
      const next = [...prev.filter((c) => c !== cmd), cmd].slice(-MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const scrollToBottom = useCallback((smooth = false) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  useEffect(() => {
    scrollToBottom(false);
    const frame = requestAnimationFrame(() => scrollToBottom(false));
    const t1 = setTimeout(() => scrollToBottom(false), 60);
    const t2 = setTimeout(() => scrollToBottom(false), 250);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeSession?.lines, activeSessionId, scrollToBottom]);

  // Keep pinned to bottom on content resizing if near bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
      if (isNearBottom) {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getPromptString = (sessionDir: string) => {
    const displayDir = sessionDir.replace('/home/silvestrike', '~');
    return `duong@srv-silvestrike:${displayDir}$ `;
  };

  // Ghost text auto-suggestion calculation
  const ghostSuggestion = useMemo(() => {
    const trimmed = inputValue.trimStart();
    if (!trimmed || trimmed.includes(' ')) return '';
    const match = SUGGEST_COMMANDS.find(
      (c) => c.startsWith(trimmed.toLowerCase()) && c !== trimmed.toLowerCase()
    );
    if (!match) return '';
    return match.slice(trimmed.length);
  }, [inputValue]);

  const handleCreateSession = () => {
    const nextIdx = sessions.length + 1;
    const newSession: TerminalSession = {
      id: `session-${Date.now()}`,
      title: `bash:${nextIdx}`,
      currentDir: '/home/silvestrike',
      lines: [
        {
          id: `init-${Date.now()}`,
          type: 'text',
          content: 'Linux srv-silvestrike x86_64 [pts/new] - Type "about" or "help"',
          color: '#64748b'
        }
      ],
      historyIndex: -1
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setInputValue('');
  };

  const handleCloseSession = (sessionId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[remaining.length - 1].id);
    }
  };

  const updateActiveSession = (updates: Partial<TerminalSession>) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, ...updates } : s))
    );
  };

  const handleTabComplete = () => {
    const val = inputValue;
    if (!val.trim()) return;

    const tokens = val.split(' ');

    // Command completion
    if (tokens.length === 1) {
      const matches = SUGGEST_COMMANDS.filter((c) => c.startsWith(tokens[0]));
      if (matches.length === 1) {
        setInputValue(matches[0] + ' ');
      } else if (matches.length > 1) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                ...s,
                lines: [
                  ...s.lines,
                  {
                    id: String(Date.now()),
                    type: 'text',
                    content: matches.join('  '),
                    color: '#7aa2f7'
                  }
                ]
              }
              : s
          )
        );
      }
      return;
    }

    // Path completion
    const lastArg = tokens[tokens.length - 1];
    let searchDir = activeSession.currentDir;
    let prefix = lastArg;

    if (lastArg.includes('/')) {
      const lastSlash = lastArg.lastIndexOf('/');
      const dirPart = lastArg.substring(0, lastSlash) || '/';
      searchDir = vfs.resolvePath(activeSession.currentDir, dirPart);
      prefix = lastArg.substring(lastSlash + 1);
    }

    const items = vfs.listDir(searchDir);
    if (!items) return;

    const matches = items
      .filter((node) => node.name.startsWith(prefix))
      .map((node) => (node.type === 'dir' ? `${node.name}/` : node.name));

    if (matches.length === 1) {
      tokens[tokens.length - 1] = lastArg.includes('/')
        ? lastArg.substring(0, lastArg.lastIndexOf('/') + 1) + matches[0]
        : matches[0];
      setInputValue(tokens.join(' '));
    } else if (matches.length > 1) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
              ...s,
              lines: [
                ...s.lines,
                {
                  id: String(Date.now()),
                  type: 'text',
                  content: matches.join('  '),
                  color: '#7aa2f7'
                }
              ]
            }
            : s
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const raw = inputValue;
      setInputValue('');
      executeCommand(raw);
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && inputRef.current?.selectionStart === inputValue.length)) {
      if (ghostSuggestion) {
        e.preventDefault();
        setInputValue(inputValue + ghostSuggestion + ' ');
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        handleTabComplete();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx =
          activeSession.historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, activeSession.historyIndex - 1);
        updateActiveSession({ historyIndex: nextIdx });
        setInputValue(commandHistory[nextIdx] ?? '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeSession.historyIndex !== -1) {
        if (activeSession.historyIndex < commandHistory.length - 1) {
          const nextIdx = activeSession.historyIndex + 1;
          updateActiveSession({ historyIndex: nextIdx });
          setInputValue(commandHistory[nextIdx] ?? '');
        } else {
          updateActiveSession({ historyIndex: -1 });
          setInputValue('');
        }
      }
    }
  };

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (trimmed.length > 0) {
      saveHistory(trimmed);
      updateActiveSession({ historyIndex: -1 });
    }

    const promptEntry: TermOutputLine = {
      id: `p-${Date.now()}`,
      type: 'html',
      content: `<span style="color: #9ece6a; font-weight: 600;">${getPromptString(
        activeSession.currentDir
      )}</span><span>${escapeHtml(cmdStr)}</span>`
    };

    if (!trimmed) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId ? { ...s, lines: [...s.lines, promptEntry] } : s
        )
      );
      return;
    }

    const result = executeTerminalCommand(cmdStr, {
      currentDir: activeSession.currentDir,
      commandHistory,
      onOpenApp,
      onClearHistory: () => {
        setCommandHistory([]);
        try {
          localStorage.removeItem(STORAGE_KEY_HISTORY);
        } catch {}
      },
      onCloseSession: () => {
        if (sessions.length > 1) {
          handleCloseSession(activeSessionId);
        }
      }
    });

    if (result.clearLines) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, lines: [] } : s))
      );
      return;
    }

    const nextDir = result.nextDir || activeSession.currentDir;
    const isFastfetch = !!result.isFastfetch;
    const outputHtml = result.outputHtml || '';

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          currentDir: nextDir,
          lines: [
            ...s.lines,
            promptEntry,
            ...(isFastfetch
              ? [{ id: `out-${Date.now()}`, type: 'fastfetch' as const }]
              : outputHtml
                ? [{ id: `out-${Date.now()}`, type: 'html' as const, content: outputHtml }]
                : [])
          ]
        };
      })
    );
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full w-full bg-[#080a0f] flex flex-col font-mono text-xs overflow-hidden select-text"
    >
      {/* Session Tab Bar */}
      <div className="h-8 bg-[#0a0d14] border-b border-white/10 px-2.5 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`px-2.5 py-1 rounded text-[10px] flex items-center gap-2 cursor-pointer transition-colors ${isActive
                  ? 'bg-[#7aa2f7]/20 text-[#89b4fa] font-bold border border-[#7aa2f7]/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
              >
                <span>&gt;_</span>
                <span>{s.title}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => handleCloseSession(s.id, e)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                    title="Close session"
                  >
                    x
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={handleCreateSession}
            className="px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/10 transition-colors"
            title="New terminal session"
          >
            +
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-500 pr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9ece6a] animate-pulse" />
          <span>duong@srv-silvestrike:~</span>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div ref={scrollRef} className="flex-1 p-3 sm:p-3.5 overflow-y-auto overflow-x-hidden leading-normal">
        {activeSession.lines.map((line) => (
          <div
            key={line.id}
            className={`${line.type === 'html' || line.type === 'fastfetch' ? 'whitespace-normal' : 'whitespace-pre-wrap break-all'} mb-1 font-mono text-xs`}
            style={{ color: line.color || '#e2e8f0' }}
          >
            {line.type === 'fastfetch' ? (
              <FastfetchBanner />
            ) : line.type === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: line.content || '' }} />
            ) : (
              line.content
            )}
          </div>
        ))}

        {/* Input line with ghost auto-suggest */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[#9ece6a] font-semibold whitespace-nowrap">
            {getPromptString(activeSession.currentDir)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border-none outline-none text-white font-mono text-xs caret-[#7aa2f7] z-10"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            {ghostSuggestion && (
              <span className="absolute left-0 top-0 pointer-events-none text-slate-500 font-mono text-xs select-none z-0">
                <span className="opacity-0">{inputValue}</span>
                <span>{ghostSuggestion}</span>
                <span className="ml-2 text-[10px] text-slate-600 bg-white/5 px-1 rounded">[Tab / →]</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Command Bar */}
      <div className="h-8 bg-[#060910] border-t border-white/10 px-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 select-none">
        <span className="text-[10px] text-slate-500 font-mono shrink-0 mr-1">Quick:</span>
        {[
          { label: 'fastfetch', cmd: 'fastfetch' },
          { label: 'about', cmd: 'about' },
          { label: 'skills', cmd: 'skills' },
          { label: 'projects', cmd: 'projects' },
          { label: 'monitor', cmd: 'monitor' },
          { label: 'services', cmd: 'services' },
          { label: 'git', cmd: 'git' },
          { label: 'network', cmd: 'network' },
          { label: 'odoo', cmd: 'odoo' },
          { label: 'contact', cmd: 'contact' },
          { label: 'clear', cmd: 'clear' },
          { label: 'boot', cmd: 'boot' }
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => executeCommand(btn.cmd)}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.04] hover:bg-[#7aa2f7]/20 text-slate-300 hover:text-[#7aa2f7] border border-white/10 hover:border-[#7aa2f7]/40 transition-colors shrink-0"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
