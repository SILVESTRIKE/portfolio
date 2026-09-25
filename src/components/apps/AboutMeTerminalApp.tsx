/*
Reason for existence: IDE-formatted developer dossier presenting engineering profile, technical stack, flagship projects, thesis research, and interactive contact channels.
System impact if absent: WebOS workspace will lack a dedicated IDE-grade personal dossier and developer portfolio about application.
*/

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';

interface AboutMeTerminalAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}

type FileId =
  | 'profile.yml'
  | 'README.md'
  | 'skills.json'
  | 'samco-binhtan.ts'
  | 'dogdexx-ai.py'
  | 'doru-agent.py'
  | 'webbantra.cs'
  | 'thesis-veritas.md'
  | 'contact.sh'
  | 'manual.man';

type ActivityTab = 'explorer' | 'search' | 'git' | 'sysinfo';

interface DossierFile {
  id: FileId;
  name: string;
  folder?: string;
  lang: string;
  badge: string;
  color: string;
  summary: string;
}

const DOSSIER_FILES: DossierFile[] = [
  {
    id: 'profile.yml',
    name: 'profile.yml',
    lang: 'YAML',
    badge: 'YML',
    color: '#f59e0b',
    summary: 'Developer metadata, Neofetch specs, and education credentials'
  },
  {
    id: 'README.md',
    name: 'README.md',
    lang: 'Markdown',
    badge: 'MD',
    color: '#38bdf8',
    summary: 'Executive overview, engineering pillars, and background'
  },
  {
    id: 'skills.json',
    name: 'skills.json',
    lang: 'JSON',
    badge: 'JSON',
    color: '#eab308',
    summary: '6 core dialects, AI/ML tools, web architecture, and databases'
  },
  {
    id: 'samco-binhtan.ts',
    name: 'samco-binhtan.ts',
    folder: 'projects',
    lang: 'TypeScript',
    badge: 'TS',
    color: '#3b82f6',
    summary: 'Samco VinFast EV Sales CMS & E-Commerce platform (Next.js 14, Prisma)'
  },
  {
    id: 'dogdexx-ai.py',
    name: 'dogdexx-ai.py',
    folder: 'projects',
    lang: 'Python',
    badge: 'PY',
    color: '#10b981',
    summary: 'AI-powered dog breed identification with PyTorch CNN & Cloudinary'
  },
  {
    id: 'doru-agent.py',
    name: 'doru-agent.py',
    folder: 'projects',
    lang: 'Python',
    badge: 'PY',
    color: '#10b981',
    summary: 'Desktop voice AI assistant with LangGraph, Whisper, Silero & Groq'
  },
  {
    id: 'webbantra.cs',
    name: 'webbantra.cs',
    folder: 'projects',
    lang: 'C#',
    badge: 'CS',
    color: '#a855f7',
    summary: 'Enterprise tea commerce & WinForms retail POS suite on SQL Server'
  },
  {
    id: 'thesis-veritas.md',
    name: 'thesis-veritas.md',
    lang: 'Markdown',
    badge: 'MD',
    color: '#c084fc',
    summary: 'Graduation Thesis: Veritas AI - Vietnamese Legal & Land Registration RAG'
  },
  {
    id: 'contact.sh',
    name: 'contact.sh',
    lang: 'Shell',
    badge: 'SH',
    color: '#4ade80',
    summary: 'Interactive cURL script, verified email, and social profiles'
  },
  {
    id: 'manual.man',
    name: 'manual.man',
    lang: 'Manpage',
    badge: 'MAN',
    color: '#94a3b8',
    summary: 'UNIX section 1 manpage for SILVESTRIKE software suite'
  }
];

