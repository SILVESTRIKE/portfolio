/*
Reason for existence: Grid visualization of programming dialects, AI/ML deep learning stack, web frameworks, and cloud devops for skills.json.
System Impact of Absence: Dossier studio cannot display technical skill matrices and proficiencies for skills.json.
*/

'use client';

import React from 'react';

export function SkillsView() {
  return (
    <div className="space-y-4 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* [1] Core Languages */}
        <div className="p-3 bg-[#0b0f19] border border-white/10 rounded-lg space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <span className="text-sky-400 font-bold text-[11px] font-mono truncate">[1] CORE LANGUAGES</span>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">6 DIALECTS</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Python', role: 'PyTorch / FastAPI', grade: 'Advanced' },
              { name: 'TypeScript', role: 'Next.js / Node.js', grade: 'Advanced' },
              { name: 'JavaScript', role: 'ESNext / WebOS', grade: 'Advanced' },
              { name: 'C#', role: 'ASP.NET / WinForms', grade: 'Proficient' },
              { name: 'PHP', role: 'Laravel MVC', grade: 'Proficient' },
              { name: 'SQL', role: 'PostgreSQL / SQL Server', grade: 'Advanced' }
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-1.5 bg-white/[0.02] border border-white/5 rounded gap-2 min-w-0"
              >
                <div className="min-w-0 flex items-baseline gap-1 overflow-hidden">
                  <span className="text-slate-200 font-bold text-[11px] shrink-0">{item.name}</span>
                  <span className="text-slate-500 text-[10px] truncate">({item.role})</span>
                </div>
                <span className="text-sky-400 text-[10px] font-mono shrink-0">{item.grade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* [2] AI & Deep Learning */}
        <div className="p-3 bg-[#0b0f19] border border-white/10 rounded-lg space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <span className="text-emerald-400 font-bold text-[11px] font-mono truncate">[2] AI & DEEP LEARNING</span>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">CV & LLMS</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'PyTorch', 'TensorFlow', 'OpenCV', 'MediaPipe', 'YOLO',
              'LangGraph', 'LangChain', 'Silero VAD', 'Whisper STT',
              'Kokoro TTS', 'Jupyter Lab', 'RAG Pipelines', 'Vector DBs'
            ].map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-300 whitespace-nowrap"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* [3] Web Architecture */}
        <div className="p-3 bg-[#0b0f19] border border-white/10 rounded-lg space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <span className="text-purple-400 font-bold text-[11px] font-mono truncate">[3] WEB ARCHITECTURE</span>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">FULL-STACK</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Next.js 14/15', 'React.js 19', 'Node.js', 'Express.js',
              'ASP.NET Core', '.NET WinForms', 'Laravel', 'REST APIs',
              'WebSocket', 'Clean Architecture', 'Prisma ORM', 'TailwindCSS'
            ].map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300 whitespace-nowrap"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* [4] Cloud & DevOps */}
        <div className="p-3 bg-[#0b0f19] border border-white/10 rounded-lg space-y-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <span className="text-amber-400 font-bold text-[11px] font-mono truncate">[4] CLOUD & DEVOPS</span>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">INFRA</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'PostgreSQL', 'MongoDB', 'MS SQL Server', 'Prisma ORM',
              'Docker', 'Linux / Ubuntu', 'Git / GitHub', 'CI/CD',
              'Cloudinary', 'Vercel Edge', 'Nginx', 'Hyprland'
            ].map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-300 whitespace-nowrap"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
