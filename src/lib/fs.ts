/*
Reason for existence: In-memory virtual Linux filesystem providing hierarchical file operations (/etc, /var/log, /proc, /home/silvestrike), path resolution, and read/write methods.
System impact if absent: Terminal bash commands and server file explorer have no filesystem to read, edit, or execute.
*/

import { FileNode } from '@/types';
import { WebOSPersistence } from '@/lib/persistence';
import { DEVELOPER_CONFIG } from '@/config';

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
      this.ensureEssentialFiles();
    } else {
      this.initializeDefaultHierarchy();
    }
  }

  public ensureEssentialFiles(): void {
    const homeNode = this.getNode('/home/silvestrike');
    if (!homeNode || !homeNode.children || Object.keys(homeNode.children).length === 0) {
      this.initializeDefaultHierarchy();
      return;
    }
    if (!this.getNode('/home/silvestrike/welcome.txt')) {
      this.initializeDefaultHierarchy();
    }
  }

  private initializeDefaultHierarchy(): void {
    const topDirs = ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'];
    for (const dir of topDirs) {
      this.createDir(`/${dir}`, 'root', 'root', 'drwxr-xr-x');
    }

    this.createDir('/home/silvestrike', 'silvestrike', 'silvestrike', 'drwxr-xr-x');
    this.createDir('/var/log', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/nginx', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/ssh', 'root', 'root', 'drwxr-xr-x');
    this.createDir('/etc/systemd', 'root', 'root', 'drwxr-xr-x');

    this.writeFile('/etc/hostname', 'srv-silvestrike\n', 'root', '644');

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
127.0.1.1 srv-silvestrike
192.168.1.100 srv-silvestrike.internal

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
        server_name srv-silvestrike.internal;
        
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

    this.writeFile('/home/silvestrike/welcome.txt',
      `============================================================
Welcome to SILVESTRIKE Portfolio OS (silvestrike.dev)
Environment: Next.js 16 + Tailwind CSS v4 + TypeScript
Default User: duong / root
============================================================

Quick Commands:
  help          - List all available terminal commands
  fastfetch      - Display server hardware and OS specifications
  about         - Display developer biography and dossiers
  skills        - View core languages, AI/ML models, and frameworks
  projects      - Inspect flagship production repositories
  monitor       - Open WebOS Activity & Visitor Analytics
  services      - View featured projects and microservices
  git     - Visual Git commit graph & diff studio
  network       - Inspect active network sockets and firewall
  odoo          - Launch Odoo ERP business sandbox

Enjoy exploring the interactive portfolio workstation!
`, 'duong', '644');

    this.writeFile('/home/silvestrike/profile.yml',
      `# profile.yml - Canonical developer configuration
developer:
  name: "${DEVELOPER_CONFIG.name}"
  alias: "${DEVELOPER_CONFIG.alias}"
  title: "${DEVELOPER_CONFIG.title}"
  location: "${DEVELOPER_CONFIG.location}"
  education:
    university: "${DEVELOPER_CONFIG.education.university.formal}"
    degree: "${DEVELOPER_CONFIG.education.degree.formal}"
    gpa: "${DEVELOPER_CONFIG.education.gpa}"
    ielts: "${DEVELOPER_CONFIG.education.ielts}"
    timeline: "${DEVELOPER_CONFIG.education.timelineFull}"
  engineering_philosophy:
${DEVELOPER_CONFIG.philosophy.map((item) => `    - "${item}"`).join('\n')}
`, 'duong', '644');

    this.writeFile('/home/silvestrike/skills.json',
      `{
  "languages": ["Python", "TypeScript", "JavaScript", "C#", "SQL", "HTML/CSS"],
  "ai_ml": ["PyTorch", "TensorFlow", "OpenCV", "MediaPipe", "YOLO", "LangGraph", "Whisper", "Kokoro"],
  "web": ["Next.js 15/16", "React 19", "Node.js", "Express", "ASP.NET Core", "Tailwind CSS v4"],
  "databases": ["PostgreSQL", "pgvector", "MongoDB", "SQL Server", "Redis", "Prisma ORM"],
  "devops_system": ["Linux (Arch/Ubuntu)", "Docker", "Git", "Nginx", "Systemd", "CI/CD"]
}
`, 'duong', '644');

    this.writeFile('/home/silvestrike/deploy.sh',
      `#!/bin/bash
set -e
echo "Starting deployment sequence for api-gateway..."
systemctl stop nginx
echo "Pulling latest docker container images..."
docker pull internal.registry/api-gateway:latest
echo "Restarting service..."
systemctl start nginx
echo "Deployment verified healthy."
`, 'duong', '755');

    this.writeFile('/home/silvestrike/README.md',
      `# ${DEVELOPER_CONFIG.name.toUpperCase()} (${DEVELOPER_CONFIG.alias})
${DEVELOPER_CONFIG.title}

## About Me
- Name: ${DEVELOPER_CONFIG.name}
- Location: ${DEVELOPER_CONFIG.location}
- Education: ${DEVELOPER_CONFIG.education.degree.full} @ ${DEVELOPER_CONFIG.education.university.short} (GPA: ${DEVELOPER_CONFIG.education.gpa} | IELTS: ${DEVELOPER_CONFIG.education.ielts.split(' ')[0]})
- Focus: Full-Stack Development • AI/ML Engineering
- Thesis: Veritas - AI-powered Vietnamese Land & Legal Document Digitization (RAG + LLM)

## Tech Stack
- Languages: Python, TypeScript, JavaScript, C#, PHP, SQL
- AI/ML: PyTorch, TensorFlow, OpenCV, MediaPipe, YOLO, LangGraph, LangChain, Whisper, Kokoro
- Web: Next.js 15/16, React 19, Node.js, Express, ASP.NET Core, .NET WinForms
- Databases & DevOps: PostgreSQL, MongoDB, SQL Server, Redis, Prisma, Docker, Linux, CI/CD

## Featured Projects
- samco-binhtan-webapp: EV Sales CMS & E-commerce (Next.js 14, Prisma, Node)
- DogDexx: AI Dog Species ID & Pet Health Records (PyTorch, Next.js, Cloudinary)
- Doru_AI: Linux Hyprland Desktop Voice Assistant (LangGraph, Silero, Whisper, Groq)
- WebBanTra & CafePOS: E-Commerce & Retail POS Suite (C#, ASP.NET, WinForms, SQL Server)
- HoverController: Hand gesture computer control with MediaPipe & OpenCV
- Toi_Uu_Gia: Price Elasticity Regression Deep Learning Model

## Contact
- Email: ${DEVELOPER_CONFIG.contact.email}
- Facebook: ${DEVELOPER_CONFIG.contact.facebookDisplay}
- GitHub: ${DEVELOPER_CONFIG.contact.github}
`, 'duong', '644');

    this.writeFile('/home/silvestrike/CV_VanTrongDuong.md',
      `# Curriculum Vitae — ${DEVELOPER_CONFIG.name} (${DEVELOPER_CONFIG.alias})
Contact: ${DEVELOPER_CONFIG.contact.email} | ${DEVELOPER_CONFIG.contact.github.replace('https://', '')}

## Professional Summary
Full-Stack Developer and AI/ML Engineer with strong foundation in Software Engineering and Distributed Systems.
Final-year student at ${DEVELOPER_CONFIG.education.university.formal}, IT Department.
GPA: ${DEVELOPER_CONFIG.education.gpa} | IELTS: ${DEVELOPER_CONFIG.education.ielts}

## Education
- ${DEVELOPER_CONFIG.education.degree.full}, ${DEVELOPER_CONFIG.education.university.short} (${DEVELOPER_CONFIG.education.timeline})
- Thesis: Veritas — AI-powered Vietnamese Land & Legal Document Digitization (RAG + Multimodal LLM)

## Core Technical Skills
- Languages: Python, TypeScript, JavaScript, C#, SQL, HTML/CSS
- AI & Deep Learning: PyTorch, TensorFlow, OpenCV, MediaPipe, YOLO, LangGraph, Whisper, Kokoro
- Web & Services: Next.js 15/16, React 19, Node.js, Express, ASP.NET Core, Tailwind CSS
- Databases & Infrastructure: PostgreSQL (pgvector), MongoDB, SQL Server, Redis, Docker, Linux, Git

## Featured Projects
- SAMCO Binh Tan: Full-stack vehicle inventory and customer quotation CMS (Next.js, Prisma, PostgreSQL)
- DogDexx: Canine breed visual recognition & health tracking platform (PyTorch ResNet, Next.js)
- Doru AI: Personal desktop AI voice assistant running on Linux Hyprland (LangGraph, Silero VAD, Groq)
- Veritas RAG: Document digitization pipeline for Vietnamese legal records
`, 'duong', '644');

    this.writeFile('/home/silvestrike/CV_VanTrongDuong.docx',
      `[Microsoft Word Binary Document: CV_VanTrongDuong.docx]
Click 'Download CV' to download the canonical styled resume.
`, 'duong', '644');
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
    const home = '/home/silvestrike';
    if (!targetPath || targetPath === '~') {
      return home;
    }
    if (targetPath.startsWith('~/')) {
      targetPath = home + '/' + targetPath.slice(2);
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

  public copyNode(srcPath: string, destPath: string): boolean {
    const srcNode = this.getNode(srcPath);
    if (!srcNode) return false;

    const normDest = this.normalizePath(destPath);
    const destNode = this.getNode(normDest);

    let finalDest = normDest;
    if (destNode && destNode.type === 'dir') {
      finalDest = this.normalizePath(normDest + '/' + srcNode.name);
    }

    if (srcNode.type === 'file') {
      return this.writeFile(
        finalDest,
        srcNode.content ?? '',
        srcNode.owner,
        srcNode.permissions
      );
    } else if (srcNode.type === 'dir') {
      this.createDir(finalDest, srcNode.owner, srcNode.group, srcNode.permissions);
      if (srcNode.children) {
        for (const childName of Object.keys(srcNode.children)) {
          this.copyNode(`${srcPath}/${childName}`, `${finalDest}/${childName}`);
        }
      }
      return true;
    }
    return false;
  }

  public moveNode(srcPath: string, destPath: string): boolean {
    const copied = this.copyNode(srcPath, destPath);
    if (copied) {
      return this.deleteNode(srcPath);
    }
    return false;
  }

  private persist(): void {
    if (typeof window !== 'undefined' && this.root && this.root.children) {
      WebOSPersistence.saveVFS(this.root.children);
    }
  }
}

export const vfs = new VirtualFileSystem();
