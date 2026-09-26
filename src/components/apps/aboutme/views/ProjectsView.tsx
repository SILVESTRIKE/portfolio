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
        <div className="p-4 sm:p-5 bg-[#0b0f19] border border-sky-500/30 rounded-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-sky-400">samco-binhtan-webapp</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Samco VinFast EV Sales CMS & Automotive E-Commerce Platform
              </p>
            </div>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded text-[10px] font-bold">
              RUNNING / PRODUCTION CMS
            </span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
            <div>
              <span className="text-sky-400 font-bold font-mono">1. Problem: </span>
              <span>Xây dựng nền tảng quản trị kinh doanh và catalog xe điện VinFast nhằm số hóa toàn bộ quy trình bán hàng, báo giá và quản lý tồn kho xe cho đại lý Samco Bình Tân.</span>
            </div>
            <div>
              <span className="text-[#7aa2f7] font-bold font-mono">2. Architecture: </span>
              <span>Next.js 14 App Router kết hợp Server Actions xử lý mutations bảo mật, Prisma ORM giao tiếp cơ sở dữ liệu PostgreSQL, và Zustand quản lý state bộ cấu hình xe thời gian thực.</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold font-mono">3. Contribution: </span>
              <span>Trực tiếp thiết kế toàn bộ schema cơ sở dữ liệu quan hệ, xây dựng CMS quản trị tồn kho xe, pipeline tiếp nhận lead khách hàng và phân quyền bảo mật nhân viên.</span>
            </div>
            <div>
              <span className="text-[#9ece6a] font-bold font-mono">4. Result: </span>
              <span>Rút ngắn 40% thời gian xử lý báo giá cho nhân viên kinh doanh, đồng bộ tồn kho tức thì, 15,000+ monthly visits và đảm bảo tốc độ phản hồi giao diện dưới 300ms với 0 downtime.</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">TypeScript</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Next.js 14</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Node.js</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Prisma ORM</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">PostgreSQL</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Zustand</span>
          </div>

          <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <span className="text-sky-400/80">Container: samco-cms-prod:v2.1 | Ports: 443:443</span>
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
        <div className="p-4 sm:p-5 bg-[#0b0f19] border border-emerald-500/30 rounded-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-emerald-400">DogDexx</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Intelligent Dog Species Identification & Pet Health Records
              </p>
            </div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
              RUNNING / EDGE DEPLOYED
            </span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
            <div>
              <span className="text-emerald-400 font-bold font-mono">1. Problem: </span>
              <span>Nhận diện tức thì giống chó từ ảnh, video hoặc camera trực tiếp để hỗ trợ tra cứu đặc tính và số hóa sổ theo dõi tiêm chủng cho người nuôi và cơ sở thú y.</span>
            </div>
            <div>
              <span className="text-[#7aa2f7] font-bold font-mono">2. Architecture: </span>
              <span>Next.js Web Client kết nối qua Node.js BFF tới Python AI Microservice chạy mô hình PyTorch CNN (ResNet), lưu trữ MongoDB và stream ảnh qua Cloudinary CDN.</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold font-mono">3. Contribution: </span>
              <span>Tự xây dựng pipeline inference, tối ưu hóa kích thước mô hình, thiết kế kiến trúc API giao tiếp real-time và toàn bộ UI quản lý sổ thú cưng.</span>
            </div>
            <div>
              <span className="text-[#9ece6a] font-bold font-mono">4. Result: </span>
              <span>Đạt độ chính xác 94% trên 120 giống chó phổ biến, thời gian suy luận dưới 180ms trên Edge Deployment tại dogdexx.vercel.app với 100% test pass.</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">PyTorch CNN</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Python</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Next.js</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Node.js BFF</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">MongoDB</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Cloudinary CDN</span>
          </div>

          <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <span className="text-emerald-400/80">Container: dogdexx-ai:v1.2 | Ports: 443:443</span>
            <div className="flex items-center gap-3">
              <a
                href="https://dogdexx.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black rounded text-[11px] font-bold transition-colors"
              >
                {openLiveText} &rarr;
              </a>
              <a
                href="https://github.com/SILVESTRIKE/DogDexx"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/5 text-slate-300 hover:bg-white/10 rounded text-[11px] font-semibold transition-colors"
              >
                {openRepoText}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'doru-agent.py') {
    return (
      <div className="space-y-4 w-full">
        <div className="p-4 sm:p-5 bg-[#0b0f19] border border-purple-500/30 rounded-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-purple-400">Doru_AI Desktop Assistant</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Personal Desktop Voice AI Assistant on Linux Hyprland
              </p>
            </div>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold">
              RUNNING / LOCAL ENGINE
            </span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
            <div>
              <span className="text-purple-400 font-bold font-mono">1. Problem: </span>
              <span>Xây dựng trợ lý giọng nói cá nhân chạy hoàn toàn cục bộ trên máy trạm Linux Hyprland, điều khiển hệ thống và hỗ trợ lập trình bảo mật riêng tư tuyệt đối.</span>
            </div>
            <div>
              <span className="text-[#7aa2f7] font-bold font-mono">2. Architecture: </span>
              <span>Pipeline âm thanh đa luồng: Silero VAD bắt giọng nói &rarr; RepCNN phát hiện wakeword &rarr; Faster-Whisper STT &rarr; 8-node LangGraph Orchestrator &rarr; Groq LPU (fallback Agnes 2.0) &rarr; Kokoro ONNX TTS.</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold font-mono">3. Contribution: </span>
              <span>Thiết kế kiến trúc LangGraph tự phục hồi lỗi, quản lý luồng stream audio đa tiến trình không block UI và xây dựng sidecar RPC điều khiển máy trạm Linux.</span>
            </div>
            <div>
              <span className="text-[#9ece6a] font-bold font-mono">4. Result: </span>
              <span>Đạt độ trễ xử lý giọng nói trọn vòng (end-to-end loop) dưới 650ms ngay trên máy cục bộ với mức tiêu thụ RAM dưới 800MB và độ tin cậy wakeword 0.94.</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">Python</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">LangGraph</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Silero VAD</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Whisper STT</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Kokoro TTS</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Groq LPU</span>
          </div>

          <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <span className="text-purple-400/80">Container: doru-voice-agent:v2.0 | Ports: 8828:8828 (IPC)</span>
            <button
              onClick={() => onOpenApp && onOpenApp('app-ai')}
              className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-black rounded text-[11px] font-bold transition-colors"
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
        <div className="p-4 sm:p-5 bg-[#0b0f19] border border-amber-500/30 rounded-lg space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-amber-400">WebBanTra & CafePOS</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                E-Commerce Platform & WinForms Retail POS Suite
              </p>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold">
              ARCHIVED / DESKTOP + WEB POS
            </span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
            <div>
              <span className="text-amber-400 font-bold font-mono">1. Problem: </span>
              <span>Đồng bộ hóa bán hàng đa kênh giữa website thương mại điện tử trực tuyến và phần mềm tính tiền POS tại quầy thu ngân cho chuỗi cửa hàng trà và cafe.</span>
            </div>
            <div>
              <span className="text-[#7aa2f7] font-bold font-mono">2. Architecture: </span>
              <span>Web Storefront xây dựng trên ASP.NET Core MVC kết nối ứng dụng Desktop WinForms POS qua REST API nội bộ và hệ quản trị Microsoft SQL Server tập trung.</span>
            </div>
            <div>
              <span className="text-amber-300 font-bold font-mono">3. Contribution: </span>
              <span>Xây dựng Stored Procedures tối ưu hóa truy vấn tồn kho, thiết kế logic giỏ hàng, quy trình xuất hóa đơn bán lẻ và báo cáo doanh thu theo ca.</span>
            </div>
            <div>
              <span className="text-[#9ece6a] font-bold font-mono">4. Result: </span>
              <span>Đảm bảo tính toàn vẹn dữ liệu giao dịch ACID 100%, 0% sai lệch tồn kho giữa thu ngân tại quầy và đơn hàng đặt trên website, xử lý hàng trăm hóa đơn/ca.</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <span className="px-2 py-0.5 bg-white/5 rounded">C#</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">ASP.NET Core</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">WinForms</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">Microsoft SQL Server</span>
          </div>

          <div className="pt-1 flex items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <span className="text-amber-400/80">Container: webbantra-sql:v1.0 | DB: MSSQL 2022</span>
            <a
              href="https://github.com/SILVESTRIKE/WebBanTra"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black rounded text-[11px] font-bold transition-colors inline-block"
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
