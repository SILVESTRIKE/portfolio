/*
Reason for existence: In-memory virtual Linux filesystem providing hierarchical file operations (/etc, /var/log, /proc, /home/doru), path resolution, and read/write methods.
System impact if absent: Terminal bash commands and server file explorer have no filesystem to read, edit, or execute.
*/

import { FileNode } from '@/types';
import { WebOSPersistence } from '@/lib/persistence';

export class VirtualFileSystem {
  private root: FileNode;

  constructor() {
    this.root = {
      type: 'dir',
      name: '',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      group: 'root',
      updatedAt: new Date(),
      children: {}
    };

    const savedChildren = WebOSPersistence.loadVFS();
    if (savedChildren && Object.keys(savedChildren).length > 0) {
      this.root.children = savedChildren;
    } else {
      this.initializeDefaultHierarchy();
    }
  }

  private initializeDefaultHierarchy(): void {
    const topDirs = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'];
    for (const dir of topDirs) {
      this.createDir(`/${dir}`, 'root', 'root', 'drwxr-xr-x');
    }

    this.createDir('/home/doru', 'doru', 'doru', 'drwxr-xr-x');
    this.createDir('/var/log', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/nginx', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/ssh', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/systemd', 'root', 'root', 'drwxr-xr-x');

    this.writeFile('/etc/hostname', 'srv-doru\n', 'root', '644');
    
    this.writeFile('/etc/os-release', 
`NAME="Ubuntu"
VERSION="24.04 LTS (Noble Numbat)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 24.04 LTS"
VERSION_ID="24.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
`, 'root', '644');

    this.writeFile('/etc/hosts', 
`127.0.0.1 localhost
127.0.1.1 srv-doru
192.168.1.100 srv-doru.internal

::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
`, 'root', '644');

    this.writeFile('/etc/nginx/nginx.conf',
`user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80 default_server;
        server_name srv-doru.internal;
        
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
`, 'root', '644');

    this.writeFile('/etc/ssh/sshd_config',
`Port 22
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
Subsystem sftp /usr/lib/openssh/sftp-server
`, 'root', '600');

    this.writeFile('/proc/version', 'Linux version 6.8.0-45-generic (buildd@lcy02-amd64-072) (gcc 13.2.0) #45-Ubuntu SMP PREEMPT_DYNAMIC\n', 'root', '444');
    this.writeFile('/proc/cpuinfo', 
`processor   : 0
model name  : Intel(R) Xeon(R) Platinum 8480+ @ 3.80GHz
cpu MHz     : 3799.988
cache size  : 107520 KB
cpu cores   : 8
`, 'root', '444');

    this.writeFile('/proc/meminfo',
`MemTotal:       16384000 kB
MemFree:        12592000 kB
MemAvailable:   13800000 kB
Buffers:          340000 kB
Cached:          1868000 kB
SwapTotal:       4194304 kB
SwapFree:        4194304 kB
`, 'root', '444');

    this.writeFile('/home/doru/welcome.txt',
`============================================================
Welcome to SILVESTRIKE Portfolio OS (silvestrike.dev)
Environment: Next.js 15 + Tailwind CSS v4 + TypeScript
Default User: duong / root
============================================================

Quick Commands:
  help          - List all available terminal commands
  neofetch      - Display server hardware and OS specifications
  htop          - Launch or inspect active CPU and RAM processes
  portfolio     - View featured projects and services
  whoami        - Display developer biography and dossiers
  systemctl     - Inspect and manage server daemons
  journalctl -f - Stream server logs
  df -h         - Check disk filesystem utilization
  free -m       - View physical and swap memory allocation

Enjoy exploring the interactive portfolio workstation!
`, 'doru', '644');

    this.writeFile('/home/doru/deploy.sh',
`#!/bin/bash
set -e
echo "Starting deployment sequence for api-gateway..."
systemctl stop nginx
echo "Pulling latest docker container images..."
docker pull internal.registry/api-gateway:latest
echo "Restarting service..."
systemctl start nginx
echo "Deployment verified healthy."
`, 'doru', '755');

    this.writeFile('/home/doru/README.md',
`# VAN TRONG DUONG (SILVESTRIKE)
Full-Stack Developer | AI/ML Engineer | Aspiring Solutions Architect

## About Me
- Name: Van Trong Duong
- Location: HCMC, Vietnam
- Education: B.Eng Information Technology @ HUIT (GPA: 3.2/4.0 | IELTS: 6.5)
- Focus: Full-Stack Development • AI/ML Engineering
- Thesis: Veritas - AI-powered Vietnamese Land & Legal Document Digitization (RAG + LLM)

## Tech Stack
- Languages: Python, TypeScript, JavaScript, C#, PHP, SQL
- AI/ML: PyTorch, TensorFlow, OpenCV, MediaPipe, YOLO, LangGraph, LangChain, Whisper, Kokoro
- Web: Next.js 14/15, React, Node.js, Express, ASP.NET Core, .NET WinForms, Laravel
- Databases & DevOps: PostgreSQL, MongoDB, SQL Server, Prisma, Docker, Linux, CI/CD

## Featured Projects
- samco-binhtan-webapp: EV Sales CMS & E-commerce (Next.js 14, Prisma, Node)
- DogDexx: AI Dog Species ID & Pet Health Records (PyTorch, Next.js, Cloudinary)
- Doru_AI: Linux Hyprland Desktop Voice Assistant (LangGraph, Silero, Whisper, Groq)
- WebBanTra & CafePOS: E-Commerce & Retail POS Suite (C#, ASP.NET, WinForms, SQL Server)
- HoverController: Hand gesture computer control with MediaPipe & OpenCV
- Toi_Uu_Gia: Price Elasticity Regression Deep Learning Model

## Contact
- Email: vtduong04@gmail.com
- Facebook: fb.com/hakudevon
- GitHub: https://github.com/SILVESTRIKE
`, 'doru', '644');
  }

  public normalizePath(path: string): string {
    if (!path) return '/';
    const parts = path.split('/').filter(p => p && p !== '.');
    const resolved: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    return '/' + resolved.join('/');
  }

  public resolvePath(currentDir: string, targetPath: string): string {
    if (!targetPath || targetPath === '~') {
      return '/home/doru';
    }
    if (targetPath.startsWith('~/')) {
      targetPath = '/home/doru/' + targetPath.slice(2);
    }
    if (targetPath.startsWith('/')) {
      return this.normalizePath(targetPath);
    }
    const combined = (currentDir === '/' ? '' : currentDir) + '/' + targetPath;
    return this.normalizePath(combined);
  }

  public getNode(path: string): FileNode | null {
    const norm = this.normalizePath(path);
    if (norm === '/') return this.root;

    const parts = norm.split('/').filter(Boolean);
    let curr: FileNode = this.root;
    for (const part of parts) {
      if (curr.type !== 'dir' || !curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  public createDir(path: string, owner = 'root', group = 'root', permissions = 'drwxr-xr-x'): boolean {
    const norm = this.normalizePath(path);
    if (norm === '/') return true;

    const parts = norm.split('/').filter(Boolean);
    let curr: FileNode = this.root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!curr.children) {
        curr.children = {};
      }
      if (!curr.children[part]) {
        curr.children[part] = {
          type: 'dir',
          name: part,
          permissions: permissions,
          owner: owner,
          group: group,
          updatedAt: new Date(),
          children: {}
        };
      }
      curr = curr.children[part];
    }
    this.persist();
    return true;
  }

  public writeFile(path: string, content: string, owner = 'root', permissions = '644'): boolean {
    const norm = this.normalizePath(path);
    const lastSlash = norm.lastIndexOf('/');
    const dirPath = norm.substring(0, lastSlash) || '/';
    const fileName = norm.substring(lastSlash + 1);

    if (!fileName) return false;

    let parent = this.getNode(dirPath);
    if (!parent) {
      this.createDir(dirPath, owner, owner);
      parent = this.getNode(dirPath);
    }

    if (!parent || parent.type !== 'dir') return false;
    if (!parent.children) parent.children = {};

    const permString = permissions.startsWith('-') ? permissions : `-rw-r--r--`;

    parent.children[fileName] = {
      type: 'file',
      name: fileName,
      permissions: permString,
      owner: owner,
      group: owner,
      size: content.length,
      updatedAt: new Date(),
      content: content
    };

    this.persist();
    return true;
  }

  public readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file' || node.content === undefined) return null;
    return node.content;
  }

  public deleteNode(path: string): boolean {
    const norm = this.normalizePath(path);
    if (norm === '/') return false;

    const lastSlash = norm.lastIndexOf('/');
    const dirPath = norm.substring(0, lastSlash) || '/';
    const name = norm.substring(lastSlash + 1);

    const parent = this.getNode(dirPath);
    if (!parent || !parent.children || !parent.children[name]) return false;

    delete parent.children[name];
    this.persist();
    return true;
  }

  public listDir(path: string): FileNode[] | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'dir' || !node.children) return null;

    return Object.values(node.children);
  }

  private persist(): void {
    if (typeof window !== 'undefined' && this.root && this.root.children) {
      WebOSPersistence.saveVFS(this.root.children);
    }
  }
}

export const vfs = new VirtualFileSystem();
