/*
Reason for existence: Modular IDE-formatted developer dossier coordinator presenting engineering profile, technical stack, flagship projects, thesis research, and interactive contact channels.
System Impact of Absence: WebOS workspace will lack a dedicated IDE-grade personal dossier and developer portfolio about application.
*/

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { FileId, ActivityTab, AboutMeTerminalAppProps } from './aboutme/types';
import { DOSSIER_FILES } from './aboutme/dossierData';
import { DossierSidebar } from './aboutme/components/DossierSidebar';
import { DossierCliDrawer } from './aboutme/components/DossierCliDrawer';
import { ProfileView } from './aboutme/views/ProfileView';
import { ReadmeView } from './aboutme/views/ReadmeView';
import { SkillsView } from './aboutme/views/SkillsView';
import { ProjectsView } from './aboutme/views/ProjectsView';
import { ThesisView } from './aboutme/views/ThesisView';
import { ContactManualView } from './aboutme/views/ContactManualView';
import { useIsMobile } from '@/lib/breakpoints';
import { DEVELOPER_CONFIG, SYSTEM_CONFIG } from '@/config';

export function AboutMeTerminalApp({ onNotify, onOpenApp }: AboutMeTerminalAppProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<FileId>('profile.yml');
  const [openTabs, setOpenTabs] = useState<FileId[]>([
    'profile.yml',
    'README.md',
    'skills.json',
    'samco-binhtan.ts',
    'thesis-veritas.md'
  ]);
  const [activityBar, setActivityBar] = useState<ActivityTab>('explorer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Default open on desktop/tablet, keep closed by default on mobile
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  const [rootExpanded, setRootExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Integrated CLI state
  const [isCliOpen, setIsCliOpen] = useState(false);
  const [cliInput, setCliInput] = useState('');
  const [cliLogs, setCliLogs] = useState<string[]>([
    'SILVESTRIKE Portfolio OS v2.0 - Dossier IDE Environment',
    "Type 'help', 'fastfetch', 'ls', or 'cat <file>' to navigate files directly."
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
    if (isMobile) {
      setSidebarOpen(false);
    }
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
        '  fastfetch               - Show Arch Linux system specs and open profile',
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
    } else if (cmd === 'fastfetch') {
      handleOpenFile('profile.yml');
      newLogs.push(
        SYSTEM_CONFIG.os.name,
        `WM: ${SYSTEM_CONFIG.os.wm} | Theme: Caelestia Soft Blue`,
        `Host: ${DEVELOPER_CONFIG.name} | Status: ${DEVELOPER_CONFIG.targetRoles}`,
        'Opened profile.yml'
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
          f.id.toLowerCase().replace(/\.(ts|py|cs|md|yml|json|sh|man)$/, '') === arg
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
      <div className="h-9 bg-[#0b0f19] border-b border-white/10 px-2 sm:px-3 flex items-center justify-between gap-2 shrink-0 select-none overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#7aa2f7] shrink-0" />
          <span className="font-bold text-slate-200 tracking-wide text-[10px] sm:text-[11px] truncate">
            <span className="hidden sm:inline">SILVESTRIKE </span>DOSSIER STUDIO
          </span>
          <span className="text-slate-500 text-[10px] hidden md:inline">v2.0 [IDE Mode]</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCliOpen(!isCliOpen)}
            className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] border transition-colors flex items-center gap-1 ${isCliOpen
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'text-slate-400 hover:text-slate-200 border-white/10 hover:bg-white/5'
              }`}
          >
            <span>[CLI]</span>
            <span className="hidden sm:inline">{isCliOpen ? 'Hide' : 'Show'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400">
            <span>git:(main)</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Area (Activity Bar + Sidebar + Editor) */}
      <div className="flex-1 flex overflow-hidden">
        <DossierSidebar
          activityBar={activityBar}
          setActivityBar={setActivityBar}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          rootExpanded={rootExpanded}
          setRootExpanded={setRootExpanded}
          projectsExpanded={projectsExpanded}
          setProjectsExpanded={setProjectsExpanded}
          activeTab={activeTab}
          onOpenFile={handleOpenFile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
        />

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
                  className={`h-full px-3 flex items-center gap-2 cursor-pointer border-r border-white/5 transition-all text-[11px] shrink-0 ${isActive
                    ? 'bg-[#070a12] text-slate-100 font-semibold border-t-2 border-t-[#7aa2f7]'
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
                <span className="text-slate-500">{activeFile.folder}</span>
                <span className="text-slate-600">&gt;</span>
              </>
            )}
            <span className="text-[#89b4fa] font-bold">{activeFile.name}</span>
          </div>

          {/* Editor Body */}
          <div
            ref={editorScrollRef}
            className="flex-1 overflow-y-auto overflow-x-auto p-2.5 sm:p-4 md:p-6 space-y-4 sm:space-y-6 leading-relaxed selection:bg-[#7aa2f7]/30 font-mono text-xs min-w-0"
          >
            {activeTab === 'profile.yml' && <ProfileView />}
            {activeTab === 'README.md' && <ReadmeView />}
            {activeTab === 'skills.json' && <SkillsView />}
            {(activeTab === 'samco-binhtan.ts' ||
              activeTab === 'dogdexx-ai.py' ||
              activeTab === 'doru-agent.py' ||
              activeTab === 'webbantra.cs') && (
                <ProjectsView
                  activeTab={activeTab}
                  onOpenApp={onOpenApp}
                  openRepoText={t.apps?.about?.openRepo}
                  openLiveText={t.apps?.about?.openLive}
                />
              )}
            {activeTab === 'thesis-veritas.md' && <ThesisView />}
            {(activeTab === 'contact.sh' || activeTab === 'manual.man') && (
              <ContactManualView
                activeTab={activeTab}
                copiedKey={copiedKey}
                onCopy={handleCopy}
                sendEmailText={t.apps?.about?.sendEmail}
                copyText={t.apps?.about?.copyEmail}
              />
            )}
          </div>

          {/* Integrated CLI Drawer */}
          <DossierCliDrawer
            isCliOpen={isCliOpen}
            setIsCliOpen={setIsCliOpen}
            cliLogs={cliLogs}
            cliInput={cliInput}
            setCliInput={setCliInput}
            onRunCommand={handleCliCommand}
            cliScrollRef={cliScrollRef}
          />

          {/* IDE Status Bar */}
          <div className="h-6 bg-[#070a12] border-t border-white/10 px-3 flex items-center justify-between text-[10px] text-slate-400 shrink-0 select-none whitespace-nowrap overflow-x-auto scrollbar-none gap-4">
            <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
              <span className="flex items-center gap-1 text-[#7aa2f7] font-bold">
                <span>git:(</span>
                <span>{t.apps?.about?.statusBranch || 'main'}</span>
                <span>)</span>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400">0 errors, 0 warnings</span>
            </div>

            <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
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
