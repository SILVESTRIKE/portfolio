/*
Reason for existence: Systemd service daemon manager maintaining state, execution logs, and lifecycle transitions for server services (nginx, docker, postgresql, doru-daemon).
System impact if absent: Systemd management application and terminal systemctl commands cannot control or query server services.
*/

import { ServiceUnit } from '@/types';

export class ServiceManager {
  private services: Record<string, ServiceUnit>;
  private listeners: Array<(services: ServiceUnit[]) => void>;

  constructor() {
    this.services = {
      'nginx.service': {
        name: 'nginx.service',
        displayName: 'NGINX HTTP & Reverse Proxy',
        status: 'running',
        pid: 1420,
        memory: '38.4 MB',
        uptime: '14d 06h',
        description: 'High performance web server and reverse proxy for internal services',
        logs: [
          'Starting A high performance web server and a reverse proxy...',
          'Configuration file /etc/nginx/nginx.conf test is successful',
          'Started A high performance web server and a reverse proxy.'
        ]
      },
      'docker.service': {
        name: 'docker.service',
        displayName: 'Docker Application Container Engine',
        status: 'running',
        pid: 1102,
        memory: '284.1 MB',
        uptime: '14d 06h',
        description: 'Container virtualization engine managing microservices and sidecars',
        logs: [
          'Loading daemon configuration from /etc/docker/daemon.json',
          'API listen on /var/run/docker.sock',
          'Daemon has completed initialization'
        ]
      },
      'sshd.service': {
        name: 'sshd.service',
        displayName: 'OpenSSH Daemon',
        status: 'running',
        pid: 924,
        memory: '12.8 MB',
        uptime: '14d 06h',
        description: 'Secure shell server listening on port 22 for sysadmin remote sessions',
        logs: [
          'Server listening on 0.0.0.0 port 22.',
          'Server listening on :: port 22.'
        ]
      },
      'postgresql.service': {
        name: 'postgresql.service',
        displayName: 'PostgreSQL Database Server',
        status: 'running',
        pid: 1530,
        memory: '142.6 MB',
        uptime: '9d 18h',
        description: 'Relational database storing user metadata, logs, and telemetry',
        logs: [
          'database system was shut down at 2026-09-15 20:59:01 UTC',
          'database system is ready to accept connections'
        ]
      },
      'doru-daemon.service': {
        name: 'doru-daemon.service',
        displayName: 'Doru AI Desktop Assistant Daemon',
        status: 'running',
        pid: 2145,
        memory: '185.0 MB',
        uptime: '3d 12h',
        description: 'Core voice assistant daemon running Silero VAD, wakeword, and audio loop',
        logs: [
          'WakeWordDetector initialized [ok]',
          'Audio capture stream active on default input',
          'LangGraph engine preloaded and warm'
        ]
      },
      'ufw.service': {
        name: 'ufw.service',
        displayName: 'Uncomplicated Firewall',
        status: 'running',
        pid: 742,
        memory: '4.2 MB',
        uptime: '14d 06h',
        description: 'Packet filtering firewall securing ingress and egress network ports',
        logs: [
          'Firewall is active and enabled on system startup',
          'Rules reloaded successfully'
        ]
      },
      'redis.service': {
        name: 'redis.service',
        displayName: 'Redis In-Memory Cache Store',
        status: 'stopped',
        pid: 0,
        memory: '0 MB',
        uptime: '0s',
        description: 'Key-value cache database used for quick session state and pubsub',
        logs: [
          'Stopping Redis In-Memory Data Store...',
          'Stopped Redis In-Memory Data Store.'
        ]
      },
      'cron.service': {
        name: 'cron.service',
        displayName: 'Regular Background Job Daemon',
        status: 'running',
        pid: 884,
        memory: '6.1 MB',
        uptime: '14d 06h',
        description: 'Automated periodic scheduling daemon for backup and maintenance scripts',
        logs: [
          'cron daemon initialized and running periodic jobs'
        ]
      }
    };

    this.listeners = [];
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
    const key = name.endsWith('.service') ? name : `${name}.service`;
    return this.services[key] || null;
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
