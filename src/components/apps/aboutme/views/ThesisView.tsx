/*
Reason for existence: Thesis research view detailing Veritas Vietnamese land registration legal RAG architecture for thesis-veritas.md.
System Impact of Absence: Dossier studio cannot display the graduation thesis architecture and research overview.
*/

'use client';

import React from 'react';

export function ThesisView() {
  return (
    <div className="space-y-4 w-full">
      <div className="p-4 sm:p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-purple-300">
              GRADUATION THESIS: VERITAS AI
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Vietnamese Land Registration Legal Intelligence & Hybrid RAG Architecture
            </p>
          </div>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
            RUNNING / THESIS RAG
          </span>
        </div>

        <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
          <div>
            <span className="text-purple-400 font-bold font-mono">1. Problem: </span>
            <span>Tra cứu và đối soát thủ tục đăng ký đất đai, cấp giấy chứng nhận và văn bản quy phạm pháp luật Việt Nam thường tốn nhiều giờ và dễ sai sót do hệ thống văn bản phân tán, chồng chéo.</span>
          </div>
          <div>
            <span className="text-[#7aa2f7] font-bold font-mono">2. Architecture: </span>
            <span>Pipeline Hybrid RAG kết hợp Sparse (BM25) và Dense Retrieval (BGE-M3 / OpenAI embeddings), lưu trữ trên Qdrant Vector DB, kết hợp Cross-Encoder Reranker và LangGraph Orchestrator điều phối multi-step reasoning.</span>
          </div>
          <div>
            <span className="text-amber-300 font-bold font-mono">3. Contribution: </span>
            <span>Trực tiếp xây dựng module phân tách ngữ nghĩa văn bản pháp lý (legal chunking), thuật toán hybrid fusion (alpha weighting), bộ test benchmark 1,200 câu hỏi luật đất đai thực tế.</span>
          </div>
          <div>
            <span className="text-[#9ece6a] font-bold font-mono">4. Result: </span>
            <span>Đạt Top-5 Retrieval Recall 92.4% trên 15,420 điều khoản luật đất đai, giảm thời gian tổng hợp đối soát hồ sơ từ 45 phút xuống dưới 3.5 giây với độ trễ rerank 48ms.</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
          <span className="px-2 py-0.5 bg-white/5 rounded">Python 3.11</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">LangGraph</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">Qdrant Vector DB</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">BGE-M3 Embeddings</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">BM25 Sparse</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">Cross-Encoder</span>
          <span className="px-2 py-0.5 bg-white/5 rounded">FastAPI</span>
        </div>

        <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
          <span className="text-purple-400/80">Container: veritas-engine:v1.0 | Ports: 8000:8000 | Docs: 15,420</span>
          <a
            href="https://github.com/SILVESTRIKE/Veritas-Legal-RAG"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-black rounded text-[11px] font-bold transition-colors inline-block"
          >
            View Repository &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
