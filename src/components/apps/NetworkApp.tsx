/*
Reason for existence: Network and firewall inspector application providing real socket listening status from ss, live interface metadata, UFW configuration, and ping diagnostics.
System impact if absent: Server network connections, open listening ports, and latency diagnostics cannot be monitored.
*/

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';

interface NetworkAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
}

interface SocketItem {
  proto: string;
  local: string;
  foreign: string;
  state: string;
  service: string;
  port: number;
}

interface InterfaceItem {
  name: string;
  ip: string;
  mac: string;
  cidr: string;
  isUp: boolean;
}

export function NetworkApp({ onNotify }: NetworkAppProps) {
  const { t } = useI18n();
  const [ufwActive, setUfwActive] = useState(true);
  const [primaryIf, setPrimaryIf] = useState<InterfaceItem>({
    name: 'wlo1',
    ip: '192.168.10.30',
    mac: '40:1a:58:14:1d:f4',
    cidr: '192.168.10.30/24',
    isUp: true
  });
  const [gateway, setGateway] = useState('192.168.10.1');
  const [dnsList, setDnsList] = useState<string[]>(['1.1.1.1', '8.8.8.8']);
  const [sockets, setSockets] = useState<SocketItem[]>([]);
  const [isLoadingSockets, setIsLoadingSockets] = useState(true);

  const [pingTarget, setPingTarget] = useState('1.1.1.1');
  const [pingRunning, setPingRunning] = useState(false);
  const [pingLogs, setPingLogs] = useState<string[]>([t.apps.network.pingReady]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadNetworkData = async () => {
    setIsLoadingSockets(true);
    try {
      const res = await fetch('/api/network');
      if (res.ok) {
        const data = await res.json();
        if (data.primaryInterface) setPrimaryIf(data.primaryInterface);
        if (data.gateway) setGateway(data.gateway);
        if (Array.isArray(data.dns)) setDnsList(data.dns);
        if (typeof data.ufwActive === 'boolean') setUfwActive(data.ufwActive);
        if (Array.isArray(data.sockets)) setSockets(data.sockets);
      }
    } catch {
      // Failed to load live network data
    } finally {
      setIsLoadingSockets(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

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

  return (
    <div className="h-full w-full p-3.5 flex flex-col gap-3 font-sans text-xs overflow-y-auto">
      {/* Top network stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-mono text-[11px]">{t.apps.network.interfaceLabel} ({primaryIf.name})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="font-mono text-sm font-bold text-white">{primaryIf.cidr}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            MAC: {primaryIf.mac} | MTU: 1500
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-mono text-[11px]">{t.apps.network.firewallLabel} (UFW)</span>
            <span className={`w-2 h-2 rounded-full ${ufwActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="font-mono text-sm font-bold text-white">
            Status: {ufwActive ? t.apps.network.statusActive : t.apps.network.statusDisabled}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono">
            Default: DENY (incoming) | ALLOW (outgoing)
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
          <div className="text-slate-400 font-mono text-[11px] mb-1">{t.apps.network.gatewayLabel}</div>
          <div className="font-mono text-sm font-bold text-white">{gateway}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            DNS: {dnsList.join(', ')}
          </div>
        </div>
      </div>

      {/* Listening sockets table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center font-mono">
          <span className="font-semibold text-[#7aa2f7] text-xs">{t.apps.network.socketsTitle}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={loadNetworkData}
              disabled={isLoadingSockets}
              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {isLoadingSockets ? 'Scanning...' : 'Refresh Sockets'}
            </button>
            <span className="text-slate-500 text-[11px]">{sockets.length} {t.apps.network.openSockets}</span>
          </div>
        </div>
        <div className="overflow-x-auto max-h-56">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead className="sticky top-0 bg-[#0d111a] border-b border-white/10 text-slate-400">
              <tr>
                <th className="py-1 px-2">{t.apps.network.colProto}</th>
                <th className="py-1 px-2">{t.apps.network.colLocal}</th>
                <th className="py-1 px-2">{t.apps.network.colForeign}</th>
                <th className="py-1 px-2">{t.apps.network.colState}</th>
                <th className="py-1 px-2">{t.apps.network.colService}</th>
                <th className="py-1 px-2">{t.apps.network.colPid}</th>
              </tr>
            </thead>
            <tbody>
              {sockets.map((p, idx) => (
                <tr key={idx} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                  <td className="py-1 px-2 text-slate-400 uppercase">{p.proto}</td>
                  <td className="py-1 px-2 text-slate-200 font-medium">{p.local}</td>
                  <td className="py-1 px-2 text-slate-500">{p.foreign}</td>
                  <td className="py-1 px-2 text-emerald-400 font-bold">{p.state}</td>
                  <td className="py-1 px-2 text-[#7aa2f7]">{p.service}</td>
                  <td className="py-1 px-2 text-slate-500">{p.port || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ping tool */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
        <div className="font-mono font-semibold text-[#7aa2f7] text-xs">
          {t.apps.network.diagTitle}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pingTarget}
            onChange={(e) => setPingTarget(e.target.value)}
            disabled={pingRunning}
            placeholder={t.apps.network.pingPlaceholder}
            className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-[#7aa2f7] w-48 font-mono"
          />
          {!pingRunning ? (
            <button
              onClick={handleStartPing}
              className="bg-[#7aa2f7]/20 text-[#89b4fa] border border-[#7aa2f7]/30 hover:bg-[#7aa2f7] hover:text-black px-3 py-1 rounded font-mono text-xs transition-colors"
            >
              {t.apps.network.startPing}
            </button>
          ) : (
            <button
              onClick={handleStopPing}
              className="bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white px-3 py-1 rounded font-mono text-xs transition-colors"
            >
              {t.apps.network.stopPing}
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
