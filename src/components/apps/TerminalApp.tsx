/*
Reason for existence: Interactive Linux bash terminal application providing multi-tab sessions, command history persistence, VFS path auto-completion, and full shell command execution.
System impact if absent: Users will not have a functional terminal shell to run bash commands, manage files, or inspect server status.
*/

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { vfs } from '@/lib/fs';
import { services } from '@/lib/services';
import { logManager } from '@/lib/logs';
import { monitor } from '@/lib/monitor';
import { AppId } from '@/types';

interface TerminalAppProps {
  onOpenApp?: (id: AppId) => void;
}

interface TermOutputLine {
  id: string;
  type: 'prompt' | 'text' | 'html';
  content: string;
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

export function TerminalApp({ onOpenApp }: TerminalAppProps) {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: 'session-1',
      title: 'bash:1',
      currentDir: '/home/silvestrike',
      lines: [
        {
          id: 'init-1',
          type: 'text',
          content: 'Linux srv-silvestrike 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64',
          color: '#64748b'
        },
        {
          id: 'init-2',
          type: 'html',
          content: `Type <span style="color: #38bdf8;">'help'</span> for available commands, <span style="color: #38bdf8;">'about'</span> for dossier, or <span style="color: #38bdf8;">'neofetch'</span> for specs.`
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.lines]);

  const getPromptString = (sessionDir: string) => {
    const displayDir = sessionDir
      .replace('/home/silvestrike', '~')
      .replace('/home/doru', '~');
    return `root@srv-silvestrike:${displayDir}# `;
  };

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
          content: 'Linux srv-silvestrike 6.8.0-45-generic #45-Ubuntu x86_64 [pts/new]',
          color: '#64748b'
        }
      ],
      historyIndex: -1
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setInputValue('');
  };

  const handleCloseSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length === 1) return;
    const remaining = sessions.filter((s) => s.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[remaining.length - 1].id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const raw = inputValue;
      setInputValue('');
      executeCommand(raw);
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabComplete();
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

    const cmds = [
      'help', 'clear', 'pwd', 'cd', 'ls', 'cat', 'more', 'cp', 'mv', 'echo',
      'mkdir', 'touch', 'rm', 'whoami', 'about', 'bio', 'man', 'hostname',
      'uname', 'neofetch', 'date', 'uptime', 'df', 'free', 'ps', 'kill',
      'systemctl', 'journalctl', 'curl', 'htop', 'history', 'reboot',
      'portfolio', 'projects', 'ai', 'odoo'
    ];

    const tokens = val.split(' ');

    // Command completion
    if (tokens.length === 1) {
      const matches = cmds.filter((c) => c.startsWith(tokens[0]));
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
                      color: '#94a3b8'
                    }
                  ]
                }
              : s
          )
        );
      }
      return;
    }

    // Path completion (for cat, cd, ls, more, cp, mv, rm, etc.)
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
                    color: '#94a3b8'
                  }
                ]
              }
            : s
        )
      );
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
      content: `<span style="color: #10b981; font-weight: 600;">${getPromptString(
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

    const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    const cmd = tokens[0]?.toLowerCase() || '';
    const args = tokens.slice(1).map((arg) => arg.replace(/^['"]|['"]$/g, ''));

    let outputHtml = '';
    let nextDir = activeSession.currentDir;

    switch (cmd) {
      case 'help':
        outputHtml = `
<span style="color: #38bdf8; font-weight: bold;">AVAILABLE SYSTEM COMMANDS:</span>
  help                     Display command guide
  clear                    Clear terminal screen
  about / whoami -v        Display SILVESTRIKE developer dossier
  neofetch                 Show server architecture and specifications
  pwd                      Print name of current working directory
  cd [dir]                 Change working directory
  ls [-l, -a] [dir]        List directory contents
  cat [file]               Concatenate and print file contents
  more [file]              Page through file contents
  cp &lt;src&gt; &lt;dest&gt;           Copy file or directory in VFS
  mv &lt;src&gt; &lt;dest&gt;           Move or rename file or directory in VFS
  mkdir &lt;dir&gt;             Create new directory
  touch &lt;file&gt;            Create new file
  rm &lt;file/dir&gt;          Remove file or directory
  date / uptime            Display system clock and operating uptime
  df / free                Report disk space usage and memory statistics
  ps / kill [pid]          Process status snapshot and signal termination
  systemctl status [svc]   Query internal microservice health status
  journalctl               Display kernel and daemon event logs
  history                  View persistent bash execution history
  portfolio / projects     Launch Dossier IDE studio
