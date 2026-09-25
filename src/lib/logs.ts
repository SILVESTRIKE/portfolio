/*
Reason for existence: System log stream engine generating and managing simulated syslog and journalctl telemetry with filtering and level formatting.
System impact if absent: System log viewer and terminal journalctl commands will lack log data and streaming updates.
*/

import { LogItem } from '@/types';

export class LogStreamManager {
  private logs: LogItem[] = [];
  private maxLogs = 250;
  private subscribers: Array<(newEntry: LogItem | null, allLogs: LogItem[]) => void> = [];
  private isPaused = false;
  private intervalId: NodeJS.Timeout | null = null;

  private sampleTemplates: Array<{ level: LogItem['level']; svc: string; msg: string }> = [
    { level: 'INFO', svc: 'nginx', msg: 'GET /api/v1/health HTTP/1.1 200 45ms' },
    { level: 'INFO', svc: 'nginx', msg: 'GET /assets/style.css HTTP/1.1 304 12ms' },
    { level: 'INFO', svc: 'sshd', msg: 'Accepted publickey for doru from 192.168.1.45 port 52310 ssh2' },
    { level: 'INFO', svc: 'kernel', msg: '[122485.120] e1000e 0000:00:19.0 eth0: Link is Up 1000 Mbps Full Duplex' },
    { level: 'INFO', svc: 'doru-daemon', msg: 'Silero VAD window processed: energy=0.012 speech_prob=0.04' },
    { level: 'WARN', svc: 'ufw', msg: '[UFW BLOCK] IN=eth0 OUT= MAC=00:1a:2b:3c:4d:5e SRC=185.220.101.4 DST=192.168.1.100 PROTO=TCP SPT=44122 DPT=23' },
    { level: 'INFO', svc: 'cron', msg: '(root) CMD (/usr/local/bin/backup-metrics.sh > /dev/null 2>&1)' },
    { level: 'WARN', svc: 'dockerd', msg: 'Container telemetry probe took 124ms (threshold 100ms)' },
    { level: 'INFO', svc: 'systemd', msg: 'systemd-journald.service: Sent WATCHDOG=1 notification to supervisor' },
    { level: 'ERROR', svc: 'nginx', msg: 'Connection refused while connecting to upstream backend: http://127.0.0.1:9090' }
  ];

  constructor() {
    this.seedInitialLogs();
    this.startStreaming();
  }

  private seedInitialLogs(): void {
    const baseTime = Date.now() - 3600000;
    for (let i = 0; i < 40; i++) {
      const offset = i * 85000;
      const t = new Date(baseTime + offset);
      const template = this.sampleTemplates[i % this.sampleTemplates.length];
      this.logs.push({
        id: i + 1,
        timestamp: t.toISOString().replace('T', ' ').substring(0, 19),
        service: template.svc,
        level: template.level,
        message: template.msg
      });
    }
  }

  public startStreaming(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      if (this.isPaused) return;
      this.generateLogEntry();
    }, 2800);
  }

  public stopStreaming(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  private generateLogEntry(): void {
    const template = this.sampleTemplates[Math.floor(Math.random() * this.sampleTemplates.length)];
    const entry: LogItem = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      service: template.svc,
      level: template.level,
      message: template.msg
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.notifySubscribers(entry);
  }

  public subscribe(callback: (newEntry: LogItem | null, allLogs: LogItem[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(newEntry: LogItem | null): void {
    this.subscribers.forEach(cb => cb(newEntry, this.logs));
  }

  public getLogs(filter: { level?: string; service?: string; search?: string } = {}): LogItem[] {
    return this.logs.filter(entry => {
      if (filter.level && filter.level !== 'ALL' && entry.level !== filter.level) {
        return false;
      }
      if (filter.service && !entry.service.toLowerCase().includes(filter.service.toLowerCase())) {
        return false;
      }
      if (filter.search && !entry.message.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }

  public clear(): void {
    this.logs = [];
    this.notifySubscribers(null);
  }
}

export const logManager = new LogStreamManager();
