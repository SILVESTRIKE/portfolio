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
      <div className="border border-[#7aa2f7]/30 bg-black/50 rounded-lg p-4 md:p-5 space-y-4 w-full">
        {/* Compact ASCII Art */}
        <pre className="text-[#7aa2f7] text-[10px] md:text-xs leading-none overflow-x-auto select-none font-bold">
          {`███████╗██╗██╗    ██╗   ██╗███████╗███████╗████████╗██████╗ ██╗██╗  ██╗███████╗
██╔════╝██║██║    ██║   ██║██╔════╝██╔════╝╚══██╔══╝██╔══██╗██║██║ ██╔╝██╔════╝
███████╗██║██║    ██║   ██║█████╗  ███████╗   ██║   ██████╔╝██║█████╔╝ █████╗  
╚════██║██║██║    ╚██╗ ██╔╝██╔══╝  ╚════██║   ██║   ██╔══██╗██║██╔═██╗ ██╔══╝  
███████║██║███████╗╚████╔╝ ███████╗███████║   ██║   ██║  ██║██║██║  ██╗███████╗
╚══════╝╚═╝╚══════╝ ╚═══╝  ╚══════╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝`}
        </pre>

        {/* Neofetch Key-Value Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-2 pt-2 border-t border-white/10 text-[11px]">
          <div>
            <span className="text-emerald-400 font-bold">duong@silvestrike</span>
            <span className="text-slate-500 ml-2">------------------------</span>
          </div>
          <div>
            <span className="text-[#7aa2f7]">Terminal:</span> silvestrike-ide-v2
          </div>
          <div>
            <span className="text-[#7aa2f7]">OS:</span> Human, Vietnam build [VN]
          </div>
          <div>
            <span className="text-[#7aa2f7]">Host:</span> HUIT (Information Technology)
          </div>
          <div>
            <span className="text-[#7aa2f7]">Degree:</span> B.Eng in IT (Final Year)
          </div>
          <div>
            <span className="text-[#7aa2f7]">GPA / IELTS:</span> 3.2 / 4.0 | 6.5 Academic
          </div>
          <div>
            <span className="text-[#7aa2f7]">Shell:</span> bash / Python / TypeScript
          </div>
          <div>
            <span className="text-[#7aa2f7]">Kernel:</span> WebOS 2.0 Tiling Desktop
          </div>
          <div>
            <span className="text-[#7aa2f7]">Status:</span> Open for SWE / AI-ML Roles
          </div>
          <div>
            <span className="text-[#7aa2f7]">Uptime:</span> 22 years
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
          {'\n'}  <span className="text-[#7aa2f7]">name</span>: <span className="text-emerald-300">"Van Trong Duong"</span>
          {'\n'}  <span className="text-[#7aa2f7]">alias</span>: <span className="text-emerald-300">"SILVESTRIKE"</span>
          {'\n'}  <span className="text-[#7aa2f7]">title</span>: <span className="text-emerald-300">"Full-Stack Developer | AI/ML Engineer | Solutions Architect"</span>
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
