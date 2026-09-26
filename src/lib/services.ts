/*
Reason for existence: Systemd service daemon manager maintaining state, execution logs, and lifecycle transitions for server services and verified portfolio AI/ML projects.
System impact if absent: Systemd management application and terminal systemctl commands cannot control or query server services.
*/

import { ServiceUnit } from '@/types';
import { portfolioServices } from './portfolio';

export class ServiceManager {
  private services: Record<string, ServiceUnit>;
  private listeners: Array<(services: ServiceUnit[]) => void>;

  constructor() {
    this.listeners = [];
    this.services = {};
    for (const s of portfolioServices) {
      this.services[s.name] = { ...s };
    }

    this.fetchLiveServices();
  }

  private async fetchLiveServices(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.services)) {
          for (const s of data.services) {
            this.services[s.name] = s;
          }
          this.notify();
        }
      }
    } catch {
      // Fallback
    }
  }

  public onChange(listener: (services: ServiceUnit[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    const list = this.getAll();
    this.listeners.forEach(fn => fn(list));
  }

  public getAll(): ServiceUnit[] {
    return Object.values(this.services);
  }

  public get(name: string): ServiceUnit | null {
    const key = name.endsWith('.service') || name.endsWith('.container') ? name : `${name}.service`;
    return this.services[key] || this.services[name] || null;
  }

  public start(name: string): { success: boolean; msg: string } {
    const svc = this.get(name);
    if (!svc) return { success: false, msg: `Unit ${name} not found.` };
    
    svc.status = 'running';
    svc.pid = Math.floor(Math.random() * 5000) + 1000;
    svc.memory = `${(Math.random() * 80 + 20).toFixed(1)} MB`;
    svc.uptime = '0m 05s';
    svc.logs.push(`Started ${svc.displayName}.`);
    this.notify();
    return { success: true, msg: `Started ${svc.name}.` };
  }

  public stop(name: string): { success: boolean; msg: string } {
    const svc = this.get(name);
    if (!svc) return { success: false, msg: `Unit ${name} not found.` };
    
    svc.status = 'stopped';
    svc.pid = 0;
    svc.memory = '0 MB';
    svc.uptime = '0s';
    svc.logs.push(`Stopped ${svc.displayName}.`);
    this.notify();
    return { success: true, msg: `Stopped ${svc.name}.` };
  }

  public restart(name: string): { success: boolean; msg: string } {
    const svc = this.get(name);
    if (!svc) return { success: false, msg: `Unit ${name} not found.` };
    
    svc.status = 'running';
    svc.pid = Math.floor(Math.random() * 5000) + 1000;
    svc.uptime = '0m 01s';
    svc.logs.push(`Restarting ${svc.displayName}...`);
    svc.logs.push(`Started ${svc.displayName}.`);
    this.notify();
    return { success: true, msg: `Restarted ${svc.name}.` };
  }
}

export const services = new ServiceManager();
