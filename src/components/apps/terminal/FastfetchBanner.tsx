/*
Reason for existence: Pure React component rendering dynamic Fastfetch/Neofetch system telemetry with real client GPU, CPU, RAM, and OS detection.
System impact if absent: Terminal cannot display graphical system specifications banner or will fall back to static raw HTML strings.
*/

'use client';

import React, { useState, useEffect } from 'react';

function IconSvg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 inline-block"
    >
      {children}
    </svg>
  );
}

const HardDrive = (_props?: { size?: number }) => (
  <IconSvg>
    <line x1="22" y1="12" x2="2" y2="12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    <line x1="6" y1="16" x2="6.01" y2="16" />
    <line x1="10" y1="16" x2="10.01" y2="16" />
  </IconSvg>
);

const Server = (_props?: { size?: number }) => (
  <IconSvg>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </IconSvg>
);

const ScrollText = (_props?: { size?: number }) => (
  <IconSvg>
    <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
    <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    <path d="M15 8h-5" />
    <path d="M15 12h-5" />
  </IconSvg>
);

const Clock = (_props?: { size?: number }) => (
  <IconSvg>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconSvg>
);

const Package = (_props?: { size?: number }) => (
  <IconSvg>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </IconSvg>
);

const TerminalIcon = (_props?: { size?: number }) => (
  <IconSvg>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" x2="20" y1="19" y2="19" />
  </IconSvg>
);

const LayoutGrid = (_props?: { size?: number }) => (
  <IconSvg>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </IconSvg>
);

const Cpu = (_props?: { size?: number }) => (
  <IconSvg>
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M15 2v2" />
    <path d="M15 20v2" />
    <path d="M2 15h2" />
    <path d="M2 9h2" />
    <path d="M20 15h2" />
    <path d="M20 9h2" />
    <path d="M9 2v2" />
    <path d="M9 20v2" />
  </IconSvg>
);

const Zap = (_props?: { size?: number }) => (
  <IconSvg>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconSvg>
);

const MemoryStick = (_props?: { size?: number }) => (
  <IconSvg>
    <path d="M6 19v-3" />
    <path d="M10 19v-3" />
    <path d="M14 19v-3" />
    <path d="M18 19v-3" />
    <rect width="18" height="12" x="3" y="4" rx="2" />
  </IconSvg>
);

const BadgeCheck = (_props?: { size?: number }) => (
  <IconSvg>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </IconSvg>
);

interface HardwareSpecs {
  os: string;
  host: string;
  kernel: string;
  uptime: string;
  packages: string;
  shell: string;
  wm: string;
  cpu: string;
  gpu: string;
  memory: string;
  status: string;
}

