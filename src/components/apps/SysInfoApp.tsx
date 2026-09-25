/*
Reason for existence: System specification and hardware architecture viewer displaying chassis, CPU, memory, kernel, and OS telemetry.
System impact if absent: Server specifications and hardware profile cannot be viewed in the UI.
*/

'use client';

import React, { useEffect, useState } from 'react';
import { monitor } from '@/lib/monitor';
import { SystemSnapshot } from '@/types';

export function SysInfoApp() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);

  useEffect(() => {
    const unsub = monitor.subscribe((snap) => {
      setSnapshot(snap);
    });
    return unsub;
  }, []);

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'Active';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  };

  const hardwareDetails = [
    { key: 'Hostname', val: snapshot?.hostname || 'srv-silvestrike' },
    { key: 'Hardware Model', val: snapshot?.hostModel || 'VAN TRONG DUONG' },
    { key: 'Processor', val: snapshot?.cpuModel ? `${snapshot.cpuModel} (${snapshot.physicalCores || 8} Cores, ${snapshot.threadCount || snapshot.cores.length} Threads)` : 'Intel Core i5-13420H (8 Cores, 12 Threads)' },
    { key: 'CPU Topology', val: `${snapshot?.physicalCores || 8} Physical Cores / ${snapshot?.threadCount || snapshot?.cores.length || 12} Threads` },
    { key: 'Graphics (GPU)', val: snapshot?.gpuModel || 'WebOS Accelerated GPU Engine' },
    { key: 'RAM Installed', val: snapshot ? `${snapshot.ramTotal.toLocaleString()} MB` : '16,384 MB' },
    { key: 'Swap Allocated', val: snapshot ? `${snapshot.swapTotal.toLocaleString()} MB` : '4,096 MB' },
    { key: 'Load Average (1, 5, 15m)', val: snapshot?.loadAvg ? snapshot.loadAvg.join(' / ') : '0.12 / 0.18 / 0.22' }
  ];

  const osDetails = [
    { key: 'Operating System', val: snapshot?.osName || 'Ubuntu 26.04.1 LTS x86_64' },
    { key: 'Platform', val: snapshot?.platform ? `${snapshot.platform.toUpperCase()} (POSIX)` : 'LINUX (POSIX)' },
    { key: 'Kernel Version', val: snapshot?.kernel ? `Linux ${snapshot.kernel}` : 'Linux 7.0.0-31-generic' },
    { key: 'Architecture', val: snapshot?.arch ? `${snapshot.arch} (Native)` : 'x86_64' },
    { key: 'System Uptime', val: formatUptime(snapshot?.uptime) },
    { key: 'Network Inbound Rate', val: snapshot ? `${snapshot.rxRate} KB/s` : '0 KB/s' },
    { key: 'Network Outbound Rate', val: snapshot ? `${snapshot.txRate} KB/s` : '0 KB/s' }
  ];

  return (
    <div className="h-full w-full p-4 flex flex-col gap-4 font-sans text-xs overflow-y-auto">
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3.5">
        <h3 className="text-sky-400 font-mono font-bold text-xs uppercase tracking-wider mb-2.5">
          Host & Hardware Architecture (Live Telemetry)
        </h3>
        <div className="divide-y divide-white/[0.04]">
          {hardwareDetails.map((row, i) => (
            <div key={i} className="py-2 flex justify-between items-center font-mono">
              <span className="text-slate-400">{row.key}</span>
              <span className="text-slate-100 font-medium text-right max-w-[65%] truncate">{row.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3.5">
        <h3 className="text-sky-400 font-mono font-bold text-xs uppercase tracking-wider mb-2.5">
          Operating System & Runtime Platform
        </h3>
        <div className="divide-y divide-white/[0.04]">
          {osDetails.map((row, i) => (
            <div key={i} className="py-2 flex justify-between items-center font-mono">
              <span className="text-slate-400">{row.key}</span>
              <span className="text-slate-100 font-medium text-right">{row.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
