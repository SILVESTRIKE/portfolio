/*
Reason for existence: System resource metrics engine fetching live CPU, memory, network data from /api/system and providing canvas chart rendering and process management.
System impact if absent: System Resource Monitor (htop) window and top panel metrics will not update or display process activity.
*/

import { ProcessItem, SystemSnapshot } from '@/types';

export class SystemMonitor {
  private coreCount = 0;
  private cores: number[] = [];
  private totalCpu = 0;
  private ramTotal = 0;
  private ramUsed = 0;
  private swapTotal = 0;
  private swapUsed = 0;

  private rxRate = 0;
  private txRate = 0;

  private historyLength = 30;
  private cpuHistory: number[] = Array(30).fill(0);
  private ramHistory: number[] = Array(30).fill(0);

  // Enriched host info from real API
  private hostname = '';
  private cpuModel = '';
  private kernel = '';
  private platform = '';
  private arch = '';
  private uptime = 0;
  private loadAvg: number[] = [0, 0, 0];

  private processes: ProcessItem[] = [
    { pid: 1, user: 'root', cpu: 0.1, mem: 0.2, virt: '168M', res: '12M', time: '02:14.22', cmd: '/sbin/init splash' },
    { pid: 924, user: 'root', cpu: 0.0, mem: 0.1, virt: '18M', res: '8M', time: '00:04.10', cmd: '/usr/sbin/sshd -D' },
    { pid: 1102, user: 'root', cpu: 1.4, mem: 2.1, virt: '1.2G', res: '340M', time: '14:28.45', cmd: '/usr/bin/dockerd -H fd://' },
    { pid: 1420, user: 'www-data', cpu: 0.8, mem: 0.4, virt: '84M', res: '48M', time: '08:12.30', cmd: 'nginx: worker process' },
    { pid: 1530, user: 'postgres', cpu: 2.1, mem: 1.2, virt: '380M', res: '196M', time: '11:05.18', cmd: 'postgres: checkpointer' },
    { pid: 2145, user: 'doru', cpu: 4.8, mem: 2.8, virt: '890M', res: '450M', time: '22:40.11', cmd: 'python3 -m doru_ai.daemon' },
    { pid: 2890, user: 'root', cpu: 0.2, mem: 0.1, virt: '24M', res: '6M', time: '00:01.05', cmd: '/usr/sbin/cron -f' },
    { pid: 3210, user: 'doru', cpu: 1.1, mem: 0.8, virt: '140M', res: '88M', time: '03:19.40', cmd: 'node ./server/index.js' }
  ];

  private listeners: Array<(snap: SystemSnapshot) => void> = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private apiFailed = false;

  constructor() {
    this.startPolling();
  }

  private startPolling(): void {
    if (typeof window === 'undefined') return;

    // Immediately fetch once, then poll every 1.5s
    this.fetchAndUpdate();
    this.intervalId = setInterval(() => {
      this.fetchAndUpdate();
    }, 1500);
  }

  private async fetchAndUpdate(): Promise<void> {
    try {
      const res = await fetch('/api/system');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      this.apiFailed = false;

      // Apply real metrics
      this.coreCount = data.coreCount ?? this.coreCount;
      this.cores = data.cores ?? this.cores;
      this.totalCpu = data.totalCpu ?? this.totalCpu;
      this.ramTotal = data.ramTotal ?? this.ramTotal;
      this.ramUsed = data.ramUsed ?? this.ramUsed;
      this.swapTotal = data.swapTotal ?? this.swapTotal;
      this.swapUsed = data.swapUsed ?? this.swapUsed;
      this.rxRate = data.rxRate ?? this.rxRate;
      this.txRate = data.txRate ?? this.txRate;

      // Enriched host metadata
      this.hostname = data.hostname ?? this.hostname;
      this.cpuModel = data.cpuModel ?? this.cpuModel;
      this.kernel = data.kernel ?? this.kernel;
      this.platform = data.platform ?? this.platform;
      this.arch = data.arch ?? this.arch;
      this.uptime = data.uptime ?? this.uptime;
      this.loadAvg = data.loadAvg ?? this.loadAvg;

      // Push to history
      this.cpuHistory.push(this.totalCpu);
      this.cpuHistory.shift();

      const ramPercent = this.ramTotal > 0
        ? Math.round((this.ramUsed / this.ramTotal) * 100)
        : 0;
      this.ramHistory.push(ramPercent);
      this.ramHistory.shift();

      this.notify();
    } catch {
      // API unavailable — fall back to gentle simulation so UI doesn't freeze
      if (!this.apiFailed) {
        this.apiFailed = true;
      }
      this.simulateFallback();
      this.notify();
    }
  }

