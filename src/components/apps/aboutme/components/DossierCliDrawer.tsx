/*
Reason for existence: Integrated terminal CLI drawer for Dossier Studio executing fastfetch, whoami, ls, cat, and thesis commands.
System Impact of Absence: Dossier studio cannot offer an interactive bottom bash drawer for quick command navigation.
*/

'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';

interface DossierCliDrawerProps {
  isCliOpen: boolean;
  setIsCliOpen: (open: boolean) => void;
  cliLogs: string[];
  cliInput: string;
  setCliInput: (input: string) => void;
  onRunCommand: (cmd: string) => void;
  cliScrollRef: React.RefObject<HTMLDivElement | null>;
}

export function DossierCliDrawer({
  isCliOpen,
  setIsCliOpen,
  cliLogs,
  cliInput,
  setCliInput,
  onRunCommand,
  cliScrollRef
}: DossierCliDrawerProps) {
  const { t } = useI18n();

  if (!isCliOpen) return null;

  return (
    <div className="h-44 bg-[#060a12] border-t border-white/10 flex flex-col shrink-0">
      <div className="h-6 bg-[#090d16] px-3 flex items-center justify-between text-[10px] text-slate-400 border-b border-white/5 select-none">
        <span className="font-bold text-sky-400">
          {t.apps?.about?.terminalTitle || 'INTEGRATED TERMINAL'}
        </span>
        <button
          onClick={() => setIsCliOpen(false)}
          className="text-slate-500 hover:text-slate-300 text-[10px]"
        >
          [Close]
        </button>
      </div>

      <div
        ref={cliScrollRef}
        className="flex-1 overflow-y-auto p-2.5 font-mono text-[11px] space-y-1 text-slate-300"
      >
        {cliLogs.map((log, idx) => (
          <div key={idx} className={log.startsWith('$') ? 'text-[#89b4fa] font-bold' : ''}>
            {log}
          </div>
        ))}
      </div>

      <div className="p-1.5 bg-[#080c14] border-t border-white/5 flex items-center gap-2">
        <span className="text-emerald-400 font-bold text-[11px] pl-2 font-mono">
          silvestrike@ide:~$
        </span>
        <input
          type="text"
          value={cliInput}
          onChange={(e) => setCliInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRunCommand(cliInput);
          }}
          placeholder="Type 'help', 'fastfetch', 'ls', 'whoami', 'skills', 'thesis'..."
          className="flex-1 bg-transparent text-xs text-slate-100 outline-none font-mono placeholder-slate-600"
        />
        <button
          onClick={() => onRunCommand(cliInput)}
          className="px-2.5 py-0.5 bg-[#7aa2f7]/20 text-[#89b4fa] border border-[#7aa2f7]/30 rounded text-[10px] font-bold hover:bg-[#7aa2f7] hover:text-black transition-colors"
        >
          Run
        </button>
      </div>
    </div>
  );
}
