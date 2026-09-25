/*
Reason for existence: Unified Developer and Portfolio Studio Hub aggregating Developer Dossier (About), Microservices catalog (Projects), and Git Visual Git into a single tabbed workstation.
System impact if absent: Developer applications will be scattered across multiple separate windows causing tiling clutter.
*/

'use client';

import React, { useState } from 'react';
import { AboutMeTerminalApp } from './AboutMeTerminalApp';
import { ServicesApp } from './ServicesApp';
import { GitKrakenApp } from './GitKrakenApp';

export type PortfolioTab = 'about' | 'services' | 'git';

interface PortfolioHubAppProps {
  initialTab?: PortfolioTab;
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}

export function PortfolioHubApp({
  initialTab = 'about',
  onNotify,
  onOpenApp
}: PortfolioHubAppProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>(initialTab);

  const tabs: Array<{ id: PortfolioTab; label: string; badge?: string; desc: string }> = [
    {
      id: 'about',
      label: 'About',
      desc: 'Developer Profile, Skills & Interactive Dossier'
    },
    {
      id: 'services',
      label: 'Projects',
      desc: 'SILVESTRIKE Repositories & Live Workstations'
    },
    {
      id: 'git',
      label: 'Git',
      desc: 'Commit Graph & Unified Diff Inspector'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0d1117] text-slate-200 select-none overflow-hidden font-sans">
      {/* Top Segmented Tab Navigation */}
      <div className="h-10 bg-[#161b22] border-b border-white/10 px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${isActive
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                title={tab.desc}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${isActive
                      ? 'bg-sky-400/30 text-sky-200'
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
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        {activeTab === 'about' && (
          <AboutMeTerminalApp
            onNotify={onNotify}
            onOpenApp={onOpenApp}
          />
        )}

        {activeTab === 'services' && (
          <ServicesApp
            onNotify={onNotify}
            onOpenApp={(appId) => {
              if (appId === 'app-git') {
                setActiveTab('git');
              } else if (onOpenApp) {
                onOpenApp(appId);
              }
            }}
          />
        )}

        {activeTab === 'git' && <GitKrakenApp />}
      </div>
    </div>
  );
}
