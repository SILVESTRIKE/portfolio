/*
Reason for existence: Toast notification container rendering temporary system status banners and daemon alerts.
System impact if absent: System event notifications and user action confirmations will not be visible.
*/

'use client';

import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'warn' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  return (
    <aside
      className="fixed top-14 right-4 z-50 flex flex-col gap-2 pointer-events-none font-mono text-xs select-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const dotColor =
          t.type === 'error'
            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
            : t.type === 'warn'
            ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
            : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';

        return (
          <div
            key={t.id}
            className="pointer-events-auto bg-obsidian-850 border border-white/10 shadow-2xl rounded px-3 py-2 text-slate-100 flex items-center gap-2.5 animate-in slide-in-from-right duration-200"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
            <span>{t.text}</span>
          </div>
        );
      })}
    </aside>
  );
}
