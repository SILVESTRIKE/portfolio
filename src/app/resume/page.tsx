/*
Reason for existence: Static SSR 30-second recruiter summary page allowing search crawlers, social bots, and hiring managers to scan core engineering strengths, projects, and contact details without needing interactive WebOS boots.
System impact if absent: Search engines and recruiters who do not interact with client-side WebOS terminals will not be able to index or quickly review developer qualifications.
*/

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DEVELOPER_CONFIG } from '@/config';

export const metadata: Metadata = {
  title: `${DEVELOPER_CONFIG.name} | ${DEVELOPER_CONFIG.title} Resume`,
  description: `30-second executive summary of ${DEVELOPER_CONFIG.name} (${DEVELOPER_CONFIG.alias}). Full-stack web architecture, production AI engineering, core projects, and contact channels.`,
  openGraph: {
    title: `${DEVELOPER_CONFIG.name} | Full-Stack & AI/ML Engineer (30s Resume)`,
    description: 'Executive overview, selected projects (Samco Binh Tan, DogDexx AI, Doru AI), tech stack, and direct CV download.',
    url: 'https://silvestrike.vercel.app/resume',
    siteName: 'SILVESTRIKE Portfolio',
    type: 'profile'
  }
};

export default function ResumePage() {
  const projects = [
    {
      name: 'Samco Binh Tan WebApp',
      badge: 'INTERNSHIP 2025',
      badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
      tagline: 'VinFast EV Sales CMS & Automotive E-Commerce Platform',
      problem: 'Xây dựng nền tảng quản trị kinh doanh và catalog xe điện VinFast nhằm số hóa quy trình bán hàng, cấu hình báo giá và theo dõi tồn kho xe cho đại lý Samco Bình Tân.',
      architecture: 'Next.js 14 App Router kết hợp Server Actions xử lý logic nghiệp vụ bảo mật, Prisma ORM giao tiếp cơ sở dữ liệu PostgreSQL, và Zustand điều phối trạng thái cấu hình xe thời gian thực.',
      contribution: 'Trực tiếp thiết kế toàn bộ schema cơ sở dữ liệu quan hệ, xây dựng CMS quản trị tồn kho xe, pipeline xử lý lead khách hàng và phân quyền nhân viên đa cấp.',
      result: 'Giúp rút ngắn 40% thời gian xử lý báo giá cho nhân viên kinh doanh, đồng bộ tồn kho tức thì và đạt thời gian phản hồi giao diện dưới 300ms.',
      tech: ['Next.js 14', 'TypeScript', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'Zustand', 'TailwindCSS'],
      repoUrl: 'https://github.com/SILVESTRIKE/samco-binhtan-webapp',
      liveUrl: undefined
    },
    {
      name: 'DogDexx AI',
      badge: 'DEPLOYED LIVE',
      badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
      tagline: 'AI Dog Breed Identification & Pet Health Passport',
      problem: 'Nhận diện tức thì giống chó từ ảnh, video hoặc camera trực tiếp để hỗ trợ tra cứu đặc tính và quản lý sổ tiêm chủng y tế thú cưng cho người nuôi và phòng khám thú y.',
      architecture: 'Client Next.js kết nối qua Node.js Backend-For-Frontend (BFF) tới Python AI Microservice chạy mô hình PyTorch CNN (ResNet), lưu trữ dữ liệu MongoDB và stream media qua Cloudinary CDN.',
      contribution: 'Tự tay huấn luyện và tối ưu mô hình CNN, thiết kế API pipeline inference độ trễ thấp và xây dựng toàn bộ giao diện quản trị sổ theo dõi sức khỏe thú cưng.',
      result: 'Đạt độ chính xác 94% trên 120 giống chó phổ biến, thời gian phản hồi suy luận dưới 250ms trên Edge Deployment.',
      tech: ['PyTorch CNN', 'Python', 'Next.js', 'Node.js BFF', 'MongoDB', 'Cloudinary CDN', 'TailwindCSS'],
      repoUrl: 'https://github.com/SILVESTRIKE/DogDexx',
      liveUrl: 'https://dogdexx.vercel.app'
    },
    {
      name: 'Doru Desktop Voice AI',
      badge: 'HOST ENGINE',
      badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
      tagline: 'Offline-First Linux Desktop Voice Assistant',
      problem: 'Trợ lý giọng nói cá nhân chạy hoàn toàn cục bộ trên máy trạm Linux Hyprland, phục vụ điều khiển hệ thống và giải đáp thông minh mà không phụ thuộc internet hay làm lộ dữ liệu cá nhân.',
      architecture: 'Pipeline âm thanh đa luồng: Silero VAD bắt giọng nói -> RepCNN phát hiện từ khóa (wakeword) -> Faster-Whisper STT -> 8-node LangGraph Orchestrator định tuyến -> Groq LPU (Agnes 2.0 fallback) -> Kokoro ONNX TTS.',
      contribution: 'Thiết kế kiến trúc LangGraph tự phục hồi lỗi, quản lý luồng stream audio đa tiến trình không nghẽn tài nguyên và xây dựng RPC sidecar giao tiếp với desktop window manager.',
      result: 'Thời gian phản hồi giọng nói trọn vòng (end-to-end) dưới 1.2s trên môi trường local với mức sử dụng RAM dưới 800MB.',
      tech: ['Python', 'LangGraph', 'Faster-Whisper', 'Silero VAD', 'Kokoro TTS', 'Groq LPU', 'Hyprland Linux'],
      repoUrl: undefined,
      liveUrl: undefined
    }
  ];

  const coreSkills = [
    { category: 'Frontend & Web', items: ['TypeScript', 'Next.js 14/15', 'React 19', 'TailwindCSS', 'Zustand', 'HTML5 / CSS3'] },
    { category: 'Backend & Systems', items: ['Node.js', 'Express', 'Python', 'Prisma ORM', 'PostgreSQL', 'MongoDB', 'REST & GraphQL APIs'] },
    { category: 'AI & Data Engineering', items: ['PyTorch (CNN / Vision)', 'LangGraph', 'Whisper STT', 'Hugging Face', 'Groq LPU Inference'] },
    { category: 'DevOps & Tooling', items: ['Linux (Arch / Ubuntu)', 'Docker', 'Git / GitHub CI', 'Vercel Edge', 'Bash Scripting'] }
  ];

  return (
    <main className="min-h-screen bg-[#080b12] text-slate-200 font-sans selection:bg-[#7aa2f7]/30 selection:text-white px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Top Navigation & Direct Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-[#7aa2f7] hover:text-white transition-colors"
          >
            <span>&larr;</span>
            <span>Launch Full Interactive WebOS (Desktop Mode)</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="/CV_VanTrongDuong.docx"
              download="CV_VanTrongDuong.docx"
              className="px-3 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono transition-colors"
            >
              Download CV (DOCX)
            </a>
            <a
              href={`mailto:${DEVELOPER_CONFIG.contact.email}`}
              className="px-3 py-1.5 rounded bg-[#7aa2f7]/15 hover:bg-[#7aa2f7]/25 border border-[#7aa2f7]/30 text-[#89b4fa] text-xs font-semibold font-mono transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* 1. IDENTITY */}
        <section className="space-y-3">
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#7aa2f7]/10 text-[#7aa2f7] border border-[#7aa2f7]/20 text-xs font-mono font-bold uppercase tracking-wider">
            Candidate Dossier - 30s Executive Summary
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {DEVELOPER_CONFIG.name} <span className="text-[#7aa2f7] font-mono text-xl sm:text-2xl font-normal">({DEVELOPER_CONFIG.alias})</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium">
            {DEVELOPER_CONFIG.title}
          </p>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-slate-400">
            <span>Location: {DEVELOPER_CONFIG.location}</span>
            <span>Email: {DEVELOPER_CONFIG.contact.email}</span>
            <span>Education: {DEVELOPER_CONFIG.education.university.short} ({DEVELOPER_CONFIG.education.degree.formal})</span>
            <span className="text-emerald-400 font-bold">Status: OPEN_FOR_HIRE</span>
          </div>
        </section>

        {/* 2. WHAT I DO (1-2 sentences, clear & jargon-free) */}
        <section className="p-4 sm:p-5 rounded-lg bg-[#0e1422] border border-white/10 space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#7aa2f7] font-bold">
            What I Do
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            Tôi xây dựng các ứng dụng web toàn diện (Full-Stack) có hiệu năng cao và tích hợp các mô hình trí tuệ nhân tạo (AI/ML) vào quy trình thực tế. Thế mạnh chính nằm ở kiến trúc Next.js/TypeScript, thiết kế hệ thống cơ sở dữ liệu và triển khai pipeline suy luận AI thực tế với độ trễ thấp.
          </p>
        </section>

        {/* 3. SELECTED PROJECTS (4-sentence formula) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7aa2f7]" />
              Selected Engineering Projects
            </h2>
            <span className="text-xs text-slate-500 font-mono">Architecture & Metrics</span>
          </div>

          <div className="space-y-4">
            {projects.map((proj) => (
              <div
                key={proj.name}
                className="p-5 rounded-lg bg-[#0b0f19] border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white">{proj.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{proj.tagline}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${proj.badgeColor}`}>
                    {proj.badge}
                  </span>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  <div>
                    <strong className="text-[#7aa2f7] font-mono">Problem: </strong>
                    <span>{proj.problem}</span>
                  </div>
                  <div>
                    <strong className="text-[#89b4fa] font-mono">Architecture: </strong>
                    <span>{proj.architecture}</span>
                  </div>
                  <div>
                    <strong className="text-amber-300 font-mono">Contribution: </strong>
                    <span>{proj.contribution}</span>
                  </div>
                  <div>
                    <strong className="text-[#9ece6a] font-mono">Result: </strong>
                    <span>{proj.result}</span>
                  </div>
                </div>

                {/* Tech Badges & Links */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono text-slate-300">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono font-bold">
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7aa2f7] hover:underline"
                      >
                        Source Code &rarr;
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#9ece6a] hover:underline"
                      >
                        Live Demo &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TECH STACK (Focused, not endless listing) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9ece6a]" />
            Core Technology Stack
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coreSkills.map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg bg-[#0e1422] border border-white/10 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONTACT / CV & ACTION BUTTONS */}
        <section className="p-6 rounded-lg bg-gradient-to-r from-[#0d1527] to-[#0a101d] border border-[#7aa2f7]/30 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Sẵn sàng nhận phỏng vấn & trao đổi công việc</h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Ưu tiên vị trí Full-Stack Developer hoặc AI/ML Engineer (Fresher / Junior / Mid-Level).
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href="/CV_VanTrongDuong.docx"
                download="CV_VanTrongDuong.docx"
                className="px-4 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-xs transition-colors"
              >
                Download CV (DOCX)
              </a>
              <a
                href="mailto:vtduong04@gmail.com"
                className="px-4 py-2.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
              >
                vtduong04@gmail.com
              </a>
              <Link
                href="/"
                className="px-4 py-2.5 rounded bg-[#7aa2f7]/20 hover:bg-[#7aa2f7]/30 border border-[#7aa2f7]/50 text-[#89b4fa] font-bold font-mono text-xs transition-colors"
              >
                Open WebOS &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 font-mono pt-4 pb-8">
          {DEVELOPER_CONFIG.alias} Portfolio OS &copy; {new Date().getFullYear()} — {DEVELOPER_CONFIG.name}. Built with Next.js & Tailwind CSS.
        </footer>
      </div>
    </main>
  );
}
