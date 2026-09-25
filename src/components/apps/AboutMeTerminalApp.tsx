/*
Reason for existence: Terminal-formatted About Me application presenting developer profile, technical stack, featured projects, thesis research, and contact information based on SILVESTRIKE GitHub README.
System impact if absent: WebOS workspace will lack a dedicated terminal-style personal dossier and developer portfolio about page.
*/

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AboutMeTerminalAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}

type CommandSection = 'all' | 'bio' | 'skills' | 'projects' | 'thesis' | 'contact' | 'man';

export function AboutMeTerminalApp({ onNotify, onOpenApp }: AboutMeTerminalAppProps) {
  const [activeSection, setActiveSection] = useState<CommandSection>('all');
  const [cliInput, setCliInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    if (onNotify) {
      onNotify(`Copied ${label} to clipboard`, 'info');
    }
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setHistory(prev => [...prev, raw]);
    setHistoryIdx(-1);
    setCliInput('');

    if (cmd === 'clear' || cmd === 'cls') {
      setActiveSection('bio');
    } else if (cmd === 'all' || cmd === 'cat readme.md' || cmd === 'cat readme') {
      setActiveSection('all');
    } else if (cmd === 'whoami' || cmd === 'bio' || cmd === 'cat bio.md' || cmd === 'about') {
      setActiveSection('bio');
    } else if (cmd === 'skills' || cmd === 'tech' || cmd === 'stack' || cmd === 'cat tech-stack.yml') {
      setActiveSection('skills');
    } else if (cmd === 'projects' || cmd === 'ls projects' || cmd === 'ls -la projects') {
      setActiveSection('projects');
    } else if (cmd === 'thesis' || cmd === 'veritas' || cmd === 'cat thesis.md') {
      setActiveSection('thesis');
    } else if (cmd === 'contact' || cmd === 'email' || cmd === 'cat contact.txt') {
      setActiveSection('contact');
    } else if (cmd === 'man' || cmd === 'man silvestrike' || cmd === 'help') {
      setActiveSection('man');
    } else if (cmd.startsWith('git') || cmd === 'gitkraken') {
      if (onOpenApp) onOpenApp('app-gitkraken');
      if (onNotify) onNotify('Opening GitKraken Studio...', 'info');
    } else if (cmd.startsWith('service') || cmd === 'services') {
      if (onOpenApp) onOpenApp('app-services');
      if (onNotify) onNotify('Opening Microservices Catalog...', 'info');
    } else {
      if (onNotify) onNotify(`Unknown command: '${cmd}'. Type 'help' for available commands.`, 'warn');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(cliInput);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const next = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(next);
        setCliInput(history[next] ?? '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx !== -1) {
        if (historyIdx < history.length - 1) {
          const next = historyIdx + 1;
          setHistoryIdx(next);
          setCliInput(history[next] ?? '');
        } else {
          setHistoryIdx(-1);
          setCliInput('');
        }
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const quickNav = [
    { id: 'all' as CommandSection, cmd: 'cat README.md', label: 'Full Dossier' },
    { id: 'bio' as CommandSection, cmd: 'whoami', label: 'Biography' },
    { id: 'skills' as CommandSection, cmd: 'tree skills/', label: 'Tech Stack' },
    { id: 'projects' as CommandSection, cmd: 'ls -la projects/', label: 'Featured Projects' },
    { id: 'thesis' as CommandSection, cmd: 'cat thesis.md', label: 'Veritas Thesis' },
    { id: 'contact' as CommandSection, cmd: 'cat contact.txt', label: 'Contact' },
    { id: 'man' as CommandSection, cmd: 'man silvestrike', label: 'Manual Page' }
  ];

  return (
    <div className="h-full w-full flex flex-col bg-[#0a0d14] text-slate-200 font-mono text-xs select-text overflow-hidden">
      {/* Top Terminal Chrome / Tab Selector */}
      <div className="h-10 bg-[#121622] border-b border-white/10 px-3 flex items-center justify-between gap-2 shrink-0 select-none">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {quickNav.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-slate-500">$</span>
                <span>{item.cmd}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SILVESTRIKE PRO</span>
        </div>
      </div>

      {/* Main Terminal Viewport */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 leading-relaxed">
        {/* Terminal Header Banner */}
        <div className="border border-sky-500/30 bg-sky-950/10 rounded-lg p-4 font-mono">
          <div className="text-sky-400 font-bold text-sm tracking-wide">
            VAN TRONG DUONG (SILVESTRIKE)
          </div>
          <div className="text-slate-300 mt-1">
            Full-Stack Developer | AI/ML Engineer | Aspiring Solutions Architect
          </div>
          <div className="text-slate-500 text-[11px] mt-2 flex flex-wrap gap-4">
            <span>Location: HCMC, Vietnam</span>
            <span>Education: B.Eng IT @ HUIT (GPA: 3.2/4.0 | IELTS: 6.5)</span>
            <span>Status: Final Year Thesis &amp; R&amp;D</span>
          </div>
        </div>

        {/* SECTION: WHOAMI / BIO */}
        {(activeSection === 'all' || activeSection === 'bio') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>whoami --verbose</span>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
              <pre className="text-sky-300 text-[11px] leading-snug overflow-x-auto">
{`name: Van Trong Duong
alias: SILVESTRIKE
role: Full-Stack Developer • AI/ML Engineer
education: B.Eng in Information Technology @ Ho Chi Minh City University of Industry and Trade (HUIT)
metrics: GPA: 3.2 / 4.0 | IELTS: 6.5
objective: Solutions Architect & Production AI Systems`}
              </pre>

              <div className="text-slate-300 text-[11px] leading-relaxed pt-2 border-t border-white/5">
                I am a final-year Information Technology Engineering student with extensive hands-on experience in building and deploying end-to-end full-stack platforms and AI architectures.
                My engineering approach combines solid Clean Architecture, modular service design, and deep learning pipelines.
                My long-term aspiration is to architect high-throughput, fault-tolerant enterprise systems that bridge business goals with production AI solutions.
              </div>
            </div>
          </div>
        )}

        {/* SECTION: SKILLS / TECH STACK */}
        {(activeSection === 'all' || activeSection === 'skills') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>cat /etc/profile.d/tech-stack.yml</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Programming Languages */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2">
                <div className="text-sky-400 font-bold text-[11px] flex items-center justify-between">
                  <span>[1] CORE PROGRAMMING LANGUAGES</span>
                  <span className="text-[10px] text-slate-500">6 DIALECTS</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { name: 'Python', level: 'Primary / PyTorch / Fast' },
                    { name: 'TypeScript', level: 'Next.js / Node' },
                    { name: 'JavaScript', level: 'ESNext / Web' },
                    { name: 'C#', level: '.NET WinForms / ASP.NET' },
                    { name: 'PHP', level: 'Laravel / MVC' },
                    { name: 'SQL', level: 'PostgreSQL / SQL Server' }
                  ].map(lang => (
                    <div key={lang.name} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[11px]">
                      <span className="text-slate-200 font-semibold">{lang.name}</span>
                      <span className="text-slate-500 text-[10px] ml-1.5">({lang.level})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI & Deep Learning */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2">
                <div className="text-emerald-400 font-bold text-[11px] flex items-center justify-between">
                  <span>[2] AI / ML &amp; DEEP LEARNING</span>
                  <span className="text-[10px] text-slate-500">COMPUTER VISION &amp; LLMS</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'PyTorch', 'TensorFlow', 'OpenCV', 'MediaPipe', 'YOLO',
                    'LangGraph', 'LangChain', 'Silero VAD', 'Whisper STT',
                    'Kokoro TTS', 'Jupyter Lab'
                  ].map(tool => (
                    <span key={tool} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-300">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full-Stack Web */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2">
                <div className="text-purple-400 font-bold text-[11px] flex items-center justify-between">
                  <span>[3] WEB ARCHITECTURE &amp; FRAMEWORKS</span>
                  <span className="text-[10px] text-slate-500">FRONT &amp; BACKEND</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'Next.js 14/15', 'React.js', 'Node.js', 'Express.js',
                    'ASP.NET Core', '.NET WinForms', 'Laravel', 'REST APIs',
                    'WebSocket', 'Clean Architecture'
                  ].map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[10px] text-purple-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Databases & Infrastructure */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2">
                <div className="text-amber-400 font-bold text-[11px] flex items-center justify-between">
                  <span>[4] DATABASES &amp; CLOUD DEVOPS</span>
                  <span className="text-[10px] text-slate-500">DATA &amp; SYSTEM</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    'PostgreSQL', 'MongoDB', 'Microsoft SQL Server', 'Prisma ORM',
                    'Docker', 'Linux / Ubuntu', 'Git / GitHub', 'CI/CD Pipelines',
                    'Cloudinary', 'Vercel Edge'
                  ].map(db => (
                    <span key={db} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] text-amber-300">
                      {db}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: FEATURED PROJECTS */}
        {(activeSection === 'all' || activeSection === 'projects') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>ls -la --sort=time ~/projects/</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Project 1: samco-binhtan-webapp */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sky-300 font-bold text-xs truncate">
                      samco-binhtan-webapp
                    </span>
                    <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0">
                      Internship 2025
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Samco VinFast EV Sales CMS &amp; E-commerce Platform
                  </div>
                  <div className="text-slate-300 text-[11px] mt-2 leading-relaxed">
                    Enterprise-grade automotive platform for electric vehicle inventory and training workflows. Engineered dynamic variant catalog using Next.js 14 App Router, Prisma ORM, and high-concurrency Express APIs.
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>TypeScript | Next.js 14 | Node | Prisma</span>
                  <a
                    href="https://github.com/SILVESTRIKE/samco-binhtan-webapp"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline font-bold"
                  >
                    View Repo &rarr;
                  </a>
                </div>
              </div>

              {/* Project 2: DogDexx */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sky-300 font-bold text-xs truncate">
                      DogDexx
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0">
                      Deployed Live
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Intelligent Dog Species ID &amp; Health Record System
                  </div>
                  <div className="text-slate-300 text-[11px] mt-2 leading-relaxed">
                    AI-powered computer vision identification platform combining CNN deep learning inference with pet health record bookkeeping. Deployed on Vercel Edge with Cloudinary image streaming.
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>PyTorch | Next.js | MongoDB | Cloudinary</span>
                  <a
                    href="https://dogdexx.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-bold"
                  >
                    Visit App &rarr;
                  </a>
                </div>
              </div>

              {/* Project 3: Doru_AI */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sky-300 font-bold text-xs truncate">
                      Doru_AI
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0">
                      Host Engine
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Personal Desktop AI Assistant on Linux Hyprland
                  </div>
                  <div className="text-slate-300 text-[11px] mt-2 leading-relaxed">
                    Offline-first desktop voice agent orchestrating 8-node LangGraph, Silero VAD, RepCNN wakeword detector, faster-whisper STT, Kokoro ONNX TTS, and dual Groq LPU / Agnes 2.0 LLMs.
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Python | LangGraph | Silero | Whisper | Groq</span>
                  <span className="text-emerald-400 font-mono text-[10px]">Active Local Host</span>
                </div>
              </div>

              {/* Project 4: WebBanTra & POS */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sky-300 font-bold text-xs truncate">
                      WebBanTra &amp; CafePOS
                    </span>
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0">
                      Coursework 2024
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    E-Commerce Platform &amp; WinForms Retail POS Suite
                  </div>
                  <div className="text-slate-300 text-[11px] mt-2 leading-relaxed">
                    End-to-end commerce platforms built with ASP.NET Core, C# WinForms, and relational SQL Server with stored procedures for real-time inventory management and invoice tracking.
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>C# | ASP.NET Core | WinForms | SQL Server</span>
                  <a
                    href="https://github.com/SILVESTRIKE/WebBanTra"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline font-bold"
                  >
                    View Repo &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: THESIS & CURRENT FOCUS */}
        {(activeSection === 'all' || activeSection === 'thesis') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>cat /opt/research/thesis.md</span>
            </div>

            <div className="bg-black/40 border border-purple-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-bold text-xs uppercase tracking-wide">
                  GRADUATION THESIS: VERITAS AI
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  IN PROGRESS (2025-2026)
                </span>
              </div>

              <div className="text-slate-200 text-[11px] leading-relaxed">
                Veritas is an AI-powered enterprise pipeline specialized in digitizing and querying Vietnamese land registration records and legal texts using advanced Retrieval-Augmented Generation (RAG) architecture and fine-tuned LLMs.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[10px]">
                <div className="p-2 bg-white/[0.02] rounded border border-white/5">
                  <div className="text-purple-400 font-bold mb-1">RAG Pipeline</div>
                  <div className="text-slate-400">Hybrid dense/sparse embeddings with vector store reranking.</div>
                </div>
                <div className="p-2 bg-white/[0.02] rounded border border-white/5">
                  <div className="text-sky-400 font-bold mb-1">Fine-Tuning</div>
                  <div className="text-slate-400">Domain-specific legal parameter tuning and evaluation.</div>
                </div>
                <div className="p-2 bg-white/[0.02] rounded border border-white/5">
                  <div className="text-emerald-400 font-bold mb-1">Impact</div>
                  <div className="text-slate-400">Zero-latency compliance lookups for Vietnamese public administration.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: CONTACT & CONNECT */}
        {(activeSection === 'all' || activeSection === 'contact') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>cat /etc/motd.contact</span>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="text-slate-300 text-[11px]">
                I am actively seeking Software Engineer (Full-stack / Backend) and AI/ML Engineer opportunities. I respond promptly to all professional inquiries.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Email */}
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">EMAIL ADDRESS</div>
                    <div className="text-slate-100 font-bold text-xs truncate mt-0.5">vtduong04@gmail.com</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="mailto:vtduong04@gmail.com"
                      className="px-2 py-1 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-black rounded text-[10px] font-bold transition-colors"
                    >
                      Send Mail
                    </a>
                    <button
                      onClick={() => handleCopy('vtduong04@gmail.com', 'Email')}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] transition-colors"
                    >
                      {copiedText === 'Email' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Facebook */}
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">FACEBOOK SOCIAL</div>
                    <div className="text-slate-100 font-bold text-xs truncate mt-0.5">fb.com/hakudevon</div>
                  </div>
                  <a
                    href="https://www.facebook.com/hakudevon"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white rounded text-[10px] font-bold transition-colors text-center"
                  >
                    Open Profile &rarr;
                  </a>
                </div>

                {/* GitHub */}
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg flex flex-col justify-between gap-2">
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold">GITHUB PROFILE</div>
                    <div className="text-slate-100 font-bold text-xs truncate mt-0.5">github.com/SILVESTRIKE</div>
                  </div>
                  <a
                    href="https://github.com/SILVESTRIKE"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-white/10 text-slate-200 hover:bg-white/20 rounded text-[10px] font-bold transition-colors text-center"
                  >
                    View Repositories &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: MANUAL PAGE */}
        {activeSection === 'man' && (
          <div className="space-y-3 font-mono text-[11px] leading-relaxed">
            <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-emerald-500/20 pb-1">
              <span>root@srv-doru:~/about#</span>
              <span>man 1 silvestrike</span>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-4">
              <div>
                <span className="text-sky-400 font-bold">NAME</span>
                <p className="text-slate-300 ml-4">SILVESTRIKE - Van Trong Duong, software engineer &amp; AI researcher</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold">SYNOPSIS</span>
                <p className="text-slate-300 ml-4">silvestrike [--fullstack] [--ai-ml] [--architecture] [--hire]</p>
              </div>

              <div>
                <span className="text-sky-400 font-bold">DESCRIPTION</span>
                <p className="text-slate-300 ml-4">
                  Graduating IT engineer specializing in robust web services, PyTorch deep learning models, and system architecture.
                  Driven by Clean Architecture, high test coverage, and modular microservices.
                </p>
              </div>

              <div>
                <span className="text-sky-400 font-bold">AVAILABLE COMMANDS</span>
                <div className="text-slate-400 ml-4 space-y-1 mt-1">
                  <div><span className="text-emerald-400">whoami</span> - Display biography and academic background</div>
                  <div><span className="text-emerald-400">skills</span> - Print programming languages and framework tree</div>
                  <div><span className="text-emerald-400">projects</span> - List flagship production and academic systems</div>
                  <div><span className="text-emerald-400">thesis</span> - Inspect Veritas Vietnamese law RAG architecture</div>
                  <div><span className="text-emerald-400">contact</span> - Retrieve verified contact channels and direct links</div>
                  <div><span className="text-emerald-400">all</span> - Display entire dossier in one scrollable page</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive CLI Prompt Footer */}
      <div className="p-2.5 bg-[#0f131d] border-t border-white/10 flex items-center gap-2 shrink-0 select-none">
        <span className="text-emerald-400 font-bold text-xs shrink-0 font-mono">
          silvestrike@about:~$
        </span>
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. 'whoami', 'skills', 'projects', 'thesis', 'contact', 'all')..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-slate-100 outline-none focus:border-sky-400 font-mono placeholder-slate-500"
        />
        <button
          onClick={() => handleCommand(cliInput)}
          className="bg-sky-500/20 text-sky-300 border border-sky-400/40 hover:bg-sky-500 hover:text-black px-3 py-1 rounded text-xs font-mono font-bold transition-colors shrink-0"
        >
          Execute
        </button>
      </div>
    </div>
  );
}