const BRAILLE_LOGO_LINES = ["⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣿⢿⡿⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⡻⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⢤⣖⣶⣿⣽⣟⣿⣻⣯⣷⣷⣶⣴⣠⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣾⣟⣿⣻⣟⣿⡾⣷⢿⣻⢽⠿⠽⠾⢷⢿⢯⣿⢿⣶⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢴⣿⡦⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⣾⢿⣯⣷⣿⣯⣿⠯⠟⠉⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⠽⠿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠓⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⢴⣯⣿⢿⣻⣯⣷⠿⠚⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⢿⣾⡿⣿⢯⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⢿⣻⣾⡿⣷⣿⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣠⣤⣤⣤⣤⣦⣶⣶⣶⣶⣶⣶⣶⣶⣶⣶⣴⣤⣄⡀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⡿⣿⣻⣯⣿⢿⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣤⣤⣴⣶⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡯", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣟⣿⣟⣯⣿⣾⢿⢗⠀⠀⠀⠀⠀⡀⣀⣤⣴⣴⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡿⢿⠿⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⣾⠻⠝⠙⠉⠈⢀⣀⣠⣤⣴⣶⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⠿⠿⠛⠛⠙⠉⠉⠈⠀⠀⠀⠀⠀⠀⠀⢹⣿⣿⣿⣿⣿⣿⣿⣿⠿⠋⠁⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠋⠈⣁⣀⣤⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠟⠛⠋⠉⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⠿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣶⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠋⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⣀⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⢀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠉⠙⠛⠻⠿⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠚⠷⠑⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⣾⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣤⣄⣀⡀⡀⠀⡀⢀⢀⣀⣠⣤⣶⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀", "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠛⠛⠟⠻⠛⠛⠛⠙⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"];

export function FastfetchBanner() {
  const [specs, setSpecs] = useState<HardwareSpecs>({
    os: 'Caelestia Hyprland Linux x86_64 [SILVESTRIKE WebOS]',
    host: 'VAN TRONG DUONG',
    kernel: 'Linux 6.8.0-silvestrike-c1',
    uptime: '22 years (Est. 2004)',
    packages: '143 (npm), 8 (sandboxes), 10 (microservices)',
    shell: 'bash 5.2.26 / zsh 5.9 (x86_64-pc-linux-gnu)',
    wm: 'Hyprland (Wayland compositor)',
    cpu: '13th Gen Intel Core i5-13420H (8 Cores, 12 Threads)',
    gpu: 'WebOS Accelerated GPU Engine',
    memory: '8.42 GiB / 16.00 GiB (52%)',
    status: 'Open for SWE / AI Roles'
  });

  useEffect(() => {
    let detectedGpu = 'WebOS Accelerated GPU Engine';
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') ||
        (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const rawRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (typeof rawRenderer === 'string' && rawRenderer.trim()) {
            const angleMatch = rawRenderer.match(/ANGLE \([^,]+,\s*([^,]+)/i);
            if (angleMatch && angleMatch[1]) {
              detectedGpu = angleMatch[1].replace(/\s*\([^)]*\)/g, '').trim();
            } else {
              detectedGpu = rawRenderer.replace(/Direct3D.*$/i, '').trim();
            }
          }
        }
      }
    } catch {
      // Keep default GPU
    }

    let detectedOs = 'Ubuntu 26.04.1 LTS x86_64 [SILVESTRIKE WebOS]';
    try {
      const ua = navigator.userAgent;
      if (ua.includes('Windows NT 10.0')) {
        detectedOs = 'Ubuntu 26.04.1 LTS [Client: Windows 11/10]';
      } else if (ua.includes('Macintosh')) {
        detectedOs = 'Ubuntu 26.04.1 LTS [Client: macOS Darwin]';
      } else if (ua.includes('Ubuntu')) {
        detectedOs = 'Ubuntu 26.04.1 LTS x86_64 [SILVESTRIKE Host]';
      } else if (ua.includes('Linux')) {
        detectedOs = 'Linux x86_64 [SILVESTRIKE Host]';
      }
    } catch {
      // Keep default OS
    }

    const clientCores = navigator.hardwareConcurrency || 12;
    const clientMemGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 16;

    fetch('/api/system')
      .then((res) => res.json())
      .then((sys) => {
        if (sys && typeof sys.cpuModel === 'string') {
          let cleanCpu = sys.cpuModel
            .replace(/\(R\)|\(TM\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const phys = sys.physicalCores || 8;
          const threads = sys.threadCount || sys.coreCount || 12;
          cleanCpu = `${cleanCpu} (${phys} Cores, ${threads} Threads)`;

          let memStr = `${(8.42).toFixed(2)} GiB / ${clientMemGb.toFixed(2)} GiB (52%)`;
          if (sys.ramTotal && sys.ramUsed) {
            const usedGiB = (sys.ramUsed / 1024).toFixed(2);
            const totalGiB = (sys.ramTotal / 1024).toFixed(2);
            const pct = Math.round((sys.ramUsed / sys.ramTotal) * 100);
            memStr = `${usedGiB} GiB / ${totalGiB} GiB (${pct}%)`;
          }

          const hostModel = sys.hostModel ? sys.hostModel : 'VAN TRONG DUONG';
          const kernel = sys.kernel ? `Linux ${sys.kernel}` : 'Linux 7.0.0-31-generic';
          const osName = sys.osName ?? detectedOs;
          const gpu = sys.gpuModel || detectedGpu;

          setSpecs((prev) => ({
            ...prev,
            os: osName,
            host: hostModel,
            kernel,
            gpu,
            cpu: cleanCpu,
            memory: memStr
          }));
        } else {
          setSpecs((prev) => ({
            ...prev,
            os: detectedOs,
            gpu: detectedGpu,
            cpu: `13th Gen Intel Core i5-13420H (8 Cores, ${clientCores} Threads)`,
            memory: `8.42 GiB / ${clientMemGb.toFixed(2)} GiB (52%)`
          }));
        }
      })
      .catch(() => {
        setSpecs((prev) => ({
          ...prev,
          os: detectedOs,
          gpu: detectedGpu,
          cpu: `13th Gen Intel Core i5-13420H (8 Cores, ${clientCores} Threads)`,
          memory: `8.42 GiB / ${clientMemGb.toFixed(2)} GiB (52%)`
        }));
      });
  }, []);

  const rows: { icon: React.ReactNode; label: string; value: string; bold?: boolean }[] = [
    { icon: <HardDrive size={12} />, label: 'OS', value: specs.os },
    { icon: <Server size={12} />, label: 'Host', value: specs.host },
    { icon: <ScrollText size={12} />, label: 'Kernel', value: specs.kernel },
    { icon: <Clock size={12} />, label: 'Uptime', value: specs.uptime },
    { icon: <Package size={12} />, label: 'Packages', value: specs.packages },
    { icon: <TerminalIcon size={12} />, label: 'Shell', value: specs.shell },
    { icon: <LayoutGrid size={12} />, label: 'WM', value: specs.wm },
    { icon: <Cpu size={12} />, label: 'CPU', value: specs.cpu },
    { icon: <Zap size={12} />, label: 'GPU', value: specs.gpu },
    { icon: <MemoryStick size={12} />, label: 'Memory', value: specs.memory },
    { icon: <BadgeCheck size={12} />, label: 'Status', value: specs.status, bold: true }
  ];

  return (
    <div className="my-2 p-3 sm:p-4 bg-[#0a0d14]/90 border border-white/10 rounded-lg font-mono text-xs select-none max-w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10 text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold tracking-wide">FASTFETCH v2.3.0</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-6 sm:gap-8 lg:gap-10 py-1">
        {/* Left: ASCII / Braille Logo */}
        <div className="shrink-0 flex flex-col items-start justify-center">
          <pre className="whitespace-pre font-mono select-none font-bold text-[6.5px] sm:text-[7.5px] md:text-[8px] leading-[1.08] tracking-tighter text-[#7aa2f7] text-left">
            {BRAILLE_LOGO_LINES.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </pre>
        </div>

        {/* Right: Box đóng khung sát chữ, chữ căn lề phải */}
        <div className="w-fit shrink-0">
          <div className="rounded-lg border border-white/20 bg-black/40 p-3 sm:p-3.5 shadow-xl w-fit">
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-6 sm:gap-x-8 gap-y-1.5 text-[11px] sm:text-xs">
              {rows.map((row) => (
                <React.Fragment key={row.label}>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7aa2f7] shrink-0 w-3.5 flex justify-center">{row.icon}</span>
                    <span className="text-[#7aa2f7] font-semibold whitespace-nowrap">{row.label}</span>
                  </div>
                  <div
                    className={`text-right whitespace-nowrap ${row.bold ? 'text-[#9ece6a] font-bold' : 'text-slate-200'
                      }`}
                  >
                    {row.value}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* ANSI Color Blocks - 1 Row */}
            <div className="pt-2.5 select-none border-t border-white/10 mt-2.5 flex items-center justify-start gap-1.5">
              <span className="w-4 h-2.5 rounded-xs bg-[#1e1e2e] border border-white/20" />
              <span className="w-4 h-2.5 rounded-xs bg-[#e06c75]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#98c379]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#e5c07b]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#61afef]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#c678dd]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#56b6c2]" />
              <span className="w-4 h-2.5 rounded-xs bg-[#abb2bf]" />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
