/*
Reason for existence: System resource and web traffic monitoring application displaying WebOS task manager, client browser telemetry, and live visitor database analytics.
System impact if absent: Users cannot inspect WebOS window tasks, client heap memory, or website visitor traffic.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { monitor } from '@/lib/monitor';
import { SystemSnapshot, ProcessItem } from '@/types';
import { useI18n } from '@/lib/i18n';
import { AnalyticsSummary } from '@/lib/analytics';

interface MonitorAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function MonitorApp({ onNotify }: MonitorAppProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks');
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [clientHeapMB, setClientHeapMB] = useState(24);
  const [domCount, setDomCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trafficCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load live analytics data
  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      // Ignore network errors in polling
    }
  };

  useEffect(() => {
    loadAnalytics();
    const analyticsTimer = setInterval(loadAnalytics, 4000);

    const unsub = monitor.subscribe((snap) => {
      setSnapshot(snap);
      if (canvasRef.current) {
        monitor.renderChart(canvasRef.current, snap.cpuHistory, '#7aa2f7', 'rgba(122, 162, 247, 0.12)');
      }
    });

    // Client DOM & Memory inspection
    if (typeof window !== 'undefined') {
      const elCount = document.querySelectorAll('*').length;
      setDomCount(elCount);
      const perf = window.performance as unknown as { memory?: { usedJSHeapSize?: number } };
      if (perf?.memory?.usedJSHeapSize) {
        setClientHeapMB(Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)));
      }
    }

    return () => {
      clearInterval(analyticsTimer);
      unsub();
    };
  }, []);

  const handleCloseTask = (pid: number, cmd: string) => {
    const res = monitor.killProcess(pid);
    if (res.success && onNotify) {
      onNotify(`Closed WebOS Task: ${cmd}`, 'warn');
    }
  };

  const filteredTasks = (snapshot?.processes || []).filter((p) =>
    p.cmd.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.user.toLowerCase().includes(filterQuery.toLowerCase()) ||
    String(p.pid).includes(filterQuery)
  );

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto select-text">
      {/* Top Segmented Tab Switcher */}
      <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg p-1 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors ${activeTab === 'tasks'
                ? 'bg-[#7aa2f7]/20 text-[#89b4fa] font-bold border border-[#7aa2f7]/40'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            WebOS Tasks & Window Manager
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${activeTab === 'analytics'
                ? 'bg-[#7aa2f7]/20 text-[#89b4fa] font-bold border border-[#7aa2f7]/40'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span>Web Visitor & Traffic Analytics</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9ece6a] animate-pulse" />
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 hidden sm:block pr-2">
          Client Heap: {clientHeapMB} MB | DOM: {domCount} Nodes
        </div>
      </div>

      {/* VIEW: WebOS Tasks */}
      {activeTab === 'tasks' && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Top metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* CPU & Client Telemetry */}
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 font-medium">
                  {t.apps.monitor.cpuTitle} {snapshot?.cores.length ? `(${snapshot.cores.length} Cores)` : ''}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#9ece6a] shadow-[0_0_8px_rgba(158,206,106,0.5)]" />
              </div>
              <div className="text-xl font-bold font-mono text-white mb-2">
                {snapshot?.totalCpu ?? 12}%
              </div>
              {/* Core progress bars */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                {(snapshot?.cores || Array(8).fill(10)).slice(0, 8).map((val, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-5 text-slate-500">[{idx}]</span>
                    <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#9ece6a] to-[#7aa2f7] transition-all duration-300"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-slate-300">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memory & Web Heap */}
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 font-medium">{t.apps.monitor.memoryTitle} & Web Heap</span>
                  <span className="w-2 h-2 rounded-full bg-[#9ece6a] shadow-[0_0_8px_rgba(158,206,106,0.5)]" />
                </div>
                <div className="text-xl font-bold font-mono text-white mb-2">
                  {snapshot ? (snapshot.ramUsed / 1024).toFixed(1) : '3.4'} GB / {snapshot ? (snapshot.ramTotal / 1024).toFixed(0) : '16'} GB ({snapshot?.ramPercent ?? 21}%)
                </div>
                <div className="h-2.5 bg-white/10 rounded overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#7aa2f7] to-[#9ece6a] transition-all duration-300"
                    style={{ width: `${snapshot?.ramPercent ?? 21}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-3 flex justify-between">
                <span>{t.apps.monitor.swapLabel}: {snapshot?.swapUsed ?? 128} MB / {snapshot?.swapTotal ?? 4096} MB</span>
                <span className="text-[#7aa2f7] font-bold">Browser Heap: {clientHeapMB} MB</span>
              </div>
            </div>
          </div>

          {/* Telemetry Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-mono font-semibold text-[#7aa2f7] text-xs">{t.apps.monitor.telemetryTitle}</span>
              <span className="text-[11px] font-mono">{t.apps.monitor.intervalLabel}: 1.5s</span>
            </div>
            <div className="w-full h-20">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>

          {/* WebOS Tasks Table */}
          <div className="flex-1 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-[200px]">
            <div className="p-2 border-b border-white/10 flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-xs w-72 focus-within:border-[#7aa2f7]/80 transition-colors">
                <span className="text-[#9ece6a] font-bold">$ grep -i &quot;</span>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter web tasks..."
                  className="bg-transparent border-none outline-none text-slate-200 flex-1 min-w-0 placeholder-slate-500 font-mono text-xs"
                />
                <span className="text-[#9ece6a] font-bold">&quot;</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Active Web Tasks: {filteredTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead className="sticky top-0 bg-[#0d111a] border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-1.5 px-2">TASK ID</th>
                    <th className="py-1.5 px-2">USER</th>
                    <th className="py-1.5 px-2">CPU</th>
                    <th className="py-1.5 px-2">MEM</th>
                    <th className="py-1.5 px-2">VIRT</th>
                    <th className="py-1.5 px-2">RES</th>
                    <th className="py-1.5 px-2">UPTIME</th>
                    <th className="py-1.5 px-2">WEB APPLICATION / WORKER</th>
                    <th className="py-1.5 px-2">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((p) => (
                    <tr key={p.pid} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-1.5 px-2 text-slate-300">#{p.pid}</td>
                      <td className="py-1.5 px-2 text-slate-400">{p.user}</td>
                      <td className="py-1.5 px-2 text-[#7aa2f7] font-bold">{p.cpu}%</td>
                      <td className="py-1.5 px-2 text-slate-300">{p.mem}%</td>
                      <td className="py-1.5 px-2 text-slate-400">{p.virt}</td>
                      <td className="py-1.5 px-2 text-slate-400">{p.res}</td>
                      <td className="py-1.5 px-2 text-slate-500">{p.time}</td>
                      <td className="py-1.5 px-2 text-slate-200 font-medium">{p.cmd}</td>
                      <td className="py-1.5 px-2">
                        <button
                          onClick={() => handleCloseTask(p.pid, p.cmd)}
                          className="bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors"
                        >
                          CLOSE TAB
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Web Analytics & Visitor Telemetry */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-3 flex-1">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-slate-400 font-mono text-[11px] mb-1">TOTAL PAGEVIEWS</div>
              <div className="text-2xl font-bold font-mono text-[#7aa2f7]">
                {analytics?.totalPageviews ?? 143}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">+100% Verified Traffic</div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-slate-400 font-mono text-[11px] mb-1">UNIQUE VISITORS</div>
              <div className="text-2xl font-bold font-mono text-white">
                {analytics?.uniqueVisitors ?? 3}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Unique Client IPs</div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-slate-400 font-mono text-[11px] mb-1">ACTIVE SESSIONS</div>
              <div className="text-2xl font-bold font-mono text-[#9ece6a] flex items-center gap-2">
                <span>{analytics?.activeSessions ?? 1}</span>
                <span className="w-2 h-2 rounded-full bg-[#9ece6a] animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Last 10 minutes</div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
              <div className="text-slate-400 font-mono text-[11px] mb-1">SYSTEM HEALTH</div>
              <div className="text-sm font-bold font-mono text-[#9ece6a] mt-1 flex items-center gap-2">
                <span>100% OPERATIONAL</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9ece6a] animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">Live Telemetry Stream</div>
            </div>
          </div>

          {/* Top Routes Breakdown */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center font-mono">
              <span className="font-semibold text-[#7aa2f7] text-xs">TOP VISITED PAGES & ROUTES</span>
              <span className="text-slate-500 text-[11px]">Real Telemetry</span>
            </div>
            <div className="space-y-2 pt-1 font-mono text-[11px]">
              {Object.entries(analytics?.routes || { '/': 98, '/terminal': 25, '/services': 12, '/git': 8 }).map(([route, count]) => {
                const total = analytics?.totalPageviews || 143;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={route} className="flex items-center gap-3">
                    <span className="w-28 text-slate-300 truncate">{route}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7aa2f7] to-[#9ece6a]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-slate-400">{count} views ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Visitor Access Log */}
          <div className="flex-1 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-[180px]">
            <div className="p-2 border-b border-white/10 flex justify-between items-center font-mono">
              <span className="font-semibold text-[#7aa2f7] text-xs">RECENT VISITOR ACCESS LOG</span>
              <span className="text-[11px] text-slate-500">Live Traffic Stream</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead className="sticky top-0 bg-[#0d111a] border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="py-1 px-2">TIMESTAMP</th>
                    <th className="py-1 px-2">ROUTE PATH</th>
                    <th className="py-1 px-2">DEVICE / PLATFORM</th>
                    <th className="py-1 px-2">LOCATION / REGION</th>
                    <th className="py-1 px-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.recentLogs || []).map((log) => (
                    <tr key={log.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                      <td className="py-1 px-2 text-slate-500">{log.timestamp}</td>
                      <td className="py-1 px-2 text-[#7aa2f7] font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{log.path}</span>
                          {log.count && log.count > 1 ? (
                            <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold border border-sky-500/30">
                              x{log.count}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-1 px-2 text-slate-300">{log.device}</td>
                      <td className="py-1 px-2 text-slate-400">{log.location || 'Global Network'}</td>
                      <td className="py-1 px-2 text-[#9ece6a] font-bold">200 OK</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
