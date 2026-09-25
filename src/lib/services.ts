/*
Reason for existence: Systemd service daemon manager maintaining state, execution logs, and lifecycle transitions for server services and verified portfolio AI/ML projects.
System impact if absent: Systemd management application and terminal systemctl commands cannot control or query server services.
*/

import { ServiceUnit } from '@/types';

export class ServiceManager {
  private services: Record<string, ServiceUnit>;
  private listeners: Array<(services: ServiceUnit[]) => void>;

  constructor() {
    this.listeners = [];
    this.services = {
      'doru-daemon.service': {
        name: 'doru-daemon.service',
        displayName: 'Doru AI Desktop Assistant Daemon',
        status: 'running',
        pid: 2145,
        memory: '185.0 MB',
        uptime: '3d 12h',
        description: 'Core voice assistant daemon running Silero VAD, wakeword, and LangGraph audio loop',
        logs: [
          'WakeWordDetector initialized [ok]',
          'Audio capture stream active on default input',
          'LangGraph engine preloaded and warm'
        ],
        repoUrl: 'https://github.com/SILVESTRIKE/doru-ai',
        language: 'Python',
        category: 'ai'
      },
      'dogdexx.service': {
        name: 'dogdexx.service',
        displayName: 'DogDexx AI Breed Classifier & Vet Care',
        status: 'deployed',
        pid: 3012,
        memory: '124.0 MB',
        uptime: 'Live on Vercel',
        description: 'Deep Learning Convolutional Neural Network dog breed recognition platform with medical tracking',
        logs: [
          'Model weights loaded: PyTorch ResNet-50 backbone',
          'Edge inference pipeline ready at https://dogdexx.vercel.app'
        ],
        repoUrl: 'https://github.com/SILVESTRIKE/dogdexx',
        deployUrl: 'https://dogdexx.vercel.app',
        language: 'Python / PyTorch',
        category: 'ai'
      },
      'sentiment-nlp.service': {
        name: 'sentiment-nlp.service',
        displayName: 'Vietnamese Sentiment Analysis NLP Model',
        status: 'running',
        pid: 4120,
        memory: '96.5 MB',
        uptime: 'Live Service',
        description: 'Natural Language Processing sentiment classifier trained for Vietnamese social comments',
        logs: [
          'Underthesea word tokenizer initialized',
          'Sentiment vocabulary: 45,000 tokens loaded'
        ],
        repoUrl: 'https://github.com/SILVESTRIKE/DanhGiaCamXuc',
        language: 'Python / NLP',
        category: 'ai'
      },
      'odoo-erp.service': {
        name: 'odoo-erp.service',
        displayName: 'Odoo 19 ERP Business Suite & PostgreSQL HA',
        status: 'running',
        pid: 5432,
        memory: '380.0 MB',
        uptime: 'Container Up',
        description: 'Enterprise ERP management platform connected to pgvector PostgreSQL 15 container cluster',
        logs: [
          'PostgreSQL 15 pgvector initialized on port 5432',
          'pgweb web database manager active on port 8081',
          'CRM pipeline & Sales invoice engines online'
        ],
        category: 'business'
      }
    };

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
