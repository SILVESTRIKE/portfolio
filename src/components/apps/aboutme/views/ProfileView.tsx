/*
Reason for existence: Formatted Neofetch hero telemetry and canonical YAML configuration view for profile.yml.
System Impact of Absence: Dossier studio cannot display developer metadata, credentials, and academic background for profile.yml.
*/

'use client';

import React from 'react';
import { useCodingUptime } from '@/lib/uptime';
import { DEVELOPER_CONFIG, SYSTEM_CONFIG } from '@/config';

export function ProfileView() {
  const liveUptime = useCodingUptime('compact');

  return (
    <div className="space-y-6 w-full">
      {/* Neofetch Hero Box */}
      <div className="border border-[#7aa2f7]/30 bg-black/50 rounded-lg p-2.5 sm:p-4 space-y-3 w-full min-w-0 overflow-x-auto scrollbar-thin">
        {/* Compact Responsive ASCII Art with ultra-compact mobile breakpoints */}
        <pre className="text-[#7aa2f7] text-[3.2px] min-[320px]:text-[3.6px] min-[360px]:text-[4.2px] min-[400px]:text-[5.2px] min-[480px]:text-[6.2px] sm:text-[8px] md:text-[9px] leading-tight overflow-x-auto scrollbar-none select-none font-bold py-1">
          {`███████╗██╗██╗    ██╗   ██╗███████╗███████╗████████╗██████╗ ██╗██╗  ██╗███████╗
██╔════╝██║██║    ██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝
███████╗██║██║    ██║   ██║█████╗  ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗  
╚════██║██║██║    ╚██╗ ██╔╝██╔══╝  ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝  
███████║██║███████╗╚████╔╝ ███████╗███████║   ██║   ██║  ██║██║██║  ██╗███████╗
╚══════╝╚═╝╚══════╝ ╚═══╝  ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝`}
        </pre>

        {/* Neofetch Key-Value Grid */}
        <div className="grid grid-cols-1 min-[580px]:grid-cols-2 gap-x-5 gap-y-1.5 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] font-mono min-w-0">
          <div className="col-span-1 min-[580px]:col-span-2 pb-1 flex items-center min-w-0">
            <span className="text-emerald-400 font-bold shrink-0">{SYSTEM_CONFIG.userAtSilvestrike}</span>
            <span className="h-[1px] bg-slate-700/60 flex-1 ml-2 min-w-3" />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Terminal:</span>
            <span className="text-slate-300 break-words">{DEVELOPER_CONFIG.username}</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">OS:</span>
            <span className="text-slate-300 break-words">{SYSTEM_CONFIG.os.humanBuild}</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Host:</span>
            <span className="text-slate-300 break-words">
              <span className="hidden xl:inline">{DEVELOPER_CONFIG.education.university.full}</span>
              <span className="xl:hidden">{DEVELOPER_CONFIG.education.university.short}</span>
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Degree:</span>
            <span className="text-slate-300 break-words">
              <span className="hidden lg:inline">{DEVELOPER_CONFIG.education.degree.full}</span>
              <span className="lg:hidden">{DEVELOPER_CONFIG.education.degree.short}</span>
            </span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">GPA / IELTS:</span>
            <span className="text-slate-300 break-words">{DEVELOPER_CONFIG.education.gpa} | {DEVELOPER_CONFIG.education.ielts}</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Shell:</span>
            <span className="text-slate-300 break-words">{SYSTEM_CONFIG.shell.developer}</span>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Kernel:</span>
            <span className="text-slate-300 break-words">{SYSTEM_CONFIG.os.kernel}</span>
          </div>
          <div className="col-span-1 min-[580px]:col-span-2 flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Status:</span>
            <span className="text-emerald-400 font-bold break-words">{DEVELOPER_CONFIG.targetRoles}</span>
          </div>
          <div className="col-span-1 min-[580px]:col-span-2 flex flex-wrap sm:flex-nowrap items-baseline gap-x-1.5 gap-y-0.5 min-w-0">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Uptime:</span>
            <span className="text-slate-300 font-mono break-all">{liveUptime}</span>
          </div>
        </div>

        {/* ANSI 8-Color Palette Squares */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 select-none overflow-x-auto scrollbar-none">
          {['#000000', '#ef4444', '#22c55e', '#eab308', '#3b82f6', '#a855f7', '#06b6d4', '#e2e8f0'].map(
            (c, i) => (
              <div
                key={i}
                className="w-4 sm:w-5 h-2.5 sm:h-3 rounded-sm border border-white/10 shrink-0"
                style={{ backgroundColor: c }}
              />
            )
          )}
        </div>
      </div>

      {/* Formatted YAML View */}
      <div className="bg-[#0b0f19] border border-white/10 rounded-lg p-3 sm:p-4 font-mono text-[10px] sm:text-[11px] leading-relaxed min-w-0 overflow-x-auto scrollbar-thin">
        <div className="text-slate-500 pb-2 border-b border-white/5 mb-3 whitespace-nowrap">
          # profile.yml - Canonical developer configuration
        </div>
        <pre className="text-slate-300 overflow-x-auto whitespace-pre scrollbar-thin py-1">
          <span className="text-amber-400">developer</span>:
          {'\n'}  <span className="text-[#7aa2f7]">name</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.name}"</span>
          {'\n'}  <span className="text-[#7aa2f7]">alias</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.alias}"</span>
          {'\n'}  <span className="text-[#7aa2f7]">title</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.title}"</span>
          {'\n'}  <span className="text-[#7aa2f7]">location</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.location}"</span>
          {'\n'}  <span className="text-[#7aa2f7]">education</span>:
          {'\n'}    <span className="text-[#7aa2f7]">university</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.education.university.formal}"</span>
          {'\n'}    <span className="text-[#7aa2f7]">degree</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.education.degree.formal}"</span>
          {'\n'}    <span className="text-[#7aa2f7]">gpa</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.education.gpa}"</span>
          {'\n'}    <span className="text-[#7aa2f7]">ielts</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.education.ielts}"</span>
          {'\n'}    <span className="text-[#7aa2f7]">timeline</span>: <span className="text-emerald-300">"{DEVELOPER_CONFIG.education.timelineFull}"</span>
          {'\n'}  <span className="text-amber-400">engineering_philosophy</span>:
          {DEVELOPER_CONFIG.philosophy.map((item, idx) => (
            <React.Fragment key={idx}>
              {'\n'}    - <span className="text-emerald-300">"{item}"</span>
            </React.Fragment>
          ))}
        </pre>
      </div>
    </div>
  );
}
