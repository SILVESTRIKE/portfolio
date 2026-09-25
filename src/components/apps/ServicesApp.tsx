/*
Reason for existence: Systemd and GitHub Microservices Portfolio Hub displaying SILVESTRIKE repositories as active server services with live deployment links, voice telemetry, and interactive sandboxes.
System impact if absent: Users cannot inspect GitHub portfolio projects, run live previews, or interact with repository trial sandboxes.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { portfolioServices } from '@/lib/portfolio';
import { ServiceUnit } from '@/types';
import { useI18n } from '@/lib/i18n';

interface ServicesAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}

export function ServicesApp({ onNotify, onOpenApp }: ServicesAppProps) {
  const { t } = useI18n();
  const [servicesList] = useState<ServiceUnit[]>(portfolioServices);
  const [githubStats, setGithubStats] = useState<Record<string, { stars: number; forks: number; updated: string }>>({});
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSandbox, setActiveSandbox] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGithubRepos() {
      try {
        const res = await fetch('https://api.github.com/users/SILVESTRIKE/repos');
        if (res.ok) {
          const repos = await res.json();
          if (Array.isArray(repos)) {
            const statsMap: Record<string, { stars: number; forks: number; updated: string }> = {};
            for (const r of repos) {
              statsMap[r.name.toLowerCase()] = {
                stars: r.stargazers_count || 0,
                forks: r.forks_count || 0,
                updated: r.updated_at ? r.updated_at.substring(0, 10) : ''
              };
            }
            setGithubStats(statsMap);
          }
        }
      } catch {
        // Keep initial state on failure
      }
    }
    fetchGithubRepos();
  }, []);

  // Sandbox state: DanhGiaCamXuc
  const [sentimentText, setSentimentText] = useState('Dịch vụ này thật sự tuyệt vời và hỗ trợ rất nhiệt tình!');
  const [sentimentResult, setSentimentResult] = useState<{ label: string; score: number; pos: number; neg: number } | null>(null);

  // Sandbox state: Toi_Uu_Gia
  const [priceInput, setPriceInput] = useState(120);
  const [costInput, setCostInput] = useState(45);

  // Sandbox state: document_to_quiz
  const [quizTopic, setQuizTopic] = useState('Kiến trúc hệ thống Linux Kernel và Systemd');
  const [generatedQuiz, setGeneratedQuiz] = useState<Array<{ q: string; a: string[]; correct: number }> | null>(null);

  const filtered = servicesList.filter(s => {
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleRunSentiment = () => {
    const text = sentimentText.toLowerCase();
    const isNeg = text.includes('tệ') || text.includes('xấu') || text.includes('chán') || text.includes('kém') || text.includes('lỗi');
    const isPos = text.includes('tuyệt') || text.includes('tốt') || text.includes('hay') || text.includes('thích') || text.includes('nhanh');

    let pos = 0.5;
    let neg = 0.5;
    if (isPos && !isNeg) { pos = 0.94; neg = 0.06; }
    else if (isNeg && !isPos) { pos = 0.08; neg = 0.92; }
    else { pos = 0.58; neg = 0.42; }

    const label = pos > neg ? 'TÍCH CỰC (POSITIVE)' : 'TIÊU CỰC (NEGATIVE)';
    setSentimentResult({ label, score: Math.max(pos, neg) * 100, pos: pos * 100, neg: neg * 100 });
    if (onNotify) onNotify(`Phân tích cảm xúc: ${label}`, 'info');
  };

  const handleGenerateQuiz = () => {
    setGeneratedQuiz([
      {
        q: 'Tiến trình đầu tiên được khởi tạo trong không gian người dùng của Linux là gì?',
        a: ['systemd (PID 1)', 'kthreadd (PID 2)', 'bash', 'init.d'],
        correct: 0
      },
      {
        q: 'Lệnh nào dùng để theo dõi tài nguyên CPU/RAM theo thời gian thực tương tác?',
        a: ['cat /proc/cpuinfo', 'htop', 'free -m', 'df -h'],
        correct: 1
      },
      {
        q: 'Tập tin cấu hình tên miền cục bộ trên Linux nằm ở đâu?',
        a: ['/etc/hostname', '/etc/hosts', '/etc/resolv.conf', '/var/log/syslog'],
        correct: 1
      }
    ]);
    if (onNotify) onNotify('Tạo thành công 3 câu hỏi trắc nghiệm ôn tập', 'info');
  };

  // Demand Elasticity Calculation
  const elasticity = -1.6;
  const optimalPrice = Math.round((costInput * elasticity) / (1 + elasticity));
  const estimatedDemand = Math.max(10, Math.round(500 * Math.pow(priceInput / 100, elasticity)));
  const estimatedProfit = Math.round(estimatedDemand * (priceInput - costInput));

  const catLabels: Record<string, string> = {
    all: t.apps.services.categoryAll,
    ai: t.apps.services.filterAi,
    system: t.apps.services.filterSystem,
    business: t.apps.services.filterBusiness,
    web: t.apps.services.filterWeb
  };

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto select-none">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded border border-white/10">
          {['all', 'ai', 'system', 'business', 'web'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${
                filterCat === cat
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {catLabels[cat] || cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus-within:border-sky-400">
          <span className="text-slate-500 font-bold">$ grep -i &quot;</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.apps.services.searchPlaceholder}
            className="bg-transparent border-none text-slate-100 outline-none w-48 font-mono text-xs"
          />
          <span className="text-slate-500 font-bold">&quot;</span>
        </div>
      </div>

      {/* Services Grid (Container-Responsive) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {filtered.map((s) => {
          const isDeployed = s.status === 'deployed';
          const isHostEngine = s.name === 'doru-ai.service';

          return (
            <div
              key={s.name}
              className={`bg-white/[0.03] border rounded-lg p-3 flex flex-col justify-between gap-3 transition-all hover:border-white/20 min-w-0 ${
                isHostEngine
                  ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                  : isDeployed
                  ? 'border-sky-500/40 bg-sky-950/10 shadow-[0_0_15px_rgba(56,189,248,0.08)]'
                  : 'border-white/10'
              }`}
            >
              <div className="min-w-0">
                <div className="flex justify-between items-start gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="font-mono font-bold text-slate-100 text-xs flex items-center gap-1.5 flex-wrap">
                      <span className="truncate">{s.name}</span>
                      {s.language && (
                        <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 font-normal shrink-0">
                          {s.language}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-slate-300 mt-1 truncate">
                      {s.displayName}
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 whitespace-nowrap ${
                      isHostEngine
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                        : isDeployed
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isHostEngine ? t.apps.services.statusHostEngine : isDeployed ? t.apps.services.statusDeployed : t.apps.services.statusRunning}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {s.description}
                </div>

                {/* Real GitHub Telemetry pill if available */}
                {s.repoUrl && (
                  <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-slate-400 flex-wrap">
                    {(() => {
                      const repoSlug = s.repoUrl ? s.repoUrl.split('/').pop()?.toLowerCase() : '';
                      const stat = repoSlug ? githubStats[repoSlug] : null;
                      return (
                        <div className="flex items-center gap-2 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5 flex-wrap">
                          <span className="text-amber-400 font-bold shrink-0">★ {stat ? stat.stars : 0}</span>
                          <span className="text-slate-500 shrink-0">|</span>
                          <span className="shrink-0">{t.apps.services.forkLabel}: {stat ? stat.forks : 0}</span>
                          {stat?.updated && (
                            <>
                              <span className="text-slate-500 shrink-0">|</span>
                              <span className="shrink-0">{t.apps.services.pushedLabel}: {stat.updated}</span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Telemetry bar for Doru AI */}
                {isHostEngine && (
                  <div className="mt-2.5 p-2 bg-black/50 border border-emerald-500/30 rounded font-mono text-[10px] text-slate-300 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                      <span>VOICE TELEMETRY (Silero VAD)</span>
                      <span>ACTIVE</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Wakeword RepCNN: &quot;doru&quot;</span>
                      <span className="text-sky-400">Prob: 0.94</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>LangGraph 8-Node State:</span>
                      <span className="text-emerald-300">LISTENING</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>LPU Engine:</span>
                      <span className="text-slate-200">Groq gpt-oss-20b</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 font-mono text-[11px]">
                {s.deployUrl && (
                  <a
                    href={s.deployUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-sky-500 hover:bg-sky-400 text-black font-bold py-1 rounded transition-colors"
                  >
                    {t.apps.services.openLiveSite}
                  </a>
                )}

                {s.name === 'doru-ai.service' && onOpenApp && (
                  <button
                    onClick={() => onOpenApp('app-gitkraken')}
                    className="flex-1 bg-[#1cd0a5]/20 hover:bg-[#1cd0a5]/30 text-[#1cd0a5] font-bold py-1 rounded border border-[#1cd0a5]/40 transition-colors"
                  >
                    {t.apps.services.openGitKraken}
                  </button>
                )}

                {s.name === 'odoo-erp.service' && onOpenApp && (
                  <button
                    onClick={() => onOpenApp('app-odoo')}
                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold py-1 rounded border border-purple-500/40 transition-colors"
                  >
                    {t.apps.services.openOdoo}
                  </button>
                )}

                {s.hasSandbox && (
                  <button
                    onClick={() => setActiveSandbox(s.name)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-slate-200 py-1 rounded transition-colors"
                  >
                    {t.apps.services.launchSandbox}
                  </button>
                )}

                {s.repoUrl && (
                  <a
                    href={s.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 rounded border border-white/10 transition-colors"
                    title="View GitHub Repository"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Sandbox Modal */}
      {activeSandbox && (
        <div className="fixed inset-4 md:inset-10 bg-obsidian-950 border border-white/20 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden select-text">
          {/* Sandbox Header */}
          <div className="h-11 px-4 bg-black/60 border-b border-white/10 flex items-center justify-between select-none">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-sky-400 font-bold">#</span>
              <span className="font-semibold text-slate-100">{t.apps.services.sandboxHeader}: {activeSandbox}</span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded font-bold">
                {t.apps.services.liveSim}
              </span>
            </div>
            <button
              onClick={() => setActiveSandbox(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs font-mono"
            >
              {t.apps.services.closeSandbox}
            </button>
          </div>

          {/* Sandbox Body Content */}
          <div className="flex-1 p-5 overflow-y-auto font-sans text-xs bg-black/40 flex flex-col gap-4">
            {/* 1. DanhGiaCamXuc Sandbox */}
            {activeSandbox === 'danh-gia-cam-xuc.service' && (
              <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="font-bold text-sm text-slate-100">Vietnamese Sentiment Analysis Tester</h3>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Nhập văn bản tiếng Việt để mô hình underthesea NLP và PyTorch phân tích cảm xúc (Positive / Negative).
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-slate-300">Văn bản đánh giá:</label>
                  <textarea
                    value={sentimentText}
                    onChange={(e) => setSentimentText(e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded p-2.5 font-sans text-slate-100 outline-none focus:border-sky-400"
                  />
                  <button
                    onClick={handleRunSentiment}
                    className="self-start bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono px-4 py-1.5 rounded transition-colors"
                  >
                    Chạy Phân Tích Cảm Xúc
                  </button>
                </div>

                {sentimentResult && (
                  <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-lg flex flex-col gap-2 font-mono">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Kết quả dự đoán:</span>
                      <span className="font-bold text-emerald-400 text-sm">{sentimentResult.label}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Độ tin cậy (Confidence):</span>
                      <span className="text-white">{sentimentResult.score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded overflow-hidden flex">
                      <div className="h-full bg-emerald-400" style={{ width: `${sentimentResult.pos}%` }} />
                      <div className="h-full bg-rose-500" style={{ width: `${sentimentResult.neg}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Toi_Uu_Gia Sandbox */}
            {activeSandbox === 'toi-uu-gia.service' && (
              <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="font-bold text-sm text-slate-100">Demand Price Elasticity Optimizer Simulator</h3>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Mô phỏng hàm hồi quy hệ số co giãn nhu cầu theo giá (Elasticity = -1.6) để tìm điểm giá tối đa hóa lợi nhuận.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-slate-400">Giá bán hiện tại ($):</label>
                    <input
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-slate-100 font-mono mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-slate-400">Giá vốn đơn vị ($):</label>
                    <input
                      type="number"
                      value={costInput}
                      onChange={(e) => setCostInput(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded p-2 text-slate-100 font-mono mt-1"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-white/[0.04] border border-white/10 rounded-lg flex flex-col gap-2 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Giá bán tối ưu (Optimal Price):</span>
                    <span className="font-bold text-sky-400 text-sm">${optimalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Sản lượng tiêu thụ ước tính:</span>
                    <span className="text-white">{estimatedDemand} đơn vị</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-slate-400">Lợi nhuận dự kiến:</span>
                    <span className="font-bold text-emerald-400 text-sm">${estimatedProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. document_to_quiz Sandbox */}
            {activeSandbox === 'document-to-quiz.service' && (
              <div className="max-w-xl mx-auto w-full flex flex-col gap-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="font-bold text-sm text-slate-100">AI Quiz Generator Simulator</h3>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Tạo bộ câu hỏi ôn tập thông minh bằng mô hình phân tích ngữ cảnh Google Gemini.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-slate-300">Chủ đề tài liệu:</label>
                  <input
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-slate-100 font-sans"
                  />
                  <button
                    onClick={handleGenerateQuiz}
                    className="self-start bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono px-4 py-1.5 rounded transition-colors"
                  >
                    Tạo Bộ Câu Hỏi
                  </button>
                </div>

                {generatedQuiz && (
                  <div className="flex flex-col gap-3 font-sans">
                    {generatedQuiz.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white/[0.03] border border-white/10 rounded-lg flex flex-col gap-2">
                        <div className="font-semibold text-slate-100">
                          Câu {idx + 1}: {item.q}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                          {item.a.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded border ${
                                oIdx === item.correct
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                  : 'bg-white/5 text-slate-400 border-white/5'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. DogDexx Live View */}
            {activeSandbox === 'dogdexx.service' && (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">DogDexx Production Deployment</h3>
                    <p className="text-slate-400 text-[11px]">Next.js 14 AI Dog Breed Classification Platform on Vercel</p>
                  </div>
                  <a
                    href="https://dogdexx.vercel.app"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-sky-500 hover:bg-sky-400 text-black font-bold font-mono px-3 py-1 rounded"
                  >
                    Open in New Window
                  </a>
                </div>
                <div className="flex-1 min-h-[360px] bg-black border border-white/10 rounded-lg overflow-hidden">
                  <iframe
                    src="https://dogdexx.vercel.app"
                    className="w-full h-full border-none"
                    title="DogDexx Live Preview"
                  />
                </div>
              </div>
            )}

            {/* Fallback for other sandboxes */}
            {!['danh-gia-cam-xuc.service', 'toi-uu-gia.service', 'document-to-quiz.service', 'dogdexx.service'].includes(activeSandbox) && (
              <div className="max-w-xl mx-auto w-full flex flex-col gap-3 font-mono">
                <div className="text-slate-300 font-bold text-sm">Service Sandbox: {activeSandbox}</div>
                <div className="bg-black/60 p-4 rounded border border-white/10 text-slate-400 leading-relaxed text-xs">
                  <div># Simulated microservice container initialized.</div>
                  <div># Listening on internal virtual socket: /run/{activeSandbox}.sock</div>
                  <div># Status: OK (Memory: 64MB, Healthcheck: passed)</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
