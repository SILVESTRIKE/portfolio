/*
Reason for existence: Client interactive view component for 30s executive resume summary providing seamless real-time bilingual switching (English / Vietnamese) with persistent i18n synchronization.
System impact if absent: The resume page will fail to provide localized content for international recruiters and cannot switch languages dynamically.
*/

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { DEVELOPER_CONFIG } from '@/config';

interface ProjectTranslation {
  name: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  problem: string;
  architecture: string;
  contribution: string;
  result: string;
  tech: string[];
  repoUrl?: string;
  liveUrl?: string;
}

interface ResumeContent {
  backButton: string;
  downloadCv: string;
  contactMe: string;
  dossierBadge: string;
  roleTitle: string;
  locationLabel: string;
  emailLabel: string;
  educationLabel: string;
  statusLabel: string;
  whatIDoTitle: string;
  whatIDoBody: string;
  projectsHeader: string;
  projectsSub: string;
  problemLabel: string;
  archLabel: string;
  contribLabel: string;
  resultLabel: string;
  sourceCode: string;
  liveDemo: string;
  skillsHeader: string;
  ctaTitle: string;
  ctaSubtitle: string;
  openWebOS: string;
  footerCopy: string;
  projects: ProjectTranslation[];
  skills: Array<{ category: string; items: string[] }>;
}

