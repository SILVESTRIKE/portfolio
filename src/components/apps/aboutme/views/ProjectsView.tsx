/*
Reason for existence: Project showcase card views for samco-binhtan.ts, dogdexx-ai.py, doru-agent.py, and webbantra.cs.
System Impact of Absence: Dossier studio cannot render project architecture details, tech stack badges, and code links.
*/

'use client';

import React from 'react';
import { FileId } from '../types';

interface ProjectsViewProps {
  activeTab: FileId;
  onOpenApp?: (appId: string) => void;
  openRepoText?: string;
  openLiveText?: string;
}

export function ProjectsView({
  activeTab,
  onOpenApp,
  openRepoText = 'View Repository',
  openLiveText = 'Visit Live Application'
}: ProjectsViewProps) {
  if (activeTab === 'samco-binhtan.ts') {
    return (
      <div className="space-y-4 w-full">
        <div className="p-5 bg-[#0b0f19] border border-sky-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-sky-400">samco-binhtan-webapp</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Samco VinFast EV Sales CMS & E-Commerce Platform
              </p>
            </div>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded text-[10px] font-bold">
              INTERNSHIP 2025
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Enterprise automotive management platform built for Samco Binh Tan dealership. Engineered dynamic vehicle configuration catalogs, inventory bookkeeping, and lead processing pipelines. Implemented with Next.js 14 App Router, Prisma ORM, and high-concurrency Express APIs.
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">TypeScript</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Next.js 14</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Node.js</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Prisma ORM</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">PostgreSQL</span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://github.com/SILVESTRIKE/samco-binhtan-webapp"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-black rounded text-[11px] font-bold transition-colors"
            >
              {openRepoText} &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'dogdexx-ai.py') {
    return (
      <div className="space-y-4 w-full">
        <div className="p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-emerald-400">DogDexx</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Intelligent Dog Species Identification & Health Records
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
              DEPLOYED LIVE
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            AI-powered computer vision identification platform combining CNN deep learning inference with pet health record bookkeeping. Deployed on Vercel Edge with Cloudinary image streaming.
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">PyTorch CNN</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Next.js</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">MongoDB</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Cloudinary CDN</span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://dogdexx.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded text-[11px] font-bold transition-colors"
            >
              {openLiveText} &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'doru-agent.py') {
    return (
      <div className="space-y-4 w-full">
        <div className="p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-emerald-400">Doru_AI Desktop Assistant</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Personal Desktop AI Assistant on Linux Hyprland
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
              HOST ENGINE
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            Offline-first desktop voice agent orchestrating an 8-node LangGraph, Silero VAD, RepCNN wakeword detector, faster-whisper STT, Kokoro ONNX TTS, and dual Groq LPU / Agnes 2.0 LLMs.
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">Python</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">LangGraph</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Silero VAD</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Whisper STT</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Groq LPU</span>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenApp && onOpenApp('app-ai')}
              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded text-[11px] font-bold transition-colors"
            >
              Open AI Assistant in WebOS &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'webbantra.cs') {
    return (
      <div className="space-y-4 w-full">
        <div className="p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-purple-400">WebBanTra & CafePOS</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                E-Commerce Platform & WinForms Retail POS Suite
              </p>
            </div>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
              COURSEWORK 2024
            </span>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            End-to-end commerce platforms built with ASP.NET Core, C# WinForms, and relational SQL Server with stored procedures for real-time inventory management and invoice tracking.
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">C#</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">ASP.NET Core</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">WinForms</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Microsoft SQL Server</span>
          </div>

          <div className="pt-2">
            <a
              href="https://github.com/SILVESTRIKE/WebBanTra"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-black rounded text-[11px] font-bold transition-colors inline-block"
            >
              {openRepoText} &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