`;
        break;

      case 'clear':
      case 'cls':
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, lines: [] } : s))
        );
        return;

      case 'pwd':
        outputHtml = escapeHtml(activeSession.currentDir);
        break;

      case 'cd': {
        const target = args[0] || '~';
        const resolved = vfs.resolvePath(activeSession.currentDir, target);
        const node = vfs.getNode(resolved);
        if (!node) {
          outputHtml = `<span style="color: #f43f5e;">bash: cd: ${escapeHtml(
            target
          )}: No such file or directory</span>`;
        } else if (node.type !== 'dir') {
          outputHtml = `<span style="color: #f43f5e;">bash: cd: ${escapeHtml(
            target
          )}: Not a directory</span>`;
        } else {
          nextDir = resolved;
        }
        break;
      }

      case 'ls': {
        let target = activeSession.currentDir;
        let isLong = false;
        for (const a of args) {
          if (a.startsWith('-')) {
            if (a.includes('l')) isLong = true;
          } else {
            target = vfs.resolvePath(activeSession.currentDir, a);
          }
        }
        const items = vfs.listDir(target);
        if (!items) {
          outputHtml = `<span style="color: #f43f5e;">ls: cannot access '${escapeHtml(
            target
          )}': No such file or directory</span>`;
        } else if (isLong) {
          let out = `total ${items.length * 4}\n`;
          for (const item of items) {
            const isDir = item.type === 'dir';
            const col = isDir ? '#38bdf8' : '#e2e8f0';
            const size = item.size ? String(item.size).padStart(6, ' ') : '  4096';
            out += `${item.permissions} 1 ${item.owner} ${item.group} ${size} Sep 25 18:00 <span style="color: ${col}; font-weight: ${
              isDir ? 'bold' : 'normal'
            }">${item.name}${isDir ? '/' : ''}</span>\n`;
          }
          outputHtml = out;
        } else {
          outputHtml = items
            .map((item) => {
              const col = item.type === 'dir' ? '#38bdf8' : '#e2e8f0';
              return `<span style="color: ${col}; font-weight: ${
                item.type === 'dir' ? 'bold' : 'normal'
              }">${escapeHtml(item.name)}${item.type === 'dir' ? '/' : ''}</span>`;
            })
            .join('  ');
        }
        break;
      }

      case 'cat':
      case 'more': {
        if (!args[0]) {
          outputHtml = `${cmd}: missing file operand`;
        } else {
          const resPath = vfs.resolvePath(activeSession.currentDir, args[0]);
          const content = vfs.readFile(resPath);
          outputHtml =
            content === null
              ? `<span style="color: #f43f5e;">${cmd}: ${escapeHtml(
                  args[0]
                )}: No such file or directory</span>`
              : escapeHtml(content);
        }
        break;
      }

      case 'cp': {
        if (args.length < 2) {
          outputHtml = 'cp: missing file operand. Usage: cp &lt;source&gt; &lt;dest&gt;';
        } else {
          const srcRes = vfs.resolvePath(activeSession.currentDir, args[0]);
          const destRes = vfs.resolvePath(activeSession.currentDir, args[1]);
          const ok = vfs.copyNode(srcRes, destRes);
          if (!ok) {
            outputHtml = `<span style="color: #f43f5e;">cp: cannot copy '${escapeHtml(
              args[0]
            )}' to '${escapeHtml(args[1])}'</span>`;
          }
        }
        break;
      }

      case 'mv': {
        if (args.length < 2) {
          outputHtml = 'mv: missing file operand. Usage: mv &lt;source&gt; &lt;dest&gt;';
        } else {
          const srcRes = vfs.resolvePath(activeSession.currentDir, args[0]);
          const destRes = vfs.resolvePath(activeSession.currentDir, args[1]);
          const ok = vfs.moveNode(srcRes, destRes);
          if (!ok) {
            outputHtml = `<span style="color: #f43f5e;">mv: cannot move '${escapeHtml(
              args[0]
            )}' to '${escapeHtml(args[1])}'</span>`;
          }
        }
        break;
      }

      case 'echo':
        outputHtml = escapeHtml(args.join(' '));
        break;

      case 'mkdir': {
        const t = args.find((a) => !a.startsWith('-'));
        if (!t) outputHtml = 'mkdir: missing operand';
        else vfs.createDir(vfs.resolvePath(activeSession.currentDir, t), 'root', 'root');
        break;
      }

      case 'touch': {
        if (!args[0]) outputHtml = 'touch: missing file operand';
        else vfs.writeFile(vfs.resolvePath(activeSession.currentDir, args[0]), '', 'root', '644');
        break;
      }

      case 'rm': {
        const t = args.find((a) => !a.startsWith('-'));
        if (!t) outputHtml = 'rm: missing operand';
        else {
          const ok = vfs.deleteNode(vfs.resolvePath(activeSession.currentDir, t));
          if (!ok)
            outputHtml = `<span style="color: #f43f5e;">rm: cannot remove '${escapeHtml(
              t
            )}': No such file or directory</span>`;
        }
        break;
      }

      case 'history': {
        if (commandHistory.length === 0) {
          outputHtml = '<span style="color: #64748b;">(No recorded command history)</span>';
        } else {
          outputHtml = commandHistory
            .map((h, i) => `${String(i + 1).padStart(4, ' ')}  ${escapeHtml(h)}`)
            .join('\n');
        }
        break;
      }

      case 'hostname':
        outputHtml = 'srv-silvestrike';
        break;

      case 'uname':
        outputHtml = args.includes('-a')
          ? 'Linux srv-silvestrike 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux'
          : 'Linux';
        break;

      case 'date':
        outputHtml = new Date().toUTCString();
        break;

      case 'uptime':
        outputHtml = ' 18:30:00 up 14 days,  6:42,  1 user,  load average: 0.12, 0.08, 0.05';
        break;

      case 'df':
        outputHtml = `Filesystem     1K-blocks      Used Available Use% Mounted on
/dev/nvme0n1p2 960000000  84000000 876000000  10% /
tmpfs            8192000         0   8192000   0% /dev/shm
vfs-storage      1048576       512   1048064   1% /home/silvestrike`;
        break;

      case 'free': {
        const snap = monitor.getSnapshot();
        outputHtml = `
               total        used        free      shared  buff/cache   available
Mem:        16384000     ${String(snap.ramUsed * 1024).padStart(7, ' ')}    ${String(
          (snap.ramTotal - snap.ramUsed) * 1024
        ).padStart(8, ' ')}      128000     2208000    13800000
Swap:        4194304           0     4194304`;
        break;
      }

      case 'ps': {
        const snap = monitor.getSnapshot();
        let out = `<span style="color: #64748b;">  PID USER      PR  NI    VIRT    RES %CPU %MEM     TIME+ COMMAND</span>\n`;
        for (const p of snap.processes) {
          out += `${String(p.pid).padStart(5, ' ')} ${p.user.padEnd(8, ' ')}  20   0  ${p.virt.padStart(
            6,
            ' '
          )} ${p.res.padStart(6, ' ')} ${String(p.cpu).padStart(4, ' ')} ${String(p.mem).padStart(
            4,
            ' '
          )} ${p.time.padStart(9, ' ')} ${escapeHtml(p.cmd)}\n`;
        }
        outputHtml = out;
        break;
      }

      case 'kill': {
        if (!args[0]) outputHtml = 'kill: usage: kill &lt;pid&gt;';
        else {
          const res = monitor.killProcess(parseInt(args[0], 10));
          outputHtml = res.success
            ? `[ok] Process ${args[0]} terminated.`
            : `<span style="color: #f43f5e;">kill: (${args[0]}) - No such process</span>`;
        }
        break;
      }

      case 'systemctl': {
        const action = args[0];
        const unit = args[1];
        if (!action) {
          const all = services.getAll();
          let out = `<span style="color: #64748b;">UNIT                            LOAD   ACTIVE SUB     DESCRIPTION</span>\n`;
          for (const s of all) {
            const col = s.status === 'running' ? '#10b981' : '#f43f5e';
            out += `${s.name.padEnd(32, ' ')} loaded <span style="color: ${col};">${s.status.padEnd(
              6,
              ' '
            )}</span> active  ${escapeHtml(s.description)}\n`;
          }
          outputHtml = out;
        } else if (!unit) {
          outputHtml = 'systemctl: missing service argument';
        } else if (action === 'status') {
          const s = services.get(unit);
          if (!s) outputHtml = `<span style="color: #f43f5e;">Unit ${unit} could not be found.</span>`;
          else {
            const col = s.status === 'running' ? '#10b981' : '#f43f5e';
            outputHtml = `● ${s.name} - ${escapeHtml(s.description)}
     Loaded: loaded (/etc/systemd/system/${s.name}.service; enabled)
     Active: <span style="color: ${col}; font-weight: bold;">${s.status}</span> since Wed 2026-09-24 10:00:00 UTC
   Main PID: ${s.pid || 1024} (${s.name})
      Tasks: 4
     Memory: ${s.memory}
     Uptime: ${s.uptime}`;
          }
        } else if (action === 'start') {
          const res = services.start(unit);
          outputHtml = res.success ? `[ok] ${res.msg}` : `<span style="color: #f43f5e;">${res.msg}</span>`;
        } else if (action === 'stop') {
          const res = services.stop(unit);
          outputHtml = res.success ? `[ok] ${res.msg}` : `<span style="color: #f43f5e;">${res.msg}</span>`;
        } else if (action === 'restart') {
          const res = services.restart(unit);
          outputHtml = res.success ? `[ok] ${res.msg}` : `<span style="color: #f43f5e;">${res.msg}</span>`;
        }
        break;
      }

      case 'journalctl': {
        const list = logManager.getLogs().slice(-10);
        let out = `<span style="color: #64748b;">-- Logs begin at Wed 2026-09-24 12:00:00 UTC. --</span>\n`;
        for (const l of list) {
          const lvlColor =
            l.level === 'ERROR' ? '#f43f5e' : l.level === 'WARN' ? '#f59e0b' : '#38bdf8';
          out += `${l.timestamp.substring(11, 19)} srv-silvestrike ${l.service}[${
            l.id || 1000
          }]: <span style="color: ${lvlColor}; font-weight: bold;">[${l.level}]</span> ${escapeHtml(
            l.message
          )}\n`;
        }
        outputHtml = out;
        break;
      }

      case 'whoami':
      case 'about':
      case 'bio':
        outputHtml = `
<div style="color: #38bdf8; font-weight: bold;">VAN TRONG DUONG (SILVESTRIKE)</div>
<div style="color: #94a3b8;">Full-Stack Developer | AI/ML Engineer | Aspiring Solutions Architect</div>
<div style="color: #cbd5e1; margin-top: 6px;">
  Education: B.Eng in IT @ HUIT (GPA: 3.2/4.0 | IELTS: 6.5)
  Focus: Clean Architecture, Distributed Systems & Deep Learning Pipelines
  Dossier: Type <span style="color: #10b981;">'portfolio'</span> to open full IDE studio.
</div>`;
        break;

      case 'portfolio':
      case 'projects':
        if (onOpenApp) {
          onOpenApp('app-about');
          outputHtml = '[ok] Opening SILVESTRIKE Dossier Studio...';
        }
        break;

      case 'ai':
        if (onOpenApp) {
          onOpenApp('app-ai');
          outputHtml = '[ok] Launching AI Assistant...';
        }
        break;

      case 'odoo':
        if (onOpenApp) {
          onOpenApp('app-odoo');
          outputHtml = '[ok] Launching Odoo Sandbox...';
        }
        break;

      case 'neofetch': {
        const snap = monitor.getSnapshot();
        outputHtml = `
<div style="display: flex; flex-wrap: wrap; gap: 24px; font-family: monospace;">
<pre style="color: #38bdf8; margin: 0; line-height: 1.2;">
         _nnnn_
        dGGGGMMb
       @p~qp~~qMb
       M|@||@) M|
       @,----.JM|
      JS^\\__/  qKL
     dZP        qKRb
    dZP          qKKb
   fZP            SMMb
   HZM            MMMM
   FqM            MMMM
 __| ".        |\\dS"qML
 |    \`-     _.'  \`-r'
  \\_   .--""\`'._
    \`""\`        \`""\`
</pre>
<div style="line-height: 1.4;">
  <span style="color: #38bdf8; font-weight: bold;">root</span>@<span style="color: #38bdf8; font-weight: bold;">srv-silvestrike</span>
  -----------------
  <span style="color: #38bdf8;">OS:</span> Ubuntu 24.04 LTS (SILVESTRIKE Portfolio OS)
  <span style="color: #38bdf8;">Host:</span> Supermicro SYS-1029P-WTR
  <span style="color: #38bdf8;">Kernel:</span> 6.8.0-45-generic
  <span style="color: #38bdf8;">Uptime:</span> 14 days, 6 hours, 42 mins
  <span style="color: #38bdf8;">Packages:</span> 1842 (dpkg)
  <span style="color: #38bdf8;">Shell:</span> bash 5.2.21 [Multi-Session]
  <span style="color: #38bdf8;">Terminal:</span> webos-pts/${activeSession.title}
  <span style="color: #38bdf8;">CPU:</span> Intel Xeon Platinum 8480+ (8) @ 3.800GHz
  <span style="color: #38bdf8;">Memory:</span> ${snap.ramUsed}MiB / ${snap.ramTotal}MiB (${snap.ramPercent}%)
  <span style="color: #38bdf8;">Disk (/):</span> 84G / 960G (10%)
</div>
</div>
`;
        break;
      }

      default:
        outputHtml = `<span style="color: #f43f5e;">bash: ${escapeHtml(
          cmd
        )}: command not found</span>`;
        break;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          currentDir: nextDir,
          lines: [
            ...s.lines,
            promptEntry,
            ...(outputHtml
              ? [{ id: `out-${Date.now()}`, type: 'html' as const, content: outputHtml }]
              : [])
          ]
        };
      })
    );
  };

  const escapeHtml = (str: string) => {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full w-full bg-[#080a0f] flex flex-col font-mono text-xs overflow-hidden select-text"
    >
      {/* Session Tab Bar */}
      <div className="h-7 bg-[#05070c] border-b border-white/10 px-2 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`px-2.5 py-0.5 rounded text-[10px] flex items-center gap-2 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
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

        <div className="text-[10px] text-slate-500 hidden sm:block">
          srv-silvestrike (x86_64)
        </div>
      </div>

      {/* Terminal Viewport */}
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto leading-relaxed">
        {activeSession.lines.map((line) => (
          <div
            key={line.id}
            className="whitespace-pre-wrap break-all mb-1"
            style={{ color: line.color || '#e2e8f0' }}
          >
            {line.type === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: line.content }} />
            ) : (
              line.content
            )}
          </div>
        ))}

        {/* Input line */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-emerald-400 font-semibold whitespace-nowrap">
            {getPromptString(activeSession.currentDir)}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs caret-emerald-400"
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