const RESUME_DATA: Record<'en' | 'vi', ResumeContent> = {
  vi: {
    backButton: 'Mở WebOS Tương tác Đầy đủ (Desktop Mode)',
    downloadCv: 'Tải CV (DOCX)',
    contactMe: 'Liên hệ',
    dossierBadge: 'Hồ sơ Ứng viên - Tóm tắt 30 Giây',
    roleTitle: DEVELOPER_CONFIG.title,
    locationLabel: 'Khu vực:',
    emailLabel: 'Email:',
    educationLabel: 'Học vấn:',
    statusLabel: 'Trạng thái: SẴN SÀNG NHẬN VIỆC',
    whatIDoTitle: 'Mục tiêu & Chuyên môn',
    whatIDoBody:
      'Tôi xây dựng các ứng dụng web toàn diện (Full-Stack) có hiệu năng cao và tích hợp các mô hình trí tuệ nhân tạo (AI/ML) vào quy trình thực tế. Thế mạnh chính nằm ở kiến trúc Next.js/TypeScript, thiết kế hệ thống cơ sở dữ liệu và triển khai pipeline suy luận AI thực tế với độ trễ thấp.',
    projectsHeader: 'Dự án Kỹ thuật Tiêu biểu',
    projectsSub: 'Kiến trúc & Chỉ số Định lượng',
    problemLabel: 'Bài toán:',
    archLabel: 'Kiến trúc:',
    contribLabel: 'Đóng góp chính:',
    resultLabel: 'Kết quả đạt được:',
    sourceCode: 'Mã nguồn',
    liveDemo: 'Bản Demo',
    skillsHeader: 'Kỹ năng & Ngăn xếp Công nghệ Cốt lõi',
    ctaTitle: 'Sẵn sàng nhận phỏng vấn & trao đổi công việc',
    ctaSubtitle:
      'Ưu tiên vị trí Full-Stack Developer hoặc AI/ML Engineer (Fresher / Junior / Mid-Level).',
    openWebOS: 'Mở WebOS Desktop',
    footerCopy: `${DEVELOPER_CONFIG.alias} Portfolio OS — ${DEVELOPER_CONFIG.name}. Xây dựng trên nền tảng Next.js & Tailwind CSS.`,
    projects: [
      {
        name: 'Samco Binh Tan WebApp',
        badge: 'ĐANG HOẠT ĐỘNG / PRODUCTION CMS',
        badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
        tagline: 'Hệ thống Quản trị Kinh doanh Ô tô & Catalog Xe điện VinFast',
        problem:
          'Xây dựng nền tảng quản trị kinh doanh và catalog xe điện VinFast nhằm số hóa quy trình bán hàng, cấu hình báo giá và theo dõi tồn kho xe cho đại lý Samco Bình Tân.',
        architecture:
          'Next.js 14 App Router kết hợp Server Actions xử lý logic nghiệp vụ bảo mật, Prisma ORM giao tiếp cơ sở dữ liệu PostgreSQL, và Zustand điều phối trạng thái cấu hình xe thời gian thực.',
        contribution:
          'Trực tiếp thiết kế toàn bộ schema cơ sở dữ liệu quan hệ, xây dựng CMS quản trị tồn kho xe, pipeline xử lý lead khách hàng và phân quyền nhân viên đa cấp.',
        result:
          'Giúp rút ngắn 40% thời gian xử lý báo giá cho nhân viên kinh doanh, đồng bộ tồn kho tức thì, phục vụ 15,000+ monthly visits và đạt thời gian phản hồi giao diện dưới 300ms với 0 downtime.',
        tech: ['Next.js 14', 'TypeScript', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'Zustand', 'TailwindCSS'],
        repoUrl: 'https://github.com/SILVESTRIKE/samco-binhtan-webapp'
      },
      {
        name: 'Veritas Legal RAG (Khóa luận Tốt nghiệp)',
        badge: 'ĐANG HOẠT ĐỘNG / THESIS RAG',
        badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        tagline: 'Hệ thống Hỏi đáp Pháp luật Đất đai Việt Nam & Kiến trúc Hybrid RAG',
        problem:
          'Tra cứu và đối soát thủ tục đăng ký đất đai và văn bản quy phạm pháp luật Việt Nam thường tốn nhiều giờ và dễ sai sót do khối lượng điều luật phân tán, chồng chéo.',
        architecture:
          'Pipeline Hybrid RAG kết hợp Sparse (BM25) và Dense Retrieval (BGE-M3) trên Qdrant Vector DB, kết hợp Cross-Encoder Reranker và LangGraph Orchestrator điều phối multi-step reasoning.',
        contribution:
          'Trực tiếp thiết kế legal chunking, thuật toán hybrid fusion (alpha weighting), và bộ test benchmark 1,200 câu hỏi luật đất đai thực tế.',
        result:
          'Đạt Top-5 Retrieval Recall 92.4% trên 15,420 điều khoản luật đất đai, giảm thời gian tổng hợp đối soát hồ sơ từ 45 phút xuống dưới 3.5 giây với độ trễ rerank 48ms.',
        tech: ['Python 3.11', 'LangGraph', 'Qdrant Vector DB', 'BGE-M3 Embeddings', 'Cross-Encoder', 'PyTorch', 'FastAPI'],
        repoUrl: 'https://github.com/SILVESTRIKE/Veritas-Legal-RAG'
      },
      {
        name: 'DogDexx AI',
        badge: 'ĐANG HOẠT ĐỘNG / EDGE DEPLOYED',
        badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
        tagline: 'Nhận diện Giống chó bằng Trí tuệ Nhân tạo & Sổ Sức khỏe Thú cưng',
        problem:
          'Nhận diện tức thì giống chó từ ảnh, video hoặc camera trực tiếp để hỗ trợ tra cứu đặc tính và quản lý sổ tiêm chủng y tế thú cưng cho người nuôi và phòng khám thú y.',
        architecture:
          'Client Next.js kết nối qua Node.js Backend-For-Frontend (BFF) tới Python AI Microservice chạy mô hình PyTorch CNN (ResNet), lưu trữ dữ liệu MongoDB và stream media qua Cloudinary CDN.',
        contribution:
          'Tự tay huấn luyện và tối ưu mô hình CNN, thiết kế API pipeline inference độ trễ thấp và xây dựng toàn bộ giao diện quản trị sổ theo dõi sức khỏe thú cưng.',
        result:
          'Đạt độ chính xác 94% trên 120 giống chó phổ biến, thời gian phản hồi suy luận dưới 180ms trên Edge Deployment tại dogdexx.vercel.app với 100% test pass.',
        tech: ['PyTorch CNN', 'Python', 'Next.js', 'Node.js BFF', 'MongoDB', 'Cloudinary CDN', 'TailwindCSS'],
        repoUrl: 'https://github.com/SILVESTRIKE/DogDexx',
        liveUrl: 'https://dogdexx.vercel.app'
      },
      {
        name: 'Doru Desktop Voice AI',
        badge: 'ĐANG HOẠT ĐỘNG / LOCAL ENGINE',
        badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        tagline: 'Trợ lý Giọng nói Máy trạm Linux Hoạt động Hoàn toàn Cục bộ (Offline)',
        problem:
          'Trợ lý giọng nói cá nhân chạy hoàn toàn cục bộ trên máy trạm Linux Hyprland, phục vụ điều khiển hệ thống và giải đáp thông minh mà không phụ thuộc internet hay làm lộ dữ liệu cá nhân.',
        architecture:
          'Pipeline âm thanh đa luồng: Silero VAD bắt giọng nói -> RepCNN phát hiện từ khóa (wakeword) -> Faster-Whisper STT -> 8-node LangGraph Orchestrator định tuyến -> Groq LPU (Agnes 2.0 fallback) -> Kokoro ONNX TTS.',
        contribution:
          'Thiết kế kiến trúc LangGraph tự phục hồi lỗi, quản lý luồng stream audio đa tiến trình không nghẽn tài nguyên và xây dựng RPC sidecar giao tiếp với desktop window manager.',
        result:
          'Thời gian phản hồi giọng nói trọn vòng (end-to-end loop) dưới 650ms trên môi trường local với mức sử dụng RAM dưới 800MB và độ tin cậy wakeword 0.94.',
        tech: ['Python', 'LangGraph', 'Faster-Whisper', 'Silero VAD', 'Kokoro TTS', 'Groq LPU', 'Hyprland Linux']
      }
    ],
    skills: [
      { category: 'Frontend & Giao diện Web', items: ['TypeScript', 'Next.js 14/15', 'React 19', 'TailwindCSS', 'Zustand', 'HTML5 / CSS3'] },
      { category: 'Backend & Hệ thống Máy chủ', items: ['Node.js', 'Express', 'Python', 'Prisma ORM', 'PostgreSQL', 'MongoDB', 'REST & GraphQL APIs'] },
      { category: 'Kỹ nghệ AI & Dữ liệu', items: ['PyTorch (CNN / Vision)', 'LangGraph', 'Whisper STT', 'Hugging Face', 'Groq LPU Inference'] },
      { category: 'DevOps & Môi trường Phát triển', items: ['Linux (Arch / Ubuntu)', 'Docker', 'Git / GitHub CI', 'Vercel Edge', 'Bash Scripting'] }
    ]
  },
  en: {
    backButton: 'Launch Full Interactive WebOS (Desktop Mode)',
    downloadCv: 'Download CV (DOCX)',
    contactMe: 'Contact Me',
    dossierBadge: 'Candidate Dossier - 30s Executive Summary',
    roleTitle: DEVELOPER_CONFIG.title,
    locationLabel: 'Location:',
    emailLabel: 'Email:',
    educationLabel: 'Education:',
    statusLabel: 'Status: OPEN_FOR_HIRE',
    whatIDoTitle: 'What I Do',
    whatIDoBody:
      'I architect high-performance full-stack web applications and deploy production AI/ML models into real-world business workflows. Core strengths include scalable Next.js/TypeScript architectures, relational and vector database systems, and low-latency AI inference pipelines.',
    projectsHeader: 'Selected Engineering Projects',
    projectsSub: 'Architecture & Metrics',
    problemLabel: 'Problem:',
    archLabel: 'Architecture:',
    contribLabel: 'Contribution:',
    resultLabel: 'Result:',
    sourceCode: 'Source Code',
    liveDemo: 'Live Demo',
    skillsHeader: 'Core Technology Stack',
    ctaTitle: 'Open for Interviews & Engineering Opportunities',
    ctaSubtitle:
      'Targeting Full-Stack Developer or AI/ML Engineer positions (Fresher / Junior / Mid-Level).',
    openWebOS: 'Open WebOS Desktop',
    footerCopy: `${DEVELOPER_CONFIG.alias} Portfolio OS — ${DEVELOPER_CONFIG.name}. Built with Next.js & Tailwind CSS.`,
    projects: [
      {
        name: 'Samco Binh Tan WebApp',
        badge: 'RUNNING / PRODUCTION CMS',
        badgeColor: 'border-sky-500/40 text-sky-400 bg-sky-500/10',
        tagline: 'VinFast EV Sales CMS & Automotive E-Commerce Platform',
        problem:
          'Engineered a digital sales management and VinFast electric vehicle catalog system to digitize sales workflows, vehicle quotation calculations, and real-time inventory tracking for Samco Binh Tan dealership.',
        architecture:
          'Next.js 14 App Router with secure Server Actions for business logic, Prisma ORM interfacing with PostgreSQL, and Zustand for real-time client-side vehicle configuration state management.',
        contribution:
          'Designed relational schema from scratch, built the inventory management CMS, lead processing pipeline, and multi-tier role-based staff authorization.',
        result:
          'Reduced salesperson quotation processing time by 40%, synchronized vehicle inventory in real-time, sustained 15,000+ monthly visits with sub-300ms UI response times and 0 downtime.',
        tech: ['Next.js 14', 'TypeScript', 'Node.js', 'Prisma ORM', 'PostgreSQL', 'Zustand', 'TailwindCSS'],
        repoUrl: 'https://github.com/SILVESTRIKE/samco-binhtan-webapp'
      },
      {
        name: 'Veritas Legal RAG (Graduation Thesis)',
        badge: 'RUNNING / THESIS RAG',
        badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        tagline: 'Vietnamese Land Registration Legal Intelligence & Hybrid RAG Architecture',
        problem:
          'Researching and cross-checking Vietnamese land registration statutes typically requires hours and is error-prone due to fragmented, overlapping legal provisions.',
        architecture:
          'Hybrid RAG pipeline combining Sparse (BM25) and Dense Retrieval (BGE-M3) over Qdrant Vector DB, paired with Cross-Encoder reranking and LangGraph orchestration for multi-step reasoning.',
        contribution:
          'Formulated domain-specific legal chunking, hybrid score fusion (alpha weighting), and curated a benchmark dataset of 1,200 real-world land law inquiries.',
        result:
          'Achieved 92.4% Top-5 Retrieval Recall across 15,420 legal clauses, cutting record cross-check synthesis time from 45 minutes to under 3.5 seconds with 48ms reranker latency.',
        tech: ['Python 3.11', 'LangGraph', 'Qdrant Vector DB', 'BGE-M3 Embeddings', 'Cross-Encoder', 'PyTorch', 'FastAPI'],
        repoUrl: 'https://github.com/SILVESTRIKE/Veritas-Legal-RAG'
      },
      {
        name: 'DogDexx AI',
        badge: 'RUNNING / EDGE DEPLOYED',
        badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
        tagline: 'AI Dog Breed Identification & Pet Health Passport',
        problem:
          'Instantly recognize dog breeds from uploaded photos or live camera feeds to look up breed traits and maintain medical vaccination health records for owners and veterinary clinics.',
        architecture:
          'Next.js client connecting via Node.js BFF to Python AI microservice executing a PyTorch CNN (ResNet), backed by MongoDB and media streaming through Cloudinary CDN.',
        contribution:
          'Trained and quantized the CNN model, engineered low-latency inference endpoints, and implemented the full pet medical passport dashboard.',
        result:
          'Attained 94% classification accuracy across 120 common breeds with sub-180ms inference response times deployed on Vercel Edge at dogdexx.vercel.app with 100% unit test pass.',
        tech: ['PyTorch CNN', 'Python', 'Next.js', 'Node.js BFF', 'MongoDB', 'Cloudinary CDN', 'TailwindCSS'],
        repoUrl: 'https://github.com/SILVESTRIKE/DogDexx',
        liveUrl: 'https://dogdexx.vercel.app'
      },
      {
        name: 'Doru Desktop Voice AI',
        badge: 'RUNNING / LOCAL ENGINE',
        badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        tagline: 'Offline-First Linux Desktop Voice Assistant',
        problem:
          'Personal desktop voice assistant executing entirely on-premise on Linux Hyprland workstation, controlling system operations without external cloud dependencies or privacy leaks.',
        architecture:
          'Multi-threaded audio pipeline: Silero VAD -> RepCNN wakeword detection -> Faster-Whisper STT -> 8-node LangGraph Orchestrator -> Groq LPU (Agnes 2.0 fallback) -> Kokoro ONNX TTS.',
        contribution:
          'Designed resilient self-healing LangGraph state machine, zero-blocking multiprocessing audio streaming, and UNIX socket RPC bridge to window manager.',
        result:
          'Full end-to-end voice loop latency under 650ms on local machine with under 800MB RAM footprint and 0.94 wakeword detection confidence.',
        tech: ['Python', 'LangGraph', 'Faster-Whisper', 'Silero VAD', 'Kokoro TTS', 'Groq LPU', 'Hyprland Linux']
      }
    ],
    skills: [
      { category: 'Frontend & Web', items: ['TypeScript', 'Next.js 14/15', 'React 19', 'TailwindCSS', 'Zustand', 'HTML5 / CSS3'] },
      { category: 'Backend & Systems', items: ['Node.js', 'Express', 'Python', 'Prisma ORM', 'PostgreSQL', 'MongoDB', 'REST & GraphQL APIs'] },
      { category: 'AI & Data Engineering', items: ['PyTorch (CNN / Vision)', 'LangGraph', 'Whisper STT', 'Hugging Face', 'Groq LPU Inference'] },
      { category: 'DevOps & Tooling', items: ['Linux (Arch / Ubuntu)', 'Docker', 'Git / GitHub CI', 'Vercel Edge', 'Bash Scripting'] }
    ]
  }
};

