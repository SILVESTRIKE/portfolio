/*
Reason for existence: System log stream viewer application mimicking journalctl -f and /var/log/syslog with severity filtering and search.
System impact if absent: System telemetry and journal logs cannot be viewed or inspected.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { logManager } from '@/lib/logs';
import { LogItem } from '@/types';
import { useI18n } from '@/lib/i18n';

interface LogsAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function LogsApp({ onNotify }: LogsAppProps) {
  const { t } = useI18n();
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(logManager.getLogs());
    const unsub = logManager.subscribe(() => {
      setLogs(logManager.getLogs());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (streamRef.current && !isPaused) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const handleTogglePause = () => {
    const paused = logManager.togglePause();
    setIsPaused(paused);
    if (onNotify) {
      onNotify(paused ? t.apps.logs.pauseToast : t.apps.logs.resumeToast, 'info');
    }
  };

  const handleClear = () => {
    logManager.clear();
    setLogs([]);
  };

  const filteredLogs = logs.filter(l => {
    if (level !== 'ALL' && l.level !== level) return false;
    if (search && !l.message.toLowerCase().includes(search.toLowerCase()) && !l.service.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full w-full flex flex-col font-mono text-xs bg-[#080a0f] select-text">
      {/* Toolbar */}
      <div className="h-10 bg-black/50 border-b border-white/10 px-3 flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded px-2.5 py-1 font-mono text-xs w-64 focus-within:border-sky-400/80 transition-colors">
            <span className="text-emerald-400 font-bold">$ grep -i &quot;</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.apps.logs.filterPlaceholder}
              className="bg-transparent border-none outline-none text-slate-200 flex-1 min-w-0 placeholder-slate-500 font-mono text-xs"
            />
            <span className="text-emerald-400 font-bold">&quot;</span>
          </div>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-sky-400 cursor-pointer"
          >
            <option value="ALL">{t.apps.logs.levelAll}</option>
            <option value="INFO">{t.apps.logs.levelInfo}</option>
            <option value="WARN">{t.apps.logs.levelWarn}</option>
            <option value="ERROR">{t.apps.logs.levelError}</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePause}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              isPaused
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            {isPaused ? t.apps.logs.resumeBtn : t.apps.logs.pauseBtn}
          </button>
          <button
            onClick={handleClear}
            className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-3 py-1 rounded text-xs transition-colors"
          >
            {t.apps.logs.clearBtn}
          </button>
        </div>
      </div>

      {/* Log stream view */}
      <div ref={streamRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 text-center py-8 font-sans">
            {t.apps.logs.emptyMsg}
          </div>
        ) : (
          filteredLogs.map((l, idx) => {
            const lvlBadgeColor =
              l.level === 'ERROR'
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                : l.level === 'WARN'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                : 'text-[#7aa2f7] bg-[#7aa2f7]/10 border-[#7aa2f7]/30';

            return (
              <div key={`log-${l.id}-${idx}`} className="flex items-start gap-2.5 py-0.5 border-b border-white/[0.02]">
                <span className="text-slate-500 shrink-0 w-36">{l.timestamp}</span>
                <span className="text-[#7aa2f7] font-medium shrink-0 w-32 truncate">{l.service}</span>
                <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold shrink-0 ${lvlBadgeColor}`}>
                  {l.level}
                </span>
                <span className="text-slate-200 break-all flex-1">{l.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
