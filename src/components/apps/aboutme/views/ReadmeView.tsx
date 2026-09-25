/*
Reason for existence: Executive overview, background narrative, and engineering pillars view for README.md.
System Impact of Absence: Dossier studio cannot display the main README.md introductory manifesto and engineering principles.
*/

'use client';

import React from 'react';

export function ReadmeView() {
  return (
    <div className="space-y-6 w-full">
      <div className="border border-white/10 bg-[#0b0f19] rounded-lg p-5 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h1 className="text-lg font-bold text-[#7aa2f7]">
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
  );
}