export function ResumeView() {
  const { locale, setLocale } = useI18n();
  const searchParams = useSearchParams();

  // Allow query parameter override e.g. /resume?lang=vi or /resume?lang=en
  useEffect(() => {
    const qLang = searchParams?.get('lang');
    if (qLang === 'vi' || qLang === 'en') {
      if (qLang !== locale) {
        setLocale(qLang);
      }
    }
  }, [searchParams, locale, setLocale]);

  const data = RESUME_DATA[locale] || RESUME_DATA.vi;

  return (
    <main className="min-h-screen w-full bg-[#080b12] text-slate-200 font-sans selection:bg-[#7aa2f7]/30 selection:text-white px-4 py-8 sm:py-12 select-text">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Top Navigation & Direct Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-[#7aa2f7] hover:text-white transition-colors"
          >
            <span>&larr;</span>
            <span>{data.backButton}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Toggle Pill */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded p-0.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setLocale('vi')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'vi'
                    ? 'bg-[#7aa2f7] text-black font-bold shadow-[0_0_8px_rgba(122,162,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  locale === 'en'
                    ? 'bg-[#7aa2f7] text-black font-bold shadow-[0_0_8px_rgba(122,162,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <a
              href="/CV_VanTrongDuong.docx"
              download="CV_VanTrongDuong.docx"
              className="px-3 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold font-mono transition-colors"
            >
              {data.downloadCv}
            </a>

            <a
              href={`mailto:${DEVELOPER_CONFIG.contact.email}`}
              className="px-3 py-1.5 rounded bg-[#7aa2f7]/15 hover:bg-[#7aa2f7]/25 border border-[#7aa2f7]/30 text-[#89b4fa] text-xs font-semibold font-mono transition-colors"
            >
              {data.contactMe}
            </a>
          </div>
        </div>

        {/* 1. IDENTITY */}
        <section className="space-y-3">
          <div className="inline-block px-2.5 py-0.5 rounded bg-[#7aa2f7]/10 text-[#7aa2f7] border border-[#7aa2f7]/20 text-xs font-mono font-bold uppercase tracking-wider">
            {data.dossierBadge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {DEVELOPER_CONFIG.name}{' '}
            <span className="text-[#7aa2f7] font-mono text-xl sm:text-2xl font-normal">
              ({DEVELOPER_CONFIG.alias})
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-medium">
            {data.roleTitle}
          </p>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-mono text-slate-400">
            <span>
              {data.locationLabel} {DEVELOPER_CONFIG.location}
            </span>
            <span>
              {data.emailLabel} {DEVELOPER_CONFIG.contact.email}
            </span>
            <span>
              {data.educationLabel} {DEVELOPER_CONFIG.education.university.short} ({DEVELOPER_CONFIG.education.degree.formal})
            </span>
            <span className="text-emerald-400 font-bold">{data.statusLabel}</span>
          </div>
        </section>

        {/* 2. WHAT I DO */}
        <section className="p-4 sm:p-5 rounded-lg bg-[#0e1422] border border-white/10 space-y-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#7aa2f7] font-bold">
            {data.whatIDoTitle}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
            {data.whatIDoBody}
          </p>
        </section>

        {/* 3. SELECTED PROJECTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7aa2f7]" />
              {data.projectsHeader}
            </h2>
            <span className="text-xs text-slate-500 font-mono">{data.projectsSub}</span>
          </div>

          <div className="space-y-4">
            {data.projects.map((proj) => (
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
                    <strong className="text-[#7aa2f7] font-mono">{data.problemLabel} </strong>
                    <span>{proj.problem}</span>
                  </div>
                  <div>
                    <strong className="text-[#89b4fa] font-mono">{data.archLabel} </strong>
                    <span>{proj.architecture}</span>
                  </div>
                  <div>
                    <strong className="text-amber-300 font-mono">{data.contribLabel} </strong>
                    <span>{proj.contribution}</span>
                  </div>
                  <div>
                    <strong className="text-[#9ece6a] font-mono">{data.resultLabel} </strong>
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
                        {data.sourceCode} &rarr;
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#9ece6a] hover:underline"
                      >
                        {data.liveDemo} &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. TECH STACK */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9ece6a]" />
            {data.skillsHeader}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.skills.map((cat) => (
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
              <h2 className="text-lg font-bold text-white">{data.ctaTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-300">{data.ctaSubtitle}</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <a
                href="/CV_VanTrongDuong.docx"
                download="CV_VanTrongDuong.docx"
                className="px-4 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-xs transition-colors"
              >
                {data.downloadCv}
              </a>
              <a
                href={`mailto:${DEVELOPER_CONFIG.contact.email}`}
                className="px-4 py-2.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
              >
                {DEVELOPER_CONFIG.contact.email}
              </a>
              <Link
                href="/"
                className="px-4 py-2.5 rounded bg-[#7aa2f7]/20 hover:bg-[#7aa2f7]/30 border border-[#7aa2f7]/50 text-[#89b4fa] font-bold font-mono text-xs transition-colors"
              >
                {data.openWebOS} &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Footer with Bilingual Switcher */}
        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono pt-4 pb-8 border-t border-white/5">
          <div>{data.footerCopy}</div>
          <div className="flex items-center gap-2">
            <span>Ngôn ngữ / Language:</span>
            <button
              onClick={() => setLocale(locale === 'en' ? 'vi' : 'en')}
              className="text-[#7aa2f7] hover:underline font-bold"
            >
              {locale === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
