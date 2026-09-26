/*
Reason for existence: Thesis research view detailing Veritas Vietnamese land registration legal RAG architecture for thesis-veritas.md.
System Impact of Absence: Dossier studio cannot display the graduation thesis architecture and research overview.
*/

'use client';

import React from 'react';

export function ThesisView() {
  return (
    <div className="space-y-4 w-full">
      <div className="p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-purple-300">
              GRADUATION THESIS: VERITAS AI
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Vietnamese Land Registration Legal Intelligence & RAG Pipeline
            </p>
          </div>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
            IN PROGRESS (2025-2026)
          </span>
        </div>

        <p className="text-slate-200 text-[11px] leading-relaxed">
          Veritas is an AI-powered enterprise pipeline specialized in digitizing and querying Vietnamese land registration records and legal texts using advanced Retrieval-Augmented Generation (RAG) architecture and fine-tuned LLMs.
        </p>

        <div className="flex items-stretch gap-3 pt-2 overflow-x-auto pb-2 scrollbar-thin">
          <div className="p-3 bg-white/[0.02] rounded border border-white/5 min-w-[200px] sm:min-w-[220px] flex-1 shrink-0">
            <div className="text-purple-400 font-bold mb-1">[1] RAG Pipeline</div>
            <div className="text-slate-400 text-[10px]">
              Hybrid dense and sparse embeddings with vector store reranking algorithms.
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] rounded border border-white/5 min-w-[200px] sm:min-w-[220px] flex-1 shrink-0">
            <div className="text-sky-400 font-bold mb-1">[2] Fine-Tuning</div>
            <div className="text-slate-400 text-[10px]">
              Domain-specific legal parameter tuning and evaluation on administrative cases.
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] rounded border border-white/5 min-w-[200px] sm:min-w-[220px] flex-1 shrink-0">
            <div className="text-emerald-400 font-bold mb-1">[3] High Impact</div>
            <div className="text-slate-400 text-[10px]">
              Zero-latency compliance lookups for Vietnamese public administration records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
