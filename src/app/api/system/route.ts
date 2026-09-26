/*
Reason for existence: Next.js API Route serving real-time system metrics (CPU, RAM, swap, uptime, load) from Node.js os module.
System impact if absent: MonitorApp and TopPanel will fall back to simulated random data instead of real host telemetry.
*/

import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import { ProcessItem } from '@/types';
import { SYSTEM_CONFIG } from '@/config';

interface SystemMetricsResponse {
  hostname: string;
  platform: string;
  arch: string;
  kernel: string;
  uptime: number;
  loadAvg: number[];
  cpuModel: string;
  coreCount: number;
  physicalCores: number;
  threadCount: number;
  gpuModel: string;
  hostModel: string;
  osName: string;
  cores: number[];
  totalCpu: number;
  ramTotal: number;
  ramUsed: number;
  ramPercent: number;
  swapTotal: number;
  swapUsed: number;
  rxRate: number;
  txRate: number;
  processes: ProcessItem[];
}

// Track previous CPU times for delta-based utilization
let prevCpuTimes: Array<{ idle: number; total: number }> | null = null;

// Track previous network bytes for rate calculation
let prevNetBytes: { rx: number; tx: number; ts: number } | null = null;

function getCpuUsage(): { cores: number[]; totalCpu: number } {
  const cpus = os.cpus();
  const coreUsages: number[] = [];
  let totalIdleDelta = 0;
  let totalAllDelta = 0;

  const currentTimes = cpus.map(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    return { idle: cpu.times.idle, total };
  });

  if (prevCpuTimes && prevCpuTimes.length === currentTimes.length) {
    for (let i = 0; i < currentTimes.length; i++) {
      const idleDelta = currentTimes[i].idle - prevCpuTimes[i].idle;
      const totalDelta = currentTimes[i].total - prevCpuTimes[i].total;
      const usage = totalDelta > 0 ? Math.round(((totalDelta - idleDelta) / totalDelta) * 100) : 0;
      coreUsages.push(Math.max(0, Math.min(100, usage)));
      totalIdleDelta += idleDelta;
      totalAllDelta += totalDelta;
    }
  } else {
    // First call — estimate from instantaneous times
    for (const cpu of cpus) {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const usage = total > 0 ? Math.round(((total - cpu.times.idle) / total) * 100) : 0;
      coreUsages.push(Math.max(0, Math.min(100, usage)));
      totalIdleDelta += cpu.times.idle;
      totalAllDelta += total;
    }
  }

  prevCpuTimes = currentTimes;

  const totalCpu = totalAllDelta > 0
    ? Math.round(((totalAllDelta - totalIdleDelta) / totalAllDelta) * 100)
    : 0;

  return { cores: coreUsages, totalCpu: Math.max(0, Math.min(100, totalCpu)) };
}

function getSwapInfo(): { swapTotal: number; swapUsed: number } {
  try {
    if (fs.existsSync('/proc/meminfo')) {
      const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
      const swapTotalMatch = meminfo.match(/SwapTotal:\s+(\d+)\s+kB/);
      const swapFreeMatch = meminfo.match(/SwapFree:\s+(\d+)\s+kB/);
      if (swapTotalMatch && swapFreeMatch) {
        const swapTotal = Math.round(parseInt(swapTotalMatch[1]) / 1024);
        const swapFree = Math.round(parseInt(swapFreeMatch[1]) / 1024);
        return { swapTotal, swapUsed: swapTotal - swapFree };
      }
    }
  } catch {
    // Fallback for non-Linux
  }
  return { swapTotal: 0, swapUsed: 0 };
}

function getNetworkRates(): { rxRate: number; txRate: number } {
  try {
    if (fs.existsSync('/proc/net/dev')) {
      const netDev = fs.readFileSync('/proc/net/dev', 'utf-8');
      const lines = netDev.split('\n');
      let totalRx = 0;
      let totalTx = 0;

      for (const line of lines) {
        // Skip loopback and header lines
        if (line.includes('lo:') || !line.includes(':')) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 10) {
          totalRx += parseInt(parts[1]) || 0;
          totalTx += parseInt(parts[9]) || 0;
        }
      }

      const now = Date.now();
      if (prevNetBytes) {
        const elapsed = (now - prevNetBytes.ts) / 1000;
        if (elapsed > 0) {
          const rxRate = Math.round((totalRx - prevNetBytes.rx) / elapsed / 1024); // KB/s
          const txRate = Math.round((totalTx - prevNetBytes.tx) / elapsed / 1024);
          prevNetBytes = { rx: totalRx, tx: totalTx, ts: now };
          return { rxRate: Math.max(0, rxRate), txRate: Math.max(0, txRate) };
        }
      }

      prevNetBytes = { rx: totalRx, tx: totalTx, ts: now };
    }
  } catch {
    // Fallback for non-Linux
  }
  return { rxRate: 0, txRate: 0 };
}

function getCpuTopology(): { physicalCores: number; threadCount: number } {
  const threadCount = os.cpus().length || 1;
  let physicalCores = 0;

  try {
    if (fs.existsSync('/proc/cpuinfo')) {
      const content = fs.readFileSync('/proc/cpuinfo', 'utf-8');
      const coreMap = new Set<string>();
      let currentPhysId = '0';
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('physical id')) {
          currentPhysId = line.split(':')[1]?.trim() || '0';
        } else if (line.startsWith('core id')) {
          const coreId = line.split(':')[1]?.trim() || '0';
          coreMap.add(`${currentPhysId}:${coreId}`);
        }
      }
      if (coreMap.size > 0) {
        physicalCores = coreMap.size;
      }
    }
  } catch {
    // Non-Linux or inaccessible proc
  }

  if (physicalCores === 0) {
    physicalCores = Math.max(1, Math.round(threadCount / 2));
  }

  return { physicalCores, threadCount };
}

function getHostHardwareInfo(): { hostModel: string; gpuModel: string; osName: string } {
  return {
    hostModel: SYSTEM_CONFIG.hardwareDefaults.hostModel,
    gpuModel: SYSTEM_CONFIG.hardwareDefaults.gpu,
    osName: SYSTEM_CONFIG.os.name
  };
}

export async function GET() {
  const { cores, totalCpu } = getCpuUsage();
  const { swapTotal, swapUsed } = getSwapInfo();
  const { rxRate, txRate } = getNetworkRates();
  const { physicalCores, threadCount } = getCpuTopology();
  const { hostModel, gpuModel, osName } = getHostHardwareInfo();

  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  const ramTotalMB = Math.round(totalMem / (1024 * 1024));
  const ramUsedMB = Math.round(usedMem / (1024 * 1024));
  const ramPercent = Math.round((usedMem / totalMem) * 100);

  const cpuInfo = os.cpus()[0];

  const metrics: SystemMetricsResponse = {
    hostname: SYSTEM_CONFIG.serverHost,
    platform: os.platform(),
    arch: os.arch(),
    kernel: os.release(),
    uptime: os.uptime(),
    loadAvg: os.loadavg().map(v => parseFloat(v.toFixed(2))),
    cpuModel: cpuInfo?.model || SYSTEM_CONFIG.hardwareDefaults.cpu,
    coreCount: threadCount,
    physicalCores,
    threadCount,
    gpuModel,
    hostModel,
    osName,
    cores,
    totalCpu,
    ramTotal: ramTotalMB,
    ramUsed: ramUsedMB,
    ramPercent,
    swapTotal,
    swapUsed,
    rxRate,
    txRate,
    processes: []
  };

  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
