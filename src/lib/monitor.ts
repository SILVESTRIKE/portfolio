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
  private physicalCores = 8;
  private threadCount = 12;
  private gpuModel = '';
  private hostModel = '';
  private osName = '';
  private kernel = '';
  private platform = '';
  private arch = '';
  private uptime = 0;
  private loadAvg: number[] = [0, 0, 0];

  private processes: ProcessItem[] = [
    { pid: 101, user: 'duong', cpu: 1.2, mem: 1.4, virt: '48M', res: '18M', time: '14:20', cmd: 'terminal.app (BASH Shell & Dossier)' },
    { pid: 102, user: 'duong', cpu: 0.8, mem: 1.1, virt: '36M', res: '14M', time: '08:15', cmd: 'monitor.app (Activity & Visitor Analytics)' },
    { pid: 103, user: 'duong', cpu: 0.5, mem: 1.2, virt: '42M', res: '16M', time: '05:40', cmd: 'services.app (Microservices Catalog)' },
    { pid: 104, user: 'duong', cpu: 0.9, mem: 1.5, virt: '54M', res: '22M', time: '03:10', cmd: 'git.app (Visual Git VCS Studio)' },
    { pid: 105, user: 'duong', cpu: 0.3, mem: 0.8, virt: '28M', res: '10M', time: '02:05', cmd: 'network.app (Listening Sockets Inspector)' },
    { pid: 106, user: 'duong', cpu: 0.2, mem: 0.6, virt: '22M', res: '8M', time: '18:44', cmd: 'vfs-worker (Virtual FS Sync Daemon)' },
    { pid: 107, user: 'duong', cpu: 0.4, mem: 0.9, virt: '30M', res: '12M', time: '12:30', cmd: 'audio-synth (WebAudio Sound Engine)' },
    { pid: 108, user: 'duong', cpu: 0.2, mem: 0.5, virt: '18M', res: '6M', time: '01:12', cmd: 'analytics.worker (Visitor Telemetry Agent)' }
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

      // Update client browser memory heap in WebOS tasks
      if (typeof window !== 'undefined' && (window.performance as unknown as { memory?: { usedJSHeapSize?: number } })?.memory) {
        const heap = (window.performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize;
        const heapMB = Math.round(heap / (1024 * 1024));
        if (this.processes[0]) {
          this.processes[0].res = `${heapMB}M`;
        }
      }

      // Enriched host metadata
      this.hostname = data.hostname ?? this.hostname;
      this.cpuModel = data.cpuModel ?? this.cpuModel;
      this.physicalCores = data.physicalCores ?? this.physicalCores;
      this.threadCount = data.threadCount ?? this.threadCount;
      this.gpuModel = data.gpuModel ?? this.gpuModel;
      this.hostModel = data.hostModel ?? this.hostModel;
      this.osName = data.osName ?? this.osName;
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
      physicalCores: this.physicalCores,
      threadCount: this.threadCount,
      gpuModel: this.gpuModel,
      hostModel: this.hostModel,
      osName: this.osName,
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
    strokeColor = '#7aa2f7',
    fillColor = 'rgba(122, 162, 247, 0.15)'
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