  // Minimal fallback simulation if API endpoint is unreachable (e.g. during build)
  private simulateFallback(): void {
    if (this.cores.length === 0) {
      this.coreCount = 8;
      this.cores = Array(8).fill(10);
      this.ramTotal = 16384;
      this.ramUsed = 3450;
      this.swapTotal = 4096;
      this.swapUsed = 128;
    }

    let sumCpu = 0;
    for (let i = 0; i < this.cores.length; i++) {
      const delta = (Math.random() - 0.48) * 8;
      this.cores[i] = Math.max(3, Math.min(95, Math.round(this.cores[i] + delta)));
      sumCpu += this.cores[i];
    }
    this.totalCpu = this.cores.length > 0 ? Math.round(sumCpu / this.cores.length) : 12;

    this.cpuHistory.push(this.totalCpu);
    this.cpuHistory.shift();

    const ramPercent = this.ramTotal > 0
      ? Math.round((this.ramUsed / this.ramTotal) * 100)
      : 21;
    this.ramHistory.push(ramPercent);
    this.ramHistory.shift();
  }

  public killProcess(pid: number): { success: boolean; process?: ProcessItem; msg?: string } {
    const idx = this.processes.findIndex(p => p.pid === pid);
    if (idx !== -1) {
      const killed = this.processes.splice(idx, 1)[0];
      this.notify();
      return { success: true, process: killed };
    }
    return { success: false, msg: `PID ${pid} not found.` };
  }

  public getSnapshot(): SystemSnapshot {
    return {
      cores: [...this.cores],
      totalCpu: this.totalCpu,
      ramTotal: this.ramTotal,
      ramUsed: this.ramUsed,
      ramPercent: this.ramTotal > 0
        ? Math.round((this.ramUsed / this.ramTotal) * 100)
        : 0,
      swapTotal: this.swapTotal,
      swapUsed: this.swapUsed,
      rxRate: this.rxRate,
      txRate: this.txRate,
      cpuHistory: [...this.cpuHistory],
      ramHistory: [...this.ramHistory],
      processes: [...this.processes],
      // Extended real host metadata
      hostname: this.hostname,
      cpuModel: this.cpuModel,
      kernel: this.kernel,
      platform: this.platform,
      arch: this.arch,
      uptime: this.uptime,
      loadAvg: [...this.loadAvg]
    };
  }

  public subscribe(listener: (snap: SystemSnapshot) => void): () => void {
    this.listeners.push(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach(fn => fn(snap));
  }

  public renderChart(
    canvas: HTMLCanvasElement | null,
    dataPoints: number[],
    strokeColor = '#38bdf8',
    fillColor = 'rgba(56, 189, 248, 0.15)'
  ): void {
    if (!canvas || !canvas.parentElement) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += height / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (dataPoints.length < 2) return;

    const step = width / (dataPoints.length - 1);
    const maxVal = 100;

    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let i = 0; i < dataPoints.length; i++) {
      const x = i * step;
      const y = height - (dataPoints[i] / maxVal) * height;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevY = height - (dataPoints[i - 1] / maxVal) * height;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < dataPoints.length; i++) {
      const x = i * step;
      const y = height - (dataPoints[i] / maxVal) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = (i - 1) * step;
        const prevY = height - (dataPoints[i - 1] / maxVal) * height;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export const monitor = new SystemMonitor();
