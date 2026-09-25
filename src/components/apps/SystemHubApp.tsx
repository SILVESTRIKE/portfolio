/*
Reason for existence: Unified Server Operations Hub aggregating htop resource monitoring, journalctl syslog streaming, network port diagnostics, and platform specifications into a single tabbed control center.
System impact if absent: System administration tools will be split into multiple tiling windows, crowding the desktop.
*/

'use client';

import React, { useState } from 'react';
import { MonitorApp } from './MonitorApp';
import { LogsApp } from './LogsApp';

export type SystemTab = 'monitor' | 'logs' | 'network';

interface SystemHubAppProps {
  initialTab?: SystemTab;
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function SystemHubApp({
  initialTab = 'monitor',
  onNotify
}: SystemHubAppProps) {
  const [activeTab, setActiveTab] = useState<SystemTab>(initialTab);

  const tabs: Array<{ id: SystemTab; label: string; badge?: string; desc: string }> = [
    {
      id: 'monitor',
      label: 'htop Resources',
      badge: 'Live',
      desc: 'CPU Cores, RAM, Swap & Process Table'
    },
    {
      id: 'logs',
      label: 'journalctl Logs',
      badge: 'Syslog',
      desc: 'Live System Logging Stream & Event Filters'
    }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0b0e14] text-slate-200 select-none overflow-hidden font-sans">
      {/* Top Segmented Tab Navigation */}
      <div className="h-10 bg-[#121620] border-b border-white/10 px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${isActive
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                title={tab.desc}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${isActive
                      ? 'bg-emerald-400/30 text-emerald-200'
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
        {activeTab === 'monitor' && <MonitorApp onNotify={onNotify} />}
        {activeTab === 'logs' && <LogsApp onNotify={onNotify} />}
        {activeTab === 'network' && <MonitorApp onNotify={onNotify} />}
      </div>
    </div>
  );
}
