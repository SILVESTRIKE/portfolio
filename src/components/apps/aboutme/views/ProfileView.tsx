/*
Reason for existence: Formatted Neofetch hero telemetry and canonical YAML configuration view for profile.yml.
System Impact of Absence: Dossier studio cannot display developer metadata, credentials, and academic background for profile.yml.
*/

'use client';

import React from 'react';

export function ProfileView() {
  return (
    <div className="space-y-6 w-full">
      {/* Neofetch Hero Box */}
      <div className="border border-[#7aa2f7]/30 bg-black/50 rounded-lg p-3 sm:p-4 space-y-3 w-full min-w-0 overflow-x-auto scrollbar-thin">
        {/* Compact Responsive ASCII Art */}
        <pre className="text-[#7aa2f7] text-[6px] min-[360px]:text-[7px] sm:text-[8px] md:text-[9px] leading-tight overflow-x-auto scrollbar-none select-none font-bold py-1">
          {`███████╗██╗██╗    ██╗   ██╗███████╗███████╗████████╗██████╗ ██╗██╗  ██╗███████╗
██╔════╝██║██║    ██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝
███████╗██║██║    ██║   ██║█████╗  ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗  
╚════██║██║██║    ╚██╗ ██╔╝██╔══╝  ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝  
███████║██║███████╗╚████╔╝ ███████╗███████║   ██║   ██║  ██║██║██║  ██╗███████╗
╚══════╝╚═╝╚══════╝ ╚═══╝  ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝`}
        </pre>

        {/* Neofetch Key-Value Grid (No truncate ellipsis, horizontal scrollable) */}
        <div className="grid grid-cols-1 min-[580px]:grid-cols-2 gap-x-5 gap-y-1.5 pt-2 border-t border-white/10 text-[10px] sm:text-[11px] font-mono min-w-max">
          <div className="col-span-1 min-[580px]:col-span-2 pb-1 whitespace-nowrap">
            <span className="text-emerald-400 font-bold">duong@silvestrike</span>
            <span className="text-slate-600 ml-2">------------------------</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Terminal:</span>
            <span className="text-slate-300">silvestrike-ide-v2</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">OS:</span>
            <span className="text-slate-300">Human, Vietnam build [VN]</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Host:</span>
            <span className="text-slate-300">HUIT (Information Technology)</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Degree:</span>
            <span className="text-slate-300">B.Eng in IT (Final Year)</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">GPA / IELTS:</span>
            <span className="text-slate-300">3.2 / 4.0 | 6.5 Academic</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Shell:</span>
            <span className="text-slate-300">bash / Python / TypeScript</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Kernel:</span>
            <span className="text-slate-300">WebOS 2.0 Tiling Desktop</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Status:</span>
            <span className="text-emerald-400 font-bold">Open for SWE / AI-ML Roles</span>
          </div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[#7aa2f7] font-semibold shrink-0">Uptime:</span>
            <span className="text-slate-300">22 years</span>
          </div>
        </div>

        {/* ANSI 8-Color Palette Squares */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 select-none overflow-x-auto">
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
          {'\n'}  <span className="text-[#7aa2f7]">name</span>: <span className="text-emerald-300">"Van Trong Duong"</span>
          {'\n'}  <span className="text-[#7aa2f7]">alias</span>: <span className="text-emerald-300">"SILVESTRIKE"</span>
          {'\n'}  <span className="text-[#7aa2f7]">title</span>: <span className="text-emerald-300">"Full-Stack Developer | AI/ML Engineer"</span>
          {'\n'}  <span className="text-[#7aa2f7]">location</span>: <span className="text-emerald-300">"Ho Chi Minh City, Vietnam"</span>
          {'\n'}  <span className="text-[#7aa2f7]">education</span>:
          {'\n'}    <span className="text-[#7aa2f7]">university</span>: <span className="text-emerald-300">"Ho Chi Minh City University of Industry and Trade (HUIT)"</span>
          {'\n'}    <span className="text-[#7aa2f7]">degree</span>: <span className="text-emerald-300">"Bachelor of Engineering in Information Technology"</span>
          {'\n'}    <span className="text-[#7aa2f7]">gpa</span>: <span className="text-emerald-300">"3.2 / 4.0"</span>
          {'\n'}    <span className="text-[#7aa2f7]">ielts</span>: <span className="text-emerald-300">"6.5 Academic"</span>
          {'\n'}    <span className="text-[#7aa2f7]">timeline</span>: <span className="text-emerald-300">"2022 - 2026 (Final-year thesis & R&D)"</span>
          {'\n'}  <span className="text-amber-400">engineering_philosophy</span>:
          {'\n'}    - <span className="text-emerald-300">"Clean Architecture & strictly decoupled services over ad-hoc scripts"</span>
          {'\n'}    - <span className="text-emerald-300">"High test coverage with clear bounded contexts and validation schemas"</span>
          {'\n'}    - <span className="text-emerald-300">"Bridging deep learning models with high-throughput production infrastructure"</span>
        </pre>
      </div>
    </div>
  );
}