export function AboutMeTerminalApp({ onNotify, onOpenApp }: AboutMeTerminalAppProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<FileId>('profile.yml');
  const [openTabs, setOpenTabs] = useState<FileId[]>([
    'profile.yml',
    'README.md',
    'skills.json',
    'samco-binhtan.ts',
    'thesis-veritas.md'
  ]);
  const [activityBar, setActivityBar] = useState<ActivityTab>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Integrated CLI state
  const [isCliOpen, setIsCliOpen] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([
    'SILVESTRIKE Portfolio OS v2.0 - Dossier IDE Environment',
    "Type 'help', 'ls', or 'cat <file>' to navigate files directly."
  ]);
  const cliScrollRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);

  const activeFile = useMemo(() => {
    return DOSSIER_FILES.find((f) => f.id === activeTab) || DOSSIER_FILES[0];
  }, [activeTab]);

  const handleOpenFile = (fileId: FileId) => {
    if (!openTabs.includes(fileId)) {
      setOpenTabs((prev) => [...prev, fileId]);
    }
    setActiveTab(fileId);
  };

  const handleCloseTab = (fileId: FileId, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabs.filter((id) => id !== fileId);
    if (remaining.length === 0) {
      setOpenTabs(['profile.yml']);
      setActiveTab('profile.yml');
    } else {
      setOpenTabs(remaining);
      if (activeTab === fileId) {
        setActiveTab(remaining[remaining.length - 1]);
      }
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    if (onNotify) {
      onNotify(`${t.apps?.about?.copiedToast || 'Copied'}: ${label}`, 'info');
    }
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCliCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim().toLowerCase();

    const newLogs = [...cliLogs, `$ ${raw}`];

    if (cmd === 'clear' || cmd === 'cls') {
      setCliLogs([]);
      setCliInput('');
      return;
    } else if (cmd === 'help') {
      newLogs.push(
        'Available commands:',
        '  ls                      - List all files in dossier',
        '  cat <file>              - Open and inspect file contents',
        '  whoami                  - Switch to profile.yml',
        '  skills                  - Switch to skills.json',
        '  projects                - Open project files',
        '  thesis                  - Open thesis-veritas.md',
        '  contact                 - Open contact.sh',
        '  git status              - Show git repository status',
        '  clear                   - Clear terminal buffer'
      );
    } else if (cmd === 'ls') {
      newLogs.push(
        'profile.yml       README.md          skills.json',
        'projects/         thesis-veritas.md  contact.sh      manual.man'
      );
    } else if (cmd === 'whoami') {
      handleOpenFile('profile.yml');
      newLogs.push('Opened profile.yml');
    } else if (cmd === 'skills') {
      handleOpenFile('skills.json');
      newLogs.push('Opened skills.json');
    } else if (cmd === 'projects') {
      handleOpenFile('samco-binhtan.ts');
      newLogs.push('Opened projects/samco-binhtan.ts');
    } else if (cmd === 'thesis') {
      handleOpenFile('thesis-veritas.md');
      newLogs.push('Opened thesis-veritas.md');
    } else if (cmd === 'contact') {
      handleOpenFile('contact.sh');
      newLogs.push('Opened contact.sh');
    } else if (cmd === 'git' && arg.startsWith('status')) {
      newLogs.push(
        'On branch main',
        'Your branch is up to date with origin/main.',
        'nothing to commit, working tree clean'
      );
    } else if (cmd === 'cat') {
      const target = DOSSIER_FILES.find(
        (f) =>
          f.id.toLowerCase() === arg ||
          f.id.toLowerCase().replace('.ts', '').replace('.py', '').replace('.cs', '').replace('.md', '').replace('.yml', '').replace('.json', '').replace('.sh', '') === arg
      );
      if (target) {
        handleOpenFile(target.id);
        newLogs.push(`Opened ${target.id}`);
      } else {
        newLogs.push(`cat: ${arg}: No such file. Type 'ls' to see all files.`);
      }
    } else {
      newLogs.push(`Command not recognized: '${cmd}'. Type 'help' for command listing.`);
    }

    setCliLogs(newLogs);
    setCliInput('');
  };

  useEffect(() => {
    if (editorScrollRef.current) {
      editorScrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    if (cliScrollRef.current) {
      cliScrollRef.current.scrollTop = cliScrollRef.current.scrollHeight;
    }
  }, [cliLogs]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return DOSSIER_FILES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.lang.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="h-full w-full flex flex-col bg-[#080c14] text-slate-200 font-mono text-xs select-text overflow-hidden">
      {/* Top Application Bar */}
      <div className="h-9 bg-[#0b0f19] border-b border-white/10 px-3 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="font-bold text-slate-200 tracking-wide text-[11px]">
            SILVESTRIKE DOSSIER STUDIO
          </span>
          <span className="text-slate-500 text-[10px]">v2.0 [IDE Mode]</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCliOpen(!isCliOpen)}
            className={`px-2 py-0.5 rounded text-[10px] border transition-colors flex items-center gap-1.5 ${
              isCliOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/5'
            }`}
          >
            <span>[TERMINAL]</span>
            <span>{isCliOpen ? 'Hide' : 'Show'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>git:(main)</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area (Activity Bar + Sidebar + Editor) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (48px) */}
        <div className="w-12 bg-[#060910] border-r border-white/10 flex flex-col items-center py-2 gap-3 shrink-0 select-none">
          <button
            onClick={() => {
              if (activityBar === 'explorer' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setActivityBar('explorer');
                setSidebarOpen(true);
              }
            }}
            title={t.apps?.about?.activityExplorer || 'Explorer'}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${
              activityBar === 'explorer' && sidebarOpen
                ? 'bg-white/10 text-sky-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activityBar === 'explorer' && sidebarOpen && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-sky-400 rounded-r" />
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (activityBar === 'search' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setActivityBar('search');
                setSidebarOpen(true);
              }
            }}
            title={t.apps?.about?.activitySearch || 'Search'}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${
              activityBar === 'search' && sidebarOpen
                ? 'bg-white/10 text-sky-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activityBar === 'search' && sidebarOpen && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-sky-400 rounded-r" />
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (activityBar === 'git' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setActivityBar('git');
                setSidebarOpen(true);
              }
            }}
            title={t.apps?.about?.activityGit || 'Source Control'}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${
              activityBar === 'git' && sidebarOpen
                ? 'bg-white/10 text-sky-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activityBar === 'git' && sidebarOpen && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-sky-400 rounded-r" />
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (activityBar === 'sysinfo' && sidebarOpen) {
                setSidebarOpen(false);
              } else {
                setActivityBar('sysinfo');
                setSidebarOpen(true);
              }
            }}
            title={t.apps?.about?.activitySysinfo || 'Neofetch Specs'}
            className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${
              activityBar === 'sysinfo' && sidebarOpen
                ? 'bg-white/10 text-sky-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {activityBar === 'sysinfo' && sidebarOpen && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-sky-400 rounded-r" />
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </button>

          <div className="mt-auto flex flex-col items-center gap-2 text-[9px] text-slate-500">
            <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-sky-300 font-bold">
              DEV
            </span>
          </div>
        </div>

        {/* Sidebar Panel (220px) */}
        {sidebarOpen && (
          <div className="w-56 bg-[#0a0e18] border-r border-white/10 flex flex-col shrink-0 select-none overflow-hidden">
            {/* Explorer Header */}
            {activityBar === 'explorer' && (
              <>
                <div className="h-8 px-3 border-b border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{t.apps?.about?.sidebarTitle || 'EXPLORER: SILVESTRIKE'}</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-slate-500 hover:text-slate-300"
                    title="Collapse Sidebar"
                  >
                    [x]
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <span className="text-slate-500">▼</span>
                    <span>SILVESTRIKE</span>
                  </div>

                  {/* Root dossier files */}
                  {DOSSIER_FILES.filter((f) => !f.folder).map((file) => {
                    const isSelected = activeTab === file.id;
                    return (
                      <button
                        key={file.id}
                        onClick={() => handleOpenFile(file.id)}
                        className={`w-full text-left px-5 py-1.5 flex items-center justify-between text-[11px] transition-colors ${
                          isSelected
                            ? 'bg-sky-500/15 text-sky-300 font-semibold border-l-2 border-sky-400'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="text-[9px] font-bold px-1 rounded uppercase shrink-0"
                            style={{ backgroundColor: `${file.color}20`, color: file.color }}
                          >
                            {file.badge}
                          </span>
                          <span className="truncate">{file.name}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Projects folder */}
                  <div className="pt-2">
                    <button
                      onClick={() => setProjectsExpanded(!projectsExpanded)}
                      className="w-full text-left px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase hover:text-slate-200"
                    >
                      <span className="text-slate-500">{projectsExpanded ? '▼' : '▶'}</span>
                      <span>projects/</span>
                    </button>

                    {projectsExpanded && (
                      <div className="space-y-0.5">
                        {DOSSIER_FILES.filter((f) => f.folder === 'projects').map((file) => {
                          const isSelected = activeTab === file.id;
                          return (
                            <button
                              key={file.id}
                              onClick={() => handleOpenFile(file.id)}
                              className={`w-full text-left pl-8 pr-4 py-1.5 flex items-center justify-between text-[11px] transition-colors ${
                                isSelected
                                  ? 'bg-sky-500/15 text-sky-300 font-semibold border-l-2 border-sky-400'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className="text-[9px] font-bold px-1 rounded uppercase shrink-0"
                                  style={{ backgroundColor: `${file.color}20`, color: file.color }}
                                >
                                  {file.badge}
                                </span>
                                <span className="truncate">{file.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Search Panel */}
            {activityBar === 'search' && (
              <div className="flex-1 flex flex-col p-3 space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {t.apps?.about?.searchTitle || 'SEARCH: DOSSIER GREP'}
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 text-[10px]">$</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.apps?.about?.searchPlaceholder || 'grep -i "..."'}
                    className="w-full bg-white/5 border border-white/10 rounded pl-6 pr-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-400 placeholder-slate-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                  {searchQuery && searchResults.length === 0 && (
                    <div className="text-slate-500 text-[11px] p-2">
                      {t.apps?.about?.noResults || 'No matches found.'}
                    </div>
                  )}
                  {searchResults.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => handleOpenFile(file.id)}
                      className="w-full text-left p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded space-y-1 transition-colors"
                    >
                      <div className="text-sky-300 font-bold text-xs flex items-center gap-1.5">
                        <span style={{ color: file.color }}>[{file.badge}]</span>
                        <span>{file.name}</span>
                      </div>
                      <div className="text-slate-400 text-[10px] leading-snug line-clamp-2">
                        {file.summary}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source Control Panel */}
            {activityBar === 'git' && (
              <div className="flex-1 p-3 space-y-3 text-[11px]">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {t.apps?.about?.gitTitle || 'SOURCE CONTROL: GIT'}
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/10 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Branch</span>
                    <span className="text-emerald-400 font-bold">main</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Remote</span>
                    <span className="text-sky-300 font-mono text-[10px]">origin</span>
                  </div>
                  <div className="text-slate-500 text-[10px] pt-2 border-t border-white/5">
                    {t.apps?.about?.gitClean || 'Working tree clean. All changes committed.'}
                  </div>
                </div>

                <div className="space-y-1 text-[10px] text-slate-400 pt-2">
                  <div className="font-bold text-slate-300 uppercase">Repository:</div>
                  <a
                    href="https://github.com/SILVESTRIKE/portfolio"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline block break-all font-mono"
                  >
                    github.com/SILVESTRIKE/portfolio
                  </a>
                </div>
              </div>
            )}

            {/* System Info Panel */}
            {activityBar === 'sysinfo' && (
              <div className="flex-1 p-3 space-y-3 text-[11px] overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  SYSTEM PROFILE (NEOFETCH)
                </div>
                <div className="p-2.5 bg-black/40 border border-white/10 rounded space-y-2 text-[10px]">
                  <div className="text-sky-300 font-bold">duong@silvestrike</div>
                  <div className="border-b border-white/10 pb-1 text-slate-500">-----------------</div>
                  <div><span className="text-sky-400">OS:</span> Human, Vietnam build [VN]</div>
                  <div><span className="text-sky-400">Host:</span> HUIT B.Eng IT</div>
                  <div><span className="text-sky-400">Metrics:</span> GPA 3.2 | IELTS 6.5</div>
                  <div><span className="text-sky-400">Shell:</span> bash / Python / TS</div>
                  <div><span className="text-sky-400">Kernel:</span> WebOS 2.0</div>
                  <div><span className="text-sky-400">Uptime:</span> 22 years (Senior)</div>
                  <div><span className="text-sky-400">Status:</span> Open for SWE / AI</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#070a12] overflow-hidden">
          {/* Tab Bar */}
          <div className="h-9 bg-[#0c101c] border-b border-white/10 flex items-center px-1 overflow-x-auto scrollbar-none shrink-0 select-none">
            {openTabs.map((tabId) => {
              const file = DOSSIER_FILES.find((f) => f.id === tabId);
              if (!file) return null;
              const isActive = activeTab === tabId;
              return (
                <div
                  key={tabId}
                  onClick={() => setActiveTab(tabId)}
                  className={`h-full px-3 flex items-center gap-2 cursor-pointer border-r border-white/5 transition-all text-[11px] shrink-0 ${
                    isActive
                      ? 'bg-[#070a12] text-slate-100 font-semibold border-t-2 border-t-sky-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: file.color }}
                  />
                  <span>{file.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(tabId, e)}
                    className="ml-1 text-slate-500 hover:text-rose-400 text-[10px] rounded px-1 transition-colors"
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>

          {/* Breadcrumb Bar */}
          <div className="h-6 bg-[#0a0e18] border-b border-white/5 px-4 flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 select-none">
            <span className="text-slate-500">silvestrike</span>
            <span className="text-slate-600">&gt;</span>
            {activeFile.folder && (
              <>
                <span className="text-slate-400">{activeFile.folder}</span>
                <span className="text-slate-600">&gt;</span>
              </>
            )}
            <span className="text-sky-300 font-semibold">{activeFile.name}</span>
          </div>

          {/* Editor Body */}
          <div
            ref={editorScrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 leading-relaxed selection:bg-sky-500/30 font-mono text-xs"
          >
            {/* VIEW: profile.yml */}
            {activeTab === 'profile.yml' && (
              <div className="space-y-6 max-w-4xl">
                {/* Neofetch Hero Box */}
                <div className="border border-sky-500/30 bg-black/50 rounded-lg p-4 md:p-5 space-y-4">
                  {/* Compact ASCII Art */}
                  <pre className="text-sky-400 text-[10px] md:text-xs leading-none overflow-x-auto select-none font-bold">
{`   _____ _____ _    _    _ ______  _____ _______ _____  _____ _  _______ 
  / ____|_   _| |  | |  | |  ____|/ ____|__   __|  __ \\|_   _| |/ /  ____|
 | (___   | | | |  | |  | | |__  | (___    | |  | |__) | | | | ' /| |__   
  \\___ \\  | | | |  | |/\\| |  __|  \\___ \\   | |  |  _  /  | | |  < |  __|  
  ____) |_| |_| |__\\  /\\  / |____ ____) |  | |  | | \\ \\ _| |_| . \\| |____ 
 |_____/|_____|_____\\/  \\/|______|_____/   |_|  |_|  \\_\\_____|_|\\_\\______|`}
                  </pre>

                  {/* Neofetch Key-Value Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                    <div>
                      <span className="text-emerald-400 font-bold">duong@silvestrike</span>
                      <span className="text-slate-500 ml-2">------------------------</span>
                    </div>
                    <div>
                      <span className="text-sky-400">Terminal:</span> silvestrike-ide-v2
                    </div>

                    <div>
                      <span className="text-sky-400">OS:</span> Human, Vietnam build [VN]
                    </div>
                    <div>
                      <span className="text-sky-400">Host:</span> HUIT (Information Technology)
                    </div>

                    <div>
                      <span className="text-sky-400">Degree:</span> B.Eng in IT (Final Year)
                    </div>
                    <div>
                      <span className="text-sky-400">GPA / IELTS:</span> 3.2 / 4.0 | 6.5 Academic
                    </div>

                    <div>
                      <span className="text-sky-400">Shell:</span> bash / Python / TypeScript
                    </div>
                    <div>
                      <span className="text-sky-400">Kernel:</span> WebOS 2.0 Tiling Desktop
                    </div>

                    <div>
                      <span className="text-sky-400">Status:</span> Open for SWE / AI-ML Roles
                    </div>
                    <div>
                      <span className="text-sky-400">Uptime:</span> 22 years
                    </div>
                  </div>

                  {/* ANSI 8-Color Palette Squares */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 select-none">
                    {['#000000', '#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7', '#06b6d4', '#e2e8f0'].map(
                      (c, i) => (
                        <div
                          key={i}
                          className="w-5 h-3 rounded-sm border border-white/10"
                          style={{ backgroundColor: c }}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Formatted YAML View */}
                <div className="bg-[#0b0f19] border border-white/10 rounded-lg p-4 font-mono text-[11px] leading-relaxed">
                  <div className="text-slate-500 pb-2 border-b border-white/5 mb-3">
                    # profile.yml - Canonical developer configuration
                  </div>
                  <pre className="text-slate-300 overflow-x-auto">
                    <span className="text-amber-400">developer</span>:
                    {'\n'}  <span className="text-sky-400">name</span>: <span className="text-emerald-300">"Van Trong Duong"</span>
                    {'\n'}  <span className="text-sky-400">alias</span>: <span className="text-emerald-300">"SILVESTRIKE"</span>
                    {'\n'}  <span className="text-sky-400">title</span>: <span className="text-emerald-300">"Full-Stack Developer | AI/ML Engineer | Solutions Architect"</span>
                    {'\n'}  <span className="text-sky-400">location</span>: <span className="text-emerald-300">"Ho Chi Minh City, Vietnam"</span>
                    {'\n'}  <span className="text-sky-400">education</span>:
                    {'\n'}    <span className="text-sky-400">university</span>: <span className="text-emerald-300">"Ho Chi Minh City University of Industry and Trade (HUIT)"</span>
                    {'\n'}    <span className="text-sky-400">degree</span>: <span className="text-emerald-300">"Bachelor of Engineering in Information Technology"</span>
                    {'\n'}    <span className="text-sky-400">gpa</span>: <span className="text-emerald-300">"3.2 / 4.0"</span>
                    {'\n'}    <span className="text-sky-400">ielts</span>: <span className="text-emerald-300">"6.5 Academic"</span>
                    {'\n'}    <span className="text-sky-400">timeline</span>: <span className="text-emerald-300">"2022 - 2026 (Final-year thesis & R&D)"</span>
                    {'\n'}  <span className="text-amber-400">engineering_philosophy</span>:
                    {'\n'}    - <span className="text-emerald-300">"Clean Architecture & strictly decoupled services over ad-hoc scripts"</span>
                    {'\n'}    - <span className="text-emerald-300">"High test coverage with clear bounded contexts and validation schemas"</span>
                    {'\n'}    - <span className="text-emerald-300">"Bridging deep learning models with high-throughput production infrastructure"</span>
                  </pre>
                </div>
              </div>
            )}

            {/* VIEW: README.md */}
            {activeTab === 'README.md' && (
              <div className="space-y-6 max-w-4xl">
                <div className="border border-white/10 bg-[#0b0f19] rounded-lg p-5 space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h1 className="text-lg font-bold text-sky-400">
                      SILVESTRIKE - Van Trong Duong
                    </h1>
                    <p className="text-slate-400 text-xs mt-1">
                      Full-Stack Web Architect & AI/ML Systems Engineer based in Ho Chi Minh City.
                    </p>
                  </div>

                  <div className="space-y-3 text-slate-300 text-[11px] leading-relaxed">
                    <p>
                      I am a final-year Information Technology Engineering student with extensive hands-on experience in building and deploying end-to-end full-stack platforms and AI architectures.
                    </p>
                    <p>
                      My technical background bridges high-throughput web backends (Next.js, Node.js, ASP.NET Core) with deep learning systems (PyTorch, LangGraph, OpenCV, Speech & NLP pipelines).
                      I specialize in constructing maintainable software that remains stable under load, with rigorous automated testing and deterministic state management.
                    </p>
                  </div>

                  {/* Architecture Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded space-y-1.5">
                      <div className="text-sky-400 font-bold">[1] Clean Architecture</div>
                      <p className="text-slate-400 text-[10px]">
                        Controller-Service separation, strict boundary schema validation, and zero business logic leakage.
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded space-y-1.5">
                      <div className="text-emerald-400 font-bold">[2] Applied AI/ML</div>
                      <p className="text-slate-400 text-[10px]">
                        Production RAG pipelines, voice assistants (STT/TTS/VAD), and computer vision classification engines.
                      </p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded space-y-1.5">
                      <div className="text-purple-400 font-bold">[3] Cloud & Linux</div>
                      <p className="text-slate-400 text-[10px]">
                        Linux workstation proficiency, Docker containerization, CI/CD automation, and relational database tuning.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: skills.json */}
            {activeTab === 'skills.json' && (
              <div className="space-y-6 max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Languages */}
                  <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sky-400 font-bold text-xs">
                        [1] CORE PROGRAMMING LANGUAGES
                      </span>
                      <span className="text-[10px] text-slate-500">6 DIALECTS</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'Python', role: 'Primary / PyTorch / Fast', grade: 'Advanced' },
                        { name: 'TypeScript', role: 'Next.js 14-15 / Node.js', grade: 'Advanced' },
                        { name: 'JavaScript', role: 'Modern ESNext / Browser VFS', grade: 'Advanced' },
                        { name: 'C#', role: 'ASP.NET Core / WinForms', grade: 'Proficient' },
                        { name: 'PHP', role: 'Laravel MVC Architecture', grade: 'Proficient' },
                        { name: 'SQL', role: 'PostgreSQL / SQL Server', grade: 'Advanced' }
                      ].map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded text-[11px]"
                        >
                          <div>
                            <span className="text-slate-200 font-bold">{item.name}</span>
                            <span className="text-slate-500 text-[10px] ml-2">({item.role})</span>
                          </div>
                          <span className="text-sky-400 text-[10px] font-mono">{item.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI & Deep Learning */}
                  <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-xs">
                        [2] AI & DEEP LEARNING STACK
                      </span>
                      <span className="text-[10px] text-slate-500">CV & LLMS</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'PyTorch', 'TensorFlow', 'OpenCV', 'MediaPipe', 'YOLO',
                        'LangGraph', 'LangChain', 'Silero VAD', 'Whisper STT',
                        'Kokoro TTS', 'Jupyter Lab', 'RAG Pipelines', 'Vector DBs'
                      ].map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[11px] text-emerald-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Full-Stack Web */}
                  <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400 font-bold text-xs">
                        [3] WEB ARCHITECTURE & FRAMEWORKS
                      </span>
                      <span className="text-[10px] text-slate-500">FRONT & BACKEND</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Next.js 14/15', 'React.js 19', 'Node.js', 'Express.js',
                        'ASP.NET Core', '.NET WinForms', 'Laravel', 'REST APIs',
                        'WebSocket', 'Clean Architecture', 'Prisma ORM', 'TailwindCSS'
                      ].map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[11px] text-purple-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cloud, DevOps & Databases */}
                  <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-xs">
                        [4] DATABASES & CLOUD DEVOPS
                      </span>
                      <span className="text-[10px] text-slate-500">INFRASTRUCTURE</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'PostgreSQL', 'MongoDB', 'Microsoft SQL Server', 'Prisma ORM',
                        'Docker Containers', 'Linux / Ubuntu', 'Git / GitHub', 'CI/CD Pipelines',
                        'Cloudinary', 'Vercel Edge', 'Nginx', 'Hyprland Linux'
                      ].map((tool) => (
                        <span
                          key={tool}
                          className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[11px] text-amber-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: samco-binhtan.ts */}
            {activeTab === 'samco-binhtan.ts' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-sky-500/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-sky-400">samco-binhtan-webapp</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Samco VinFast EV Sales CMS & E-Commerce Platform
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded text-[10px] font-bold">
                      INTERNSHIP 2025
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Enterprise automotive management platform built for Samco Binh Tan dealership. Engineered dynamic vehicle configuration catalogs, inventory bookkeeping, and lead processing pipelines. Implemented with Next.js 14 App Router, Prisma ORM, and high-concurrency Express APIs.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 bg-white/5 rounded">TypeScript</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Next.js 14</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Node.js</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Prisma ORM</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">PostgreSQL</span>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href="https://github.com/SILVESTRIKE/samco-binhtan-webapp"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-black rounded text-[11px] font-bold transition-colors"
                    >
                      {t.apps?.about?.openRepo || 'View Repository'} &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: dogdexx-ai.py */}
            {activeTab === 'dogdexx-ai.py' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-emerald-400">DogDexx</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Intelligent Dog Species Identification & Health Records
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                      DEPLOYED LIVE
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    AI-powered computer vision identification platform combining CNN deep learning inference with pet health record bookkeeping. Deployed on Vercel Edge with Cloudinary image streaming.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 bg-white/5 rounded">PyTorch CNN</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Next.js</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">MongoDB</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Cloudinary CDN</span>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href="https://dogdexx.vercel.app"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded text-[11px] font-bold transition-colors"
                    >
                      {t.apps?.about?.openLive || 'Visit Live Application'} &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: doru-agent.py */}
            {activeTab === 'doru-agent.py' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-emerald-400">Doru_AI Desktop Assistant</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Personal Desktop AI Assistant on Linux Hyprland
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                      HOST ENGINE
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Offline-first desktop voice agent orchestrating an 8-node LangGraph, Silero VAD, RepCNN wakeword detector, faster-whisper STT, Kokoro ONNX TTS, and dual Groq LPU / Agnes 2.0 LLMs.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 bg-white/5 rounded">Python</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">LangGraph</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Silero VAD</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Whisper STT</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Groq LPU</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenApp && onOpenApp('app-ai')}
                      className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded text-[11px] font-bold transition-colors"
                    >
                      Open AI Assistant in WebOS &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: webbantra.cs */}
            {activeTab === 'webbantra.cs' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-purple-400">WebBanTra & CafePOS</h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        E-Commerce Platform & WinForms Retail POS Suite
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
                      COURSEWORK 2024
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    End-to-end commerce platforms built with ASP.NET Core, C# WinForms, and relational SQL Server with stored procedures for real-time inventory management and invoice tracking.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="px-2 py-0.5 bg-white/5 rounded">C#</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">ASP.NET Core</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">WinForms</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded">Microsoft SQL Server</span>
                  </div>

                  <div className="pt-2">
                    <a
                      href="https://github.com/SILVESTRIKE/WebBanTra"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-black rounded text-[11px] font-bold transition-colors inline-block"
                    >
                      {t.apps?.about?.openRepo || 'View Repository'} &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: thesis-veritas.md */}
            {activeTab === 'thesis-veritas.md' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-purple-300">
                        GRADUATION THESIS: VERITAS AI
                      </h2>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Vietnamese Land Registration Legal Intelligence & RAG Pipeline
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
                      IN PROGRESS (2025-2026)
                    </span>
                  </div>

                  <p className="text-slate-200 text-[11px] leading-relaxed">
                    Veritas is an AI-powered enterprise pipeline specialized in digitizing and querying Vietnamese land registration records and legal texts using advanced Retrieval-Augmented Generation (RAG) architecture and fine-tuned LLMs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white/[0.02] rounded border border-white/5">
                      <div className="text-purple-400 font-bold mb-1">[1] RAG Pipeline</div>
                      <div className="text-slate-400 text-[10px]">
                        Hybrid dense and sparse embeddings with vector store reranking algorithms.
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] rounded border border-white/5">
                      <div className="text-sky-400 font-bold mb-1">[2] Fine-Tuning</div>
                      <div className="text-slate-400 text-[10px]">
                        Domain-specific legal parameter tuning and evaluation on administrative cases.
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] rounded border border-white/5">
                      <div className="text-emerald-400 font-bold mb-1">[3] High Impact</div>
                      <div className="text-slate-400 text-[10px]">
                        Zero-latency compliance lookups for Vietnamese public administration records.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: contact.sh */}
            {activeTab === 'contact.sh' && (
              <div className="space-y-4 max-w-4xl">
                <div className="p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-emerald-400">contact.sh</h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Direct Communication Channels & Verified Profiles
                    </p>
                  </div>

                  <p className="text-slate-300 text-[11px]">
                    I am actively seeking Software Engineer (Full-stack / Backend) and AI/ML Engineer opportunities. I respond promptly to all professional inquiries.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {/* Email */}
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-slate-500 text-[10px] font-bold">EMAIL ADDRESS</div>
                        <div className="text-slate-100 font-bold text-xs truncate mt-0.5">
                          vtduong04@gmail.com
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="mailto:vtduong04@gmail.com"
                          className="px-2.5 py-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-black rounded text-[10px] font-bold transition-colors"
                        >
                          {t.apps?.about?.sendEmail || 'Send Email'}
                        </a>
                        <button
                          onClick={() => handleCopy('vtduong04@gmail.com', 'Email')}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] transition-colors"
                        >
                          {copiedKey === 'Email' ? 'Copied!' : t.apps?.about?.copyEmail || 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Facebook */}
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-slate-500 text-[10px] font-bold">FACEBOOK SOCIAL</div>
                        <div className="text-slate-100 font-bold text-xs truncate mt-0.5">
                          fb.com/hakudevon
                        </div>
                      </div>
                      <a
                        href="https://www.facebook.com/hakudevon"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white rounded text-[10px] font-bold transition-colors text-center"
                      >
                        Open Profile &rarr;
                      </a>
                    </div>

                    {/* GitHub */}
                    <div className="p-3 bg-white/[0.02] border border-white/10 rounded-lg flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-slate-500 text-[10px] font-bold">GITHUB REPOSITORIES</div>
                        <div className="text-slate-100 font-bold text-xs truncate mt-0.5">
                          github.com/SILVESTRIKE
                        </div>
                      </div>
                      <a
                        href="https://github.com/SILVESTRIKE"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white/10 text-slate-200 hover:bg-white/20 rounded text-[10px] font-bold transition-colors text-center"
                      >
                        View Repositories &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: manual.man */}
            {activeTab === 'manual.man' && (
              <div className="space-y-4 max-w-4xl font-mono text-[11px] leading-relaxed">
                <div className="p-5 bg-black/60 border border-white/10 rounded-lg space-y-4">
                  <div>
                    <span className="text-sky-400 font-bold">NAME</span>
                    <p className="text-slate-300 ml-4">
                      silvestrike - Van Trong Duong, software engineer & AI researcher
                    </p>
                  </div>

                  <div>
                    <span className="text-sky-400 font-bold">SYNOPSIS</span>
                    <p className="text-slate-300 ml-4">
                      silvestrike [--fullstack] [--ai-ml] [--architecture] [--hire]
                    </p>
                  </div>

                  <div>
                    <span className="text-sky-400 font-bold">DESCRIPTION</span>
                    <p className="text-slate-300 ml-4">
                      Graduating IT engineer specializing in robust web services, PyTorch deep learning models, and system architecture.
                      Driven by Clean Architecture, high test coverage, and modular microservices.
                    </p>
                  </div>

                  <div>
                    <span className="text-sky-400 font-bold">FILES</span>
                    <div className="text-slate-400 ml-4 space-y-1 mt-1">
                      <div><span className="text-emerald-400">profile.yml</span> - System profile & academic background</div>
                      <div><span className="text-emerald-400">skills.json</span> - 6 core programming dialects & framework matrix</div>
                      <div><span className="text-emerald-400">samco-binhtan.ts</span> - VinFast EV sales CMS e-commerce platform</div>
                      <div><span className="text-emerald-400">dogdexx-ai.py</span> - PyTorch CNN computer vision dog breed identification</div>
                      <div><span className="text-emerald-400">doru-agent.py</span> - Linux voice desktop assistant engine</div>
                      <div><span className="text-emerald-400">thesis-veritas.md</span> - Veritas Vietnamese land law RAG pipeline</div>
                      <div><span className="text-emerald-400">contact.sh</span> - Direct communication channels</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Integrated CLI Drawer (Collapsible) */}
          {isCliOpen && (
            <div className="h-44 bg-[#060a12] border-t border-white/10 flex flex-col shrink-0">
              <div className="h-6 bg-[#090d16] px-3 flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 select-none">
                <span className="font-bold text-sky-400">
                  {t.apps?.about?.terminalTitle || 'INTEGRATED TERMINAL'}
                </span>
                <button
                  onClick={() => setIsCliOpen(false)}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  [Close]
                </button>
              </div>

              <div
                ref={cliScrollRef}
                className="flex-1 overflow-y-auto p-2.5 font-mono text-[11px] space-y-1 text-slate-300"
              >
                {cliLogs.map((log, idx) => (
                  <div key={idx} className={log.startsWith('$') ? 'text-sky-300 font-bold' : ''}>
                    {log}
                  </div>
                ))}
              </div>

              <div className="p-1.5 bg-[#080c14] border-t border-white/5 flex items-center gap-2">
                <span className="text-emerald-400 font-bold text-[11px] pl-2 font-mono">
                  silvestrike@ide:~$
                </span>
                <input
                  type="text"
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCliCommand(cliInput);
                  }}
                  placeholder="Type 'help', 'ls', 'whoami', 'skills', 'thesis'..."
                  className="flex-1 bg-transparent text-xs text-slate-100 outline-none font-mono placeholder-slate-600"
                />
                <button
                  onClick={() => handleCliCommand(cliInput)}
                  className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded text-[10px] font-bold hover:bg-sky-500 hover:text-black transition-colors"
                >
                  Run
                </button>
              </div>
            </div>
          )}

          {/* IDE Status Bar */}
          <div className="h-6 bg-[#070a12] border-t border-white/10 px-3 flex items-center justify-between text-[10px] text-slate-400 shrink-0 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sky-400 font-bold">
                <span>git:(</span>
                <span>{t.apps?.about?.statusBranch || 'main'}</span>
                <span>)</span>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">0 errors, 0 warnings</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Ln 1, Col 1</span>
              <span className="text-slate-500">|</span>
              <span>{t.apps?.about?.statusSpaces || 'Spaces: 2'}</span>
              <span className="text-slate-500">|</span>
              <span>{t.apps?.about?.statusEncoding || 'UTF-8'}</span>
              <span className="text-slate-500">|</span>
              <span className="px-1.5 py-0.2 bg-white/5 border border-white/10 rounded text-slate-300 font-bold">
                {activeFile.lang}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
