/*
Reason for existence: Sidebar module containing activity bar tabs, file tree explorer, grep search panel, and git status for the Dossier Studio.
System Impact of Absence: Dossier studio will have no navigation bar, file explorer tree, or search interface.
*/

'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ActivityTab, DossierFile, FileId } from '../types';
import { DOSSIER_FILES } from '../dossierData';

interface DossierSidebarProps {
  activityBar: ActivityTab;
  setActivityBar: (tab: ActivityTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  rootExpanded: boolean;
  setRootExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  projectsExpanded: boolean;
  setProjectsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: FileId;
  onOpenFile: (fileId: FileId) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: DossierFile[];
}

export function DossierSidebar({
  activityBar,
  setActivityBar,
  sidebarOpen,
  setSidebarOpen,
  rootExpanded,
  setRootExpanded,
  projectsExpanded,
  setProjectsExpanded,
  activeTab,
  onOpenFile,
  searchQuery,
  setSearchQuery,
  searchResults
}: DossierSidebarProps) {
  const { t } = useI18n();

  return (
    <>
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
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${activityBar === 'explorer' && sidebarOpen
            ? 'bg-white/10 text-[#7aa2f7]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
        >
          {activityBar === 'explorer' && sidebarOpen && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#7aa2f7] rounded-r" />
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
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${activityBar === 'search' && sidebarOpen
            ? 'bg-white/10 text-[#7aa2f7]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
        >
          {activityBar === 'search' && sidebarOpen && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#7aa2f7] rounded-r" />
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
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${activityBar === 'git' && sidebarOpen
            ? 'bg-white/10 text-[#7aa2f7]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
        >
          {activityBar === 'git' && sidebarOpen && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#7aa2f7] rounded-r" />
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
          title={t.apps?.about?.activitySysinfo || 'Specs'}
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative ${activityBar === 'sysinfo' && sidebarOpen
            ? 'bg-white/10 text-[#7aa2f7]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
        >
          {activityBar === 'sysinfo' && sidebarOpen && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#7aa2f7] rounded-r" />
          )}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </button>

        <div className="mt-auto flex flex-col items-center gap-2 text-[9px] text-slate-500">
          <span className="px-1 py-0.5 bg-white/5 rounded border border-white/10 text-[#89b4fa] font-bold">
            DEV
          </span>
        </div>
      </div>

      {/* Sidebar Panel (~176px - 208px) */}
      {sidebarOpen && (
        <div className="w-44 sm:w-52 bg-[#0a0e18] border-r border-white/10 flex flex-col shrink-0 select-none overflow-hidden">
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
                <button
                  onClick={() => setRootExpanded(!rootExpanded)}
                  className="w-full px-3 py-1 text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 hover:text-slate-200 text-left transition-colors"
                >
                  <span className="text-slate-500">{rootExpanded ? '▼' : '▶'}</span>
                  <span>SILVESTRIKE</span>
                </button>

                {/* Root dossier files */}
                {rootExpanded && DOSSIER_FILES.filter((f) => !f.folder).map((file) => {
                  const isSelected = activeTab === file.id;
                  return (
                    <button
                      key={file.id}
                      onClick={() => onOpenFile(file.id)}
                      className={`w-full px-4 py-1 flex items-center justify-between text-[11px] font-mono transition-colors text-left ${isSelected
                        ? 'bg-[#7aa2f7]/20 text-[#89b4fa] font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="px-1 py-0.2 rounded text-[9px] font-bold uppercase"
                          style={{ backgroundColor: `${file.color}20`, color: file.color }}
                        >
                          {file.badge}
                        </span>
                        <span className="truncate">{file.name}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Projects Folder */}
                <div className="pt-2">
                  <button
                    onClick={() => setProjectsExpanded(!projectsExpanded)}
                    className="w-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase hover:text-slate-200"
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
                            onClick={() => onOpenFile(file.id)}
                            className={`w-full pl-7 pr-3 py-1 flex items-center justify-between text-[11px] font-mono transition-colors text-left ${isSelected
                              ? 'bg-[#7aa2f7]/20 text-[#89b4fa] font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                              }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className="px-1 py-0.2 rounded text-[9px] font-bold uppercase"
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
                  className="w-full bg-white/5 border border-white/10 rounded pl-6 pr-2 py-1.5 text-xs text-slate-100 outline-none focus:border-[#7aa2f7] placeholder-slate-500"
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
                    onClick={() => onOpenFile(file.id)}
                    className="w-full text-left p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded space-y-1 transition-colors"
                  >
                    <div className="text-[#89b4fa] font-bold text-xs flex items-center gap-1.5">
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
                  <span className="text-[#89b4fa] font-mono text-[10px]">origin</span>
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
                  className="text-[#7aa2f7] hover:underline block break-all font-mono"
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
                SYSTEM PROFILE
              </div>
              <div className="p-2.5 bg-black/40 border border-white/10 rounded space-y-2 text-[10px]">
                <div className="text-[#89b4fa] font-bold">duong@silvestrike</div>
                <div className="border-b border-white/10 pb-1 text-slate-500">-----------------</div>
                <div><span className="text-[#7aa2f7]">OS:</span> Human, Vietnam build [VN]</div>
                <div><span className="text-[#7aa2f7]">Host:</span> HUIT B.Eng IT</div>
                <div><span className="text-[#7aa2f7]">Metrics:</span> GPA 3.2 | IELTS 6.5</div>
                <div><span className="text-[#7aa2f7]">Shell:</span> bash / Python / TS</div>
                <div><span className="text-[#7aa2f7]">Kernel:</span> WebOS 2.0</div>
                <div><span className="text-[#7aa2f7]">Uptime:</span> 22 years (Senior)</div>
                <div><span className="text-[#7aa2f7]">Status:</span> Open for SWE / AI</div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
