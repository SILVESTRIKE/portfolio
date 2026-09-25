/*
Reason for existence: System resource monitoring application displaying multi-core CPU metrics, RAM/Swap bars, real-time Canvas telemetry graphs, and interactive process table.
System impact if absent: System Activity Monitor (htop) cannot render or manage system processes.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { monitor } from '@/lib/monitor';
import { SystemSnapshot } from '@/types';
import { useI18n } from '@/lib/i18n';

interface MonitorAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function MonitorApp({ onNotify }: MonitorAppProps) {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsub = monitor.subscribe((snap) => {
      setSnapshot(snap);
      if (canvasRef.current) {
        monitor.renderChart(canvasRef.current, snap.cpuHistory, '#38bdf8', 'rgba(56, 189, 248, 0.12)');
      }
    });

    return () => unsub();
  }, []);

  const handleKill = (pid: number, cmd: string) => {
    const res = monitor.killProcess(pid);
    if (res.success && onNotify) {
      onNotify(`Terminated PID ${pid} (${cmd})`, 'warn');
    }
  };

  const filteredProcesses = (snapshot?.processes || []).filter(p =>
    p.cmd.toLowerCase().includes(filterQuery.toLowerCase()) ||
    p.user.toLowerCase().includes(filterQuery.toLowerCase()) ||
    String(p.pid).includes(filterQuery)
  );

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto">
      {/* Top metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* CPU overview */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 font-medium">{t.apps.monitor.cpuTitle} (8 Cores)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="text-xl font-bold font-mono text-white mb-2">
            {snapshot?.totalCpu ?? 12}%
          </div>
          {/* Core progress bars */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            {(snapshot?.cores || Array(8).fill(10)).map((val, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-5 text-slate-500">[{idx}]</span>
                <div className="flex-1 h-2 bg-white/10 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className="w-7 text-right text-slate-300">{val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Memory overview */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-medium">{t.apps.monitor.memoryTitle}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="text-xl font-bold font-mono text-white mb-2">
              {snapshot ? (snapshot.ramUsed / 1024).toFixed(1) : '3.4'} GB / {snapshot ? (snapshot.ramTotal / 1024).toFixed(0) : '16'} GB ({snapshot?.ramPercent ?? 21}%)
            </div>
            <div className="h-2.5 bg-white/10 rounded overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${snapshot?.ramPercent ?? 21}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-3">
            {t.apps.monitor.swapLabel}: {snapshot?.swapUsed ?? 128} MB / {snapshot?.swapTotal ?? 4096} MB (3%)
          </div>
        </div>
      </div>

      {/* Telemetry Chart */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center text-slate-400">
          <span className="font-mono font-semibold text-sky-400 text-xs">{t.apps.monitor.telemetryTitle}</span>
          <span className="text-[11px]">{t.apps.monitor.intervalLabel}: 1.5s</span>
        </div>
        <div className="w-full h-24">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* Process Table */}
      <div className="flex-1 bg-black/40 border border-white/10 rounded-lg overflow-hidden flex flex-col min-h-[180px]">
        <div className="p-2 border-b border-white/10 flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-xs w-72 focus-within:border-sky-400/80 transition-colors">
            <span className="text-emerald-400 font-bold">$ grep -i &quot;</span>
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={t.apps.monitor.filterPlaceholder}
              className="bg-transparent border-none outline-none text-slate-200 flex-1 min-w-0 placeholder-slate-500 font-mono text-xs"
            />
            <span className="text-emerald-400 font-bold">&quot;</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            {t.apps.monitor.activeLabel}: {filteredProcesses.length}
          </span>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 bg-obsidian-900 border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-1.5 px-2">{t.apps.monitor.colPid}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colUser}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colCpu}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colMem}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colVirt}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colRes}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colTime}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colCommand}</th>
                <th className="py-1.5 px-2">{t.apps.monitor.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((p) => (
                <tr key={p.pid} className="border-b border-white/[0.03] hover:bg-sky-400/5 transition-colors">
                  <td className="py-1.5 px-2 text-slate-300">{p.pid}</td>
                  <td className="py-1.5 px-2 text-slate-400">{p.user}</td>
                  <td className={`py-1.5 px-2 font-bold ${
                    p.cpu > 5 ? 'text-rose-400' : (p.cpu > 2 ? 'text-amber-400' : 'text-sky-400')
                  }`}>{p.cpu}%</td>
                  <td className="py-1.5 px-2 text-slate-300">{p.mem}%</td>
                  <td className="py-1.5 px-2 text-slate-400">{p.virt}</td>
                  <td className="py-1.5 px-2 text-slate-400">{p.res}</td>
                  <td className="py-1.5 px-2 text-slate-500">{p.time}</td>
                  <td className="py-1.5 px-2 text-slate-200 font-medium">{p.cmd}</td>
                  <td className="py-1.5 px-2">
                    <button
                      onClick={() => handleKill(p.pid, p.cmd)}
                      className="bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded text-[10px] transition-colors"
                    >
                      {t.apps.monitor.killBtn}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
