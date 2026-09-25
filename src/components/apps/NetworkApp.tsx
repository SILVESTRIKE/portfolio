/*
Reason for existence: Network and firewall inspector application providing socket listening status, UFW configuration, and ping diagnostics.
System impact if absent: Server network connections, open ports, and latency diagnostics cannot be monitored.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface NetworkAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

export function NetworkApp({ onNotify }: NetworkAppProps) {
  const [ufwActive, setUfwActive] = useState(true);
  const [pingTarget, setPingTarget] = useState('1.1.1.1');
  const [pingRunning, setPingRunning] = useState(false);
  const [pingLogs, setPingLogs] = useState<string[]>(['Ready to diagnose network connectivity.']);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  const handleToggleUfw = () => {
    const next = !ufwActive;
    setUfwActive(next);
    if (onNotify) {
      onNotify(`UFW Firewall ${next ? 'Enabled' : 'Disabled'}`, next ? 'info' : 'warn');
    }
  };

  const handleStartPing = async () => {
    if (pingRunning) return;
    setPingRunning(true);
    setPingLogs([`Executing ICMP ping to ${pingTarget} from host server...`]);

    try {
      const res = await fetch(`/api/ping?host=${encodeURIComponent(pingTarget)}`);
      const data = await res.json();
      if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
        setPingLogs(data.logs);
        if (data.avgMs !== null && onNotify) {
          onNotify(`Ping ${pingTarget}: avg ${data.avgMs}ms`, 'info');
        }
      } else {
        setPingLogs([data.error || `Ping to ${pingTarget} returned no response.`]);
      }
    } catch {
      setPingLogs([`Failed to reach /api/ping endpoint.`]);
    } finally {
      setPingRunning(false);
    }
  };

  const handleStopPing = () => {
    setPingRunning(false);
  };

  const ports = [
    { proto: 'tcp', local: '0.0.0.0:22', foreign: '0.0.0.0:*', service: 'sshd', pid: 924 },
    { proto: 'tcp', local: '0.0.0.0:80', foreign: '0.0.0.0:*', service: 'nginx', pid: 1420 },
    { proto: 'tcp', local: '0.0.0.0:443', foreign: '0.0.0.0:*', service: 'nginx', pid: 1420 },
    { proto: 'tcp', local: '127.0.0.1:5432', foreign: '0.0.0.0:*', service: 'postgresql', pid: 1530 },
    { proto: 'tcp', local: '127.0.0.1:3000', foreign: '0.0.0.0:*', service: 'next-webos', pid: 2145 },
    { proto: 'tcp', local: '0.0.0.0:2375', foreign: '0.0.0.0:*', service: 'dockerd', pid: 1102 }
  ];

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto">
      {/* Top network stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-mono text-[11px]">INTERFACE (eth0)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="font-mono text-sm font-bold text-white">192.168.1.100/24</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            MAC: 52:54:00:1a:2b:3c | MTU: 1500
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-mono text-[11px]">FIREWALL (UFW)</span>
            <span className={`w-2 h-2 rounded-full ${ufwActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="font-mono text-sm font-bold text-white">
            Status: {ufwActive ? 'Active' : 'Disabled'}
          </div>
          <button
            onClick={handleToggleUfw}
            className="mt-2 bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-0.5 rounded font-mono text-[10px] transition-colors"
          >
            {ufwActive ? 'Disable UFW' : 'Enable UFW'}
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">GATEWAY & NAMESERVERS</div>
          <div className="font-mono text-sm font-bold text-white">192.168.1.1</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            DNS: 1.1.1.1, 8.8.8.8
          </div>
        </div>
      </div>

      {/* Listening sockets table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center font-mono">
          <span className="font-semibold text-sky-400 text-xs">ACTIVE LISTENING SOCKETS (netstat -tuln)</span>
          <span className="text-slate-500 text-[11px]">{ports.length} Open Sockets</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-1 px-2">Proto</th>
                <th className="py-1 px-2">Local Address</th>
                <th className="py-1 px-2">Foreign Address</th>
                <th className="py-1 px-2">State</th>
                <th className="py-1 px-2">Service</th>
                <th className="py-1 px-2">PID</th>
              </tr>
            </thead>
            <tbody>
              {ports.map((p, idx) => (
                <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                  <td className="py-1 px-2 text-slate-400">{p.proto}</td>
                  <td className="py-1 px-2 text-slate-200 font-medium">{p.local}</td>
                  <td className="py-1 px-2 text-slate-500">{p.foreign}</td>
                  <td className="py-1 px-2 text-emerald-400 font-bold">LISTEN</td>
                  <td className="py-1 px-2 text-sky-300">{p.service}</td>
                  <td className="py-1 px-2 text-slate-500">{p.pid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ping tool */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="font-mono font-semibold text-sky-400 text-xs">
          NETWORK LATENCY DIAGNOSTICS (ping)
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pingTarget}
            onChange={(e) => setPingTarget(e.target.value)}
            disabled={pingRunning}
            placeholder="Host or IP (e.g. 1.1.1.1)"
            className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-sky-400 w-48 font-mono"
          />
          {!pingRunning ? (
            <button
              onClick={handleStartPing}
              className="bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-black px-3 py-1 rounded font-mono text-xs transition-colors"
            >
              Start Ping
            </button>
          ) : (
            <button
              onClick={handleStopPing}
              className="bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-3 py-1 rounded font-mono text-xs transition-colors"
            >
              Stop Ping
            </button>
          )}
        </div>
        <div className="h-28 bg-[#080a0f] border border-white/10 rounded p-2 overflow-y-auto font-mono text-[11px] text-slate-400">
          {pingLogs.map((pl, i) => (
            <div key={i}>{pl}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
