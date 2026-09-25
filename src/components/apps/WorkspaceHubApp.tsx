/*
Reason for existence: Unified Workspace Hub aggregating Doru AI Assistant chat engine and File Explorer VFS tree into a single productive workbench.
System impact if absent: AI assistant and file explorer will occupy disparate panes rather than a collaborative workspace.
*/

'use client';

import React, { useState } from 'react';
import { AIAssistantApp } from './AIAssistantApp';
import { FilesApp } from './FilesApp';

export type WorkspaceTab = 'ai' | 'files';

interface WorkspaceHubAppProps {
  initialTab?: WorkspaceTab;
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function WorkspaceHubApp({
  initialTab = 'ai',
  onNotify
}: WorkspaceHubAppProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);

  const tabs: Array<{ id: WorkspaceTab; label: string; badge?: string; desc: string }> = [
    {
      id: 'ai',
      label: 'Doru AI Assistant',
      badge: 'Hybrid LPU',
      desc: 'Native Intelligent Voice & Text Assistant'
    },
    {
      id: 'files',
      label: 'File Explorer',
      badge: '/home/doru',
      desc: 'Virtual Linux Filesystem & File Editor'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0c1017] text-slate-200 select-none overflow-hidden font-sans">
      {/* Top Segmented Tab Navigation */}
      <div className="h-10 bg-[#141a24] border-b border-white/10 px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
                title={tab.desc}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isActive
                        ? 'bg-purple-400/30 text-purple-200'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status indicator on top right */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span>AI WORKBENCH READY</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeTab === 'ai' && <AIAssistantApp />}
        {activeTab === 'files' && <FilesApp onNotify={onNotify} />}
      </div>
    </div>
  );
}
