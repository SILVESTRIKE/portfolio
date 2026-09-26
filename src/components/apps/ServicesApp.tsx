/*
Reason for existence: Docker Container & Microservices Workstation Dashboard presenting SILVESTRIKE repositories as authentic Docker container cards with architecture flows, live ports, and healthcheck telemetry.
System impact if absent: Users and recruiters cannot inspect container architecture, dependency flows, live endpoints, or verified production metrics.
*/

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { portfolioServices } from '@/lib/portfolio';
import { ServiceUnit } from '@/types';
import { useI18n } from '@/lib/i18n';

interface ServicesAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}

// Generate deterministic 8-char container ID from service name
function getDeterministicContainerId(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.substring(0, 8);
}

export function ServicesApp({ onNotify: _onNotify, onOpenApp }: ServicesAppProps) {
  const { t } = useI18n();
  const [servicesList] = useState<ServiceUnit[]>(portfolioServices);
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

  const filtered = useMemo(() => {
    return servicesList.filter(s => {
      if (filterCat !== 'all' && s.category !== filterCat) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = s.name.toLowerCase().includes(q);
        const inDisplay = s.displayName.toLowerCase().includes(q);
        const inDesc = s.description.toLowerCase().includes(q);
        const inImage = s.image?.toLowerCase().includes(q) ?? false;
        const inDepends = s.dependsOn?.some(d => d.toLowerCase().includes(q)) ?? false;
        if (!inName && !inDisplay && !inDesc && !inImage && !inDepends) return false;
      }
      return true;
    });
  }, [servicesList, filterCat, searchQuery]);

  const catLabels: Record<string, string> = {
    all: t.apps.services.categoryAll,
    ai: t.apps.services.filterAi,
    web: t.apps.services.filterWeb,
    system: t.apps.services.filterSystem,
    business: t.apps.services.filterBusiness
  };

  const totalContainers = servicesList.length;
  const runningContainers = servicesList.filter(s => s.status === 'running' || s.status === 'deployed').length;
  const deployedContainers = servicesList.filter(s => s.status === 'deployed').length;

  return (
    <div className="h-full w-full p-3 sm:p-4 flex flex-col gap-3 font-sans text-xs overflow-y-auto select-none bg-[#0a0d14]">
      {/* Docker Engine Telemetry & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5 bg-black/40 p-2.5 rounded-lg border border-white/10 shrink-0">
        {/* Docker Daemon Status Line */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300 flex-wrap">
          <span className="text-[#1cd0a5] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1cd0a5] animate-pulse" />
            DOCKER ENGINE
          </span>
          <span className="text-slate-600">|</span>
          <span>{totalContainers} {t.apps.services.containerSummary}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">{runningContainers} online</span>
          <span className="text-slate-600">|</span>
          <span className="text-sky-400 font-semibold">{deployedContainers} live deployed</span>
        </div>

        {/* Filter Categories and Grep search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded border border-white/10">
            {['all', 'ai', 'web', 'system', 'business'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition-colors ${filterCat === cat
                    ? 'bg-[#7aa2f7]/20 text-[#7aa2f7] font-bold border border-[#7aa2f7]/40'
                    : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {catLabels[cat] || cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded px-2 py-0.5 text-[11px] text-slate-100 font-mono focus-within:border-[#7aa2f7]">
            <span className="text-slate-500 font-bold">$ grep -i &quot;</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.apps.services.searchPlaceholder}
              className="bg-transparent border-none text-slate-100 outline-none w-32 sm:w-44 font-mono text-[11px]"
            />
            <span className="text-slate-500 font-bold">&quot;</span>
          </div>
        </div>
      </div>

      {/* Container Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 pb-2">
        {filtered.map((s) => {
          const containerId = getDeterministicContainerId(s.name);
          const isDeployed = s.status === 'deployed';
          const isHostEngine = s.name === 'doru-ai.service';
          const imageName = s.image || `${s.name.replace('.service', '')}:latest`;

          return (
            <div
              key={s.name}
              className={`bg-white/[0.02] border rounded-lg p-3.5 flex flex-col justify-between gap-3 transition-all hover:border-white/20 min-w-0 ${isHostEngine
                  ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_20px_rgba(16,185,129,0.06)]'
                  : isDeployed
                    ? 'border-sky-500/40 bg-sky-950/10 shadow-[0_0_20px_rgba(56,189,248,0.06)]'
                    : 'border-white/10'
                }`}
            >
              <div className="space-y-2.5 min-w-0">
                {/* Container Top Meta Header */}
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                      ID: <span className="text-slate-200 font-bold">{containerId}</span>
                    </span>
                    <span className="font-mono text-[10.5px] text-[#7aa2f7] font-semibold truncate max-w-[200px] sm:max-w-xs">
                      {imageName}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase shrink-0 whitespace-nowrap flex items-center gap-1 ${isHostEngine
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                        : isDeployed
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {isHostEngine ? t.apps.services.statusHostEngine : isDeployed ? t.apps.services.statusDeployed : t.apps.services.statusRunning}
                  </span>
                </div>

                {/* Display Name & Overview */}
                <div className="min-w-0">
                  <h3 className="font-mono font-bold text-slate-100 text-xs sm:text-[13px] tracking-tight truncate">
                    {s.displayName}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Ports / Live Demo Mapping Row */}
                {s.ports && (
                  <div className="flex items-center gap-1.5 font-mono text-[10.5px] bg-black/40 px-2.5 py-1 rounded border border-white/5 min-w-0">
                    <span className="text-slate-500 font-bold shrink-0">{t.apps.services.portsLabel}:</span>
                    {s.deployUrl ? (
                      <a
                        href={s.deployUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-300 hover:text-sky-200 underline underline-offset-2 truncate flex items-center gap-1"
                        title="Click to visit live deployment"
                      >
                        <span>{s.ports}</span>
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-slate-300 truncate">{s.ports}</span>
                    )}
                  </div>
                )}

                {/* DEPENDS_ON Architecture Flow Pipeline */}
                {s.dependsOn && s.dependsOn.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9.5px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                      {t.apps.services.dependsOnLabel}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap font-mono text-[10px]">
                      {s.dependsOn.map((dep, dIdx) => (
                        <React.Fragment key={dIdx}>
                          <span className="px-2 py-0.5 rounded bg-black/50 border border-white/10 text-slate-200 font-medium">
                            {dep}
                          </span>
                          {dIdx < (s.dependsOn?.length ?? 0) - 1 && (
                            <span className="text-[#7aa2f7] font-bold text-[11px] select-none">
                              &rarr;
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* ENVIRONMENT Variables */}
                {s.environment && s.environment.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9.5px] font-mono text-slate-400 font-bold tracking-wider uppercase">
                      {t.apps.services.envLabel}
                    </div>
                    <div className="flex items-center gap-1 flex-wrap font-mono text-[9.5px]">
                      {s.environment.map((env, eIdx) => (
                        <span
                          key={eIdx}
                          className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-300"
                        >
                          {env}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* HEALTHCHECK / Production Telemetry Box */}
                {s.healthcheck && (
                  <div className="p-2 rounded bg-black/50 border-l-2 border-emerald-400 border-r border-t border-b border-white/5 font-mono text-[10.5px] text-emerald-300/90 leading-relaxed">
                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-0.5">
                      {t.apps.services.healthLabel}
                    </div>
                    {s.healthcheck}
                  </div>
                )}

                {/* GitHub Telemetry Stats */}
                {s.repoUrl && (
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 flex-wrap pt-0.5">
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
              </div>

              {/* Action Buttons Footer */}
              <div className="flex flex-wrap gap-2 pt-2.5 border-t border-white/5 font-mono text-[11px]">
                {s.deployUrl && (
                  <a
                    href={s.deployUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-sky-500 hover:bg-sky-400 text-black font-bold py-1.5 rounded transition-colors shadow-sm"
                  >
                    {t.apps.services.openLiveSite}
                  </a>
                )}

                {onOpenApp && (
                  <button
                    onClick={() => onOpenApp('app-git')}
                    className="flex-1 bg-[#1cd0a5]/20 hover:bg-[#1cd0a5]/30 text-[#1cd0a5] font-bold py-1.5 rounded border border-[#1cd0a5]/40 transition-colors"
                  >
                    {t.apps.services.openGitKraken}
                  </button>
                )}

                {s.repoUrl && (
                  <a
                    href={s.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded border border-white/10 transition-colors"
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
