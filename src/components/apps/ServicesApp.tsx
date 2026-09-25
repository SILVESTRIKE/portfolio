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
  const [servicesList, setServicesList] = useState<ServiceUnit[]>(portfolioServices);
  const [githubStats, setGithubStats] = useState<Record<string, { stars: number; forks: number; updated: string }>>({});
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadLiveData() {
      try {
        const repoRes = await fetch('https://api.github.com/users/SILVESTRIKE/repos');
        if (repoRes.ok) {
          const repos = await repoRes.json();
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
    loadLiveData();
  }, []);

  const filtered = servicesList.filter(s => {
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.displayName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

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
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition-colors ${filterCat === cat
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
              className={`bg-white/[0.03] border rounded-lg p-3 flex flex-col justify-between gap-3 transition-all hover:border-white/20 min-w-0 ${isHostEngine
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
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shrink-0 whitespace-nowrap ${isHostEngine
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
                    onClick={() => onOpenApp('app-git')}
                    className="flex-1 bg-[#1cd0a5]/20 hover:bg-[#1cd0a5]/30 text-[#1cd0a5] font-bold py-1 rounded border border-[#1cd0a5]/40 transition-colors"
                  >
                    {t.apps.services.openGitKraken}
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
    </div>
  );
}
