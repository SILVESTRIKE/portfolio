/*
Reason for existence: System log stream engine fetching live kernel and journalctl telemetry from /api/logs with filtering and level formatting.
System impact if absent: System log viewer and terminal journalctl commands will lack log data and streaming updates.
*/

import { LogItem } from '@/types';

export class LogStreamManager {
  private logs: LogItem[] = [];
  private maxLogs = 250;
  private subscribers: Array<(newEntry: LogItem | null, allLogs: LogItem[]) => void> = [];
  private isPaused = false;
  private intervalId: NodeJS.Timeout | null = null;
  private clientLogSeq = 1;

  constructor() {
    this.fetchInitialLogs();
    this.startStreaming();
  }

  private async fetchInitialLogs(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/logs?limit=80');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.logs) && data.logs.length > 0) {
          this.logs = data.logs.map((l: LogItem) => ({
            ...l,
            id: this.clientLogSeq++
          }));
          this.notifySubscribers(null);
        }
      }
    } catch {
      // Fallback
    }
  }

  public startStreaming(): void {
    if (this.intervalId || typeof window === 'undefined') return;
    this.intervalId = setInterval(async () => {
      if (this.isPaused) return;
      await this.pollNewLogs();
    }, 3500);
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

  private async pollNewLogs(): Promise<void> {
    try {
      const res = await fetch('/api/logs?limit=30');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.logs)) return;

      let hasNew = false;
      for (const entry of data.logs) {
        const exists = this.logs.some(
          l => l.timestamp === entry.timestamp && l.message === entry.message && l.service === entry.service
        );
        if (!exists) {
          this.logs.push({
            ...entry,
            id: this.clientLogSeq++
          });
          hasNew = true;
        }
      }

      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }

      if (hasNew) {
        const latest = this.logs[this.logs.length - 1] || null;
        this.notifySubscribers(latest);
      }
    } catch {
      // Ignore network errors in poll loop
    }
  }

  public subscribe(callback: (newEntry: LogItem | null, allLogs: LogItem[]) => void): () => void {
    this.subscribers.push(callback);
    // Immediately provide current state
    callback(null, this.logs);
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
