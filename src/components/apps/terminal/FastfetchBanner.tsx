/*
Reason for existence: Pure React component rendering dynamic Fastfetch/Neofetch system telemetry with real client GPU, CPU, RAM, and OS detection.
System impact if absent: Terminal cannot display graphical system specifications banner or will fall back to static raw HTML strings.
*/

'use client';

import React, { useState, useEffect } from 'react';

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

export function FastfetchBanner() {
  const [specs, setSpecs] = useState<HardwareSpecs>({
    os: 'Caelestia Hyprland Linux x86_64 [SILVESTRIKE WebOS]',
    host: 'Van Trong Duong \u2014 B.Eng in IT, HCMUTE',
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
    // 1. Detect Client GPU via WebGL unmasked renderer as backup
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

    // 2. Detect Client OS from User-Agent
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

    // 3. Fallback client concurrency and device memory
    const clientCores = navigator.hardwareConcurrency || 12;
    const clientMemGb = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 16;

    // 4. Fetch Real Host System Telemetry from /api/system
    fetch('/api/system')
      .then((res) => res.json())
      .then((sys) => {
        if (sys && typeof sys.cpuModel === 'string') {
          // Format real CPU model with physical cores & threads
          let cleanCpu = sys.cpuModel
            .replace(/\(R\)|\(TM\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const phys = sys.physicalCores || 8;
          const threads = sys.threadCount || sys.coreCount || 12;
          cleanCpu = `${cleanCpu} (${phys} Cores, ${threads} Threads)`;

          // Format real RAM usage
          let memStr = `${(8.42).toFixed(2)} GiB / ${clientMemGb.toFixed(2)} GiB (52%)`;
          if (sys.ramTotal && sys.ramUsed) {
            const usedGiB = (sys.ramUsed / 1024).toFixed(2);
            const totalGiB = (sys.ramTotal / 1024).toFixed(2);
            const pct = Math.round((sys.ramUsed / sys.ramTotal) * 100);
            memStr = `${usedGiB} GiB / ${totalGiB} GiB (${pct}%)`;
          }

          // Format Host Model
          const hostModel = sys.hostModel
            ? sys.hostModel
            : 'Van Trong Duong — B.Eng in IT, HCMUTE';

          // Format Kernel
          const kernel = sys.kernel ? `Linux ${sys.kernel}` : 'Linux 7.0.0-31-generic';

          // Format OS
          const osName = sys.osName ?? detectedOs;

          // Format GPU
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

  return (
    <div className="my-1.5 p-3 bg-[#0a0d14]/90 border border-white/10 rounded-lg font-mono text-xs select-none max-w-4xl overflow-x-auto">
      <div className="flex flex-row items-center gap-6">
        {/* Left: Caelestia ASCII Logo */}
        <pre className="whitespace-pre font-mono text-left select-none font-bold text-[8px] sm:text-[9.5px] leading-tight shrink-0">
          <span className="text-[#7aa2f7]">⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⡀⡀⡀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#7aa2f7]">⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⢴⣺⢽⠽⠝⠝⠙⠚⠳⠖⣤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#7aa2f7]">⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⡽⡽⡝⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#7aa2f7]">⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⢠⣞⡯⣯⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀</span><span className="text-[#c0caf5]">⣀⣀⣀⣤⣤⣤⣤⣴⣴⣶⣶⣦⣤⣄⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#7aa2f7]">⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢽⢮⠻⠪⠀</span><span className="text-[#c0caf5]">⣀⣀⣠⣤⣴⣶⣾⣿⣿⣿⠿⠿⠟⠟⠿⣿⣿⣿⣿⣿⠿⠋⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]">⠀⠀⠀⠀⠀⠀⠀⠀⠀⣊⣩⣤⣴⣶⣿⣿⣿⠿⠿⠛⠛⠉⠉⠁⠀⠀⠀⠀⠀⠀⠀⠠⠿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]"> ⠀⠀⠀⠀⢀⣠⣴⣾⣿⣿⣿⣿⣿⣿⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]"> ⠀⠀⠀⠲⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]"> ⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣾⠃⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]"> ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⢿⣿⣿⣿⣶⣤⣄⣀⣀⣀⣀⣤⣶⣾⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          <span className="text-[#c0caf5]"> ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠻⠿⣿⣿⣿⣿⣿⣿⠿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀</span>{'\n'}
          {'\n'}
          <span className="text-[#f38ba8] font-bold">            C a e l e s t i a</span>{'\n'}
          <span className="text-[#89b4fa]">                 v2.3.0</span>
        </pre>

        {/* Right: Fastfetch Specs */}
        <div className="space-y-0.5 text-[11px] leading-snug shrink-0 font-mono">
          <div className="font-bold">
            <span className="text-[#9ece6a]">duong</span>
            <span className="text-slate-400">@</span>
            <span className="text-[#7aa2f7]">srv-silvestrike</span>
          </div>
          <div className="text-slate-600 pb-0.5">---------------------------------</div>
          <div><span className="text-[#7aa2f7] font-semibold">OS:</span> {specs.os}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Host:</span> {specs.host}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Kernel:</span> {specs.kernel}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Uptime:</span> {specs.uptime}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Packages:</span> {specs.packages}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Shell:</span> {specs.shell}</div>
          <div><span className="text-[#7aa2f7] font-semibold">WM:</span> {specs.wm}</div>
          <div><span className="text-[#7aa2f7] font-semibold">CPU:</span> {specs.cpu}</div>
          <div><span className="text-[#7aa2f7] font-semibold">GPU:</span> {specs.gpu}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Memory:</span> {specs.memory}</div>
          <div><span className="text-[#7aa2f7] font-semibold">Status:</span> <span className="text-[#9ece6a] font-bold">{specs.status}</span></div>

          {/* Color Palettes ANSI blocks */}
          <div className="pt-2 select-none">
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-2.5 rounded-sm bg-[#1e1e2e] border border-white/20" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#e06c75]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#98c379]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#e5c07b]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#61afef]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#c678dd]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#56b6c2]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#abb2bf]" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-3.5 h-2.5 rounded-sm bg-[#5c6370]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#f38ba8]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#a6e3a1]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#f9e2af]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#89b4fa]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#cba6f7]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#94e2d5]" />
              <span className="w-3.5 h-2.5 rounded-sm bg-[#cdd6f4]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
