/*
Reason for existence: Modular command execution dispatcher for TerminalApp, providing authentic Linux/POSIX utilities (file management, system info, network diagnostics, git, node, python, docker, and developer shortcuts).
System impact if absent: Terminal cannot execute commands or TerminalApp component will exceed maintainability limits.
*/

import { vfs } from '@/lib/fs';
import { AppId } from '@/types';

export interface CommandContext {
  currentDir: string;
  commandHistory: string[];
  onOpenApp?: (id: AppId) => void;
  onClearHistory?: () => void;
  onCloseSession?: () => void;
}

export interface CommandResult {
  outputHtml?: string;
  nextDir?: string;
  isFastfetch?: boolean;
  clearLines?: boolean;
  closeSession?: boolean;
}

export const ALL_TERMINAL_COMMANDS: string[] = [
  // System & Telemetry
  'fastfetch', 'uname', 'hostname', 'uptime', 'date', 'cal',
  'free', 'df', 'du', 'lscpu', 'lspci', 'lsusb', 'arch', 'env', 'printenv', 'dmesg',
  'whoami', 'id', 'groups',

  // Process Management
  'ps', 'top', 'htop', 'kill', 'monitor',

  // Filesystem Operations
  'pwd', 'cd', 'ls', 'cat', 'head', 'tail', 'more', 'less', 'grep',
  'wc', 'tree', 'find', 'stat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'chmod', 'chown',

  // Text & Streams
  'echo', 'base64', 'diff', 'sort', 'uniq', 'which', 'whereis',

  // Networking
  'ping', 'curl', 'wget', 'ifconfig', 'ip', 'netstat', 'ss', 'nslookup', 'dig', 'traceroute',

  // Developer & Tooling
  'git', 'node', 'npm', 'pnpm', 'bun', 'yarn', 'python', 'python3', 'pip',
  'docker', 'cargo', 'rustc', 'code',

  // Shell Builtins & Editors
  'help', 'clear', 'cls', 'reset', 'history', 'alias', 'export', 'source',
  'nano', 'vim', 'vi', 'sudo', 'exit', 'logout', 'reboot', 'shutdown',
  'boot', 'intro', 'edex',

  // Classic Fun
  'cowsay', 'fortune', 'sl', 'cmatrix',

  // Portfolio Navigation Shortcuts
  'about', 'profile', 'bio', 'skills', 'projects', 'contact', 'services',
  'portfolio', 'git', 'network', 'files', 'spotify', 'odoo', 'traffic'
];

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function executeTerminalCommand(
  rawCmd: string,
  ctx: CommandContext
): CommandResult {
  const trimmed = rawCmd.trim();
  if (!trimmed) {
    return {};
  }

  // Handle echo redirection simulation: echo "hello" > file.txt or >> file.txt
  const redirectMatch = trimmed.match(/^echo\s+(.+?)\s*(>>|>)\s*(\S+)$/);
  if (redirectMatch) {
    const rawContent = redirectMatch[1].replace(/^["']|["']$/g, '');
    const isAppend = redirectMatch[2] === '>>';
    const filename = redirectMatch[3];
    const targetPath = vfs.resolvePath(ctx.currentDir, filename);

    let contentToWrite = rawContent + '\n';
    if (isAppend) {
      const existing = vfs.readFile(targetPath);
      if (existing !== null) {
        contentToWrite = existing + contentToWrite;
      }
    }
    vfs.writeFile(targetPath, contentToWrite, 'duong', '644');
    return {};
  }

  // Handle echo pipe to base64: echo "text" | base64
  if (trimmed.includes('|')) {
    const parts = trimmed.split('|').map((p) => p.trim());
    if (parts[0].startsWith('echo ') && parts[1]?.startsWith('base64')) {
      const textToEncode = parts[0].slice(5).replace(/^["']|["']$/g, '');
      const isDecode = parts[1].includes('-d') || parts[1].includes('--decode');
      if (isDecode) {
        try {
          const decoded = atob(textToEncode);
          return { outputHtml: escapeHtml(decoded) };
        } catch {
          return { outputHtml: '<span style="color: #f43f5e;">base64: invalid input</span>' };
        }
      }
      return { outputHtml: escapeHtml(btoa(textToEncode)) };
    }
  }

  const tokens = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  const cmd = tokens[0]?.toLowerCase() || '';
  const args = tokens.slice(1).map((arg) => arg.replace(/^['"]|['"]$/g, ''));

  switch (cmd) {
    // ----------------------------------------------------
    // Help & Manual
    // ----------------------------------------------------
    case 'help':
      return {
        outputHtml: `
<div class="space-y-2 font-mono text-xs">
  <div class="text-[#7aa2f7] font-bold">SILVESTRIKE PORTFOLIO OS - COMMAND MANUAL:</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] pt-1 border-t border-white/10">
    <div><span class="text-[#7aa2f7] font-bold">fastfetch</span> : Architecture & host hardware telemetry</div>
    <div><span class="text-[#7aa2f7] font-bold">about / profile / bio</span> : Developer credentials & education</div>
    <div><span class="text-[#7aa2f7] font-bold">skills / projects</span> : Tooling matrix & production repos</div>
    <div><span class="text-[#7aa2f7] font-bold">contact / hire</span> : Email, GitHub, CV download</div>
    <div><span class="text-[#7aa2f7] font-bold">ls / cat / cd / pwd</span> : VFS filesystem exploration</div>
    <div><span class="text-[#7aa2f7] font-bold">head / tail / grep / tree</span> : Text stream & directory hierarchy</div>
    <div><span class="text-[#7aa2f7] font-bold">mkdir / touch / rm / cp / mv</span> : VFS file manipulation</div>
    <div><span class="text-[#7aa2f7] font-bold">uname / lscpu / free / df</span> : Kernel, CPU topology, RAM & disks</div>
    <div><span class="text-[#7aa2f7] font-bold">ps / top / htop / kill</span> : WebOS task manager & process tree</div>
    <div><span class="text-[#7aa2f7] font-bold">ping / curl / ifconfig / ss</span> : Sockets, IP interfaces & endpoints</div>
    <div><span class="text-[#7aa2f7] font-bold">git / node / python / docker</span> : Developer tooling environments</div>
    <div><span class="text-[#7aa2f7] font-bold">clear / history / whoami / env</span> : Shell state & execution history</div>
  </div>
  <div class="text-[10px] text-slate-400 pt-1 border-t border-white/5">
    Tips: Use [Tab] for command auto-completion and [&uarr;/&darr;] for bash history navigation.
  </div>
</div>
`
      };

    // ----------------------------------------------------
    // Session & Screen Control
    // ----------------------------------------------------
    case 'clear':
    case 'cls':
    case 'reset':
      return { clearLines: true };

    case 'exit':
    case 'logout':
      if (ctx.onCloseSession) {
        ctx.onCloseSession();
        return {};
      }
      return { outputHtml: '[Session terminated. Type clear or use new tab to restart.]' };

    case 'reboot':
    case 'shutdown':
    case 'poweroff':
      return {
        outputHtml: `<div class="text-amber-400 font-mono text-xs">
Broadcast message from root@srv-silvestrike (pts/0):
The system is going down for maintenance NOW!
(Session simulated reload in 2 seconds...)
</div>`
      };

    case 'boot':
    case 'intro':
    case 'edex':
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('replay_boot_sequence'));
        }, 50);
      }
      return {
        outputHtml: `
<div class="font-mono text-xs text-cyan-400">
  [ok] Initializing TRON / eDEX-UI cinematic boot sequence...
</div>
`
      };

    // ----------------------------------------------------
    // User & Identity
    // ----------------------------------------------------
    case 'whoami':
      return { outputHtml: 'duong' };

    case 'id':
      return {
        outputHtml: 'uid=1000(duong) gid=1000(duong) groups=1000(duong),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),122(lpadmin),134(lxd),998(docker)'
      };

    case 'groups':
      return { outputHtml: 'duong adm cdrom sudo dip plugdev lpadmin lxd docker' };

    case 'hostname':
      return { outputHtml: 'srv-silvestrike' };

    // ----------------------------------------------------
    // System & Hardware Telemetry
    // ----------------------------------------------------
    case 'uname': {
      if (args.includes('-a')) {
        return {
          outputHtml: 'Linux srv-silvestrike 7.0.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux'
        };
      }
      if (args.includes('-r')) return { outputHtml: '7.0.0-31-generic' };
      if (args.includes('-m')) return { outputHtml: 'x86_64' };
      if (args.includes('-n')) return { outputHtml: 'srv-silvestrike' };
      return { outputHtml: 'Linux' };
    }

    case 'arch':
      return { outputHtml: 'x86_64' };

    case 'date':
      return { outputHtml: new Date().toString() };

    case 'cal': {
      const now = new Date();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const m = now.getMonth();
      const y = now.getFullYear();
      const header = `   ${monthNames[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`;
      const firstDay = new Date(y, m, 1).getDay();
      const totalDays = new Date(y, m + 1, 0).getDate();

      let grid = '   '.repeat(firstDay);
      for (let day = 1; day <= totalDays; day++) {
        const isToday = day === now.getDate();
        const dStr = String(day).padStart(2, ' ');
        if (isToday) {
          grid += `<span style="background-color: #7aa2f7; color: #080a0f; font-weight: bold; border-radius: 2px;">${dStr}</span> `;
        } else {
          grid += `${dStr} `;
        }
        if ((firstDay + day) % 7 === 0) {
          grid += '\n';
        }
      }
      return { outputHtml: `<pre class="font-mono text-xs leading-tight">${header}${grid}</pre>` };
    }

    case 'uptime':
      return {
        outputHtml: '03:26:15 up 24 days, 14:12,  1 user,  load average: 0.14, 0.12, 0.09'
      };

    case 'free': {
      const isHuman = args.includes('-h') || args.length === 0;
      if (isHuman) {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
               total        used        free      shared  buff/cache   available
Mem:           15.3G        8.4G        3.8G        412M        3.1G        6.5G
Swap:          11.3G        3.9G        7.4G
</pre>
`
        };
      }
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
               total        used        free      shared  buff/cache   available
Mem:        16056320     8824100     3984520      421888     3247700     6810332
Swap:       11830272     4120576     7709696
</pre>
`
      };
    }

    case 'df':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p2  476G  182G  270G  41% /
/dev/nvme0n1p1  512M   32M  480M   7% /boot/efi
tmpfs           1.6G  2.4M  1.6G   1% /run
/dev/sda1       1.8T  820G  980G  46% /mnt/storage
overlay         476G  182G  270G  41% /var/lib/docker/overlay2
</pre>
`
      };

    case 'du': {
      const target = args.find((a) => !a.startsWith('-')) || ctx.currentDir;
      const resolved = vfs.resolvePath(ctx.currentDir, target);
      return {
        outputHtml: `4.2M\t${escapeHtml(resolved)}`
      };
    }

    case 'lscpu':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Architecture:                    x86_64
  CPU op-mode(s):                32-bit, 64-bit
  Address sizes:                 39 bits physical, 48 bits virtual
  Byte Order:                    Little Endian
CPU(s):                          12
  On-line CPU(s) list:           0-11
Vendor ID:                       GenuineIntel
  Model name:                    13th Gen Intel(R) Core(TM) i5-13420H
    Thread(s) per core:          2
    Core(s) per socket:          8 (4 Performance + 4 Efficient)
    Socket(s):                   1
    CPU max MHz:                 4600.0000
    CPU min MHz:                 400.0000
Caches (sum of all):             
  L1d:                           320 KiB (8 instances)
  L1i:                           384 KiB (8 instances)
  L2:                            7 MiB (5 instances)
  L3:                            12 MiB (1 instance)
Virtualization:                  VT-x
</pre>
`
      };

    case 'lspci':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
00:00.0 Host bridge: Intel Corporation Raptor Lake-P Host Bridge/DRAM Registers (rev 04)
00:02.0 VGA compatible controller: Intel Corporation Raptor Lake-P [UHD Graphics] (rev 04)
00:14.0 USB controller: Intel Corporation Raptor Lake-P USB 3.2 Gen 2x1 (xHCI) Controller (rev 11)
00:1f.3 Audio device: Intel Corporation Raptor Lake-P HD Audio Controller (rev 11)
01:00.0 3D controller: NVIDIA Corporation AD106 [GeForce RTX Cloud Studio / Accelerator] (rev a1)
02:00.0 Ethernet controller: Realtek Semiconductor Co., Ltd. RTL8111/8168/8411 PCI Express Gigabit Ethernet (rev 15)
03:00.0 Network controller: Intel Corporation Wi-Fi 6 AX201 (rev 20)
</pre>
`
      };

    case 'lsusb':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 001 Device 002: ID 0408:5426 Integrated HD Webcam
Bus 001 Device 003: ID 8087:0026 Intel Corp. AX201 Bluetooth
Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
</pre>
`
      };

    case 'env':
    case 'printenv':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
SHELL=/bin/bash
USER=duong
HOME=/home/silvestrike
TERM=xterm-256color
LANG=en_US.UTF-8
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/silvestrike/.local/bin
PWD=${escapeHtml(ctx.currentDir)}
DESKTOP_SESSION=hyprland
XDG_CURRENT_DESKTOP=Hyprland
WAYLAND_DISPLAY=wayland-1
EDITOR=nano
PAGER=cat
DEBIAN_FRONTEND=noninteractive
</pre>
`
      };

    case 'dmesg':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight text-slate-300">
[    0.000000] Linux version 7.0.0-31-generic (buildd@lcy02-amd64) (gcc-13) #31-Ubuntu SMP PREEMPT_DYNAMIC
[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-7.0.0-31-generic root=/dev/nvme0n1p2 ro quiet splash
[    0.245102] smpboot: CPU0: 13th Gen Intel(R) Core(TM) i5-13420H (family: 0x6, model: 0xba, stepping: 0x2)
[    0.512030] ACPI: Core revision 20240322
[    1.102341] nvidia: loading out-of-tree module taints kernel.
[    1.102349] nvidia 0000:01:00.0: enabling device (0000 -> 0002)
[    1.140221] NVRM: loading NVIDIA UNIX x86_64 Kernel Module  595.91.07
[    2.240112] systemd[1]: Reached target Graphical Interface.
</pre>
`
      };

    // ----------------------------------------------------
    // Process Management
    // ----------------------------------------------------
    case 'ps': {
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
duong        1  0.0  0.1  22540  4120 ?        Ss   08:00   0:01 /sbin/init
duong      101  1.2  1.4  48200 18400 pts/0    Ss+  08:05   0:14 terminal.app (BASH Shell &amp; Dossier)
duong      102  0.8  1.1  36400 14200 ?        S    08:05   0:08 monitor.app (Activity &amp; Telemetry)
duong      103  0.5  1.2  42100 16000 ?        S    08:06   0:05 services.app (Microservices Catalog)
duong      104  0.9  1.5  54000 22000 ?        S    08:08   0:03 git.app (Visual Git VCS Studio)
duong      105  0.3  0.8  28000 10000 ?        S    08:10   0:02 network.app (Sockets Inspector)
duong      106  0.2  0.6  22000  8000 ?        S    08:12   0:18 vfs-worker (VFS Sync Daemon)
duong      204  2.4  4.2 384000 68200 ?        Sl   08:00   1:24 node /srv/silvestrike/server.js
</pre>
`
      };
    }

    case 'top':
    case 'htop':
    case 'monitor':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-monitor');
        return { outputHtml: '[ok] Opening WebOS Activity & Visitor Analytics...' };
      }
      return {
        outputHtml: `
<div class="space-y-1 font-mono text-xs">
  <div class="text-[#7aa2f7] font-bold">top - 03:26:20 up 24 days, 1 user, load average: 0.14, 0.12, 0.09</div>
  <div>Tasks: <span class="text-emerald-400">8 total</span>, 1 running, 7 sleeping, 0 stopped</div>
  <div>%Cpu(s): <span class="text-[#7aa2f7]">4.8 us</span>, <span class="text-amber-400">1.2 sy</span>, 0.0 ni, 93.8 id, 0.2 wa</div>
  <div>MiB Mem : <span class="text-[#7aa2f7]">15340.0 total</span>, 3840.2 free, 8420.4 used, 3079.4 buff/cache</div>
  <div class="text-[10px] text-slate-400 pt-1">Run 'monitor' or launch Activity Monitor from the dock for live graphs.</div>
</div>
`
      };

    case 'kill': {
      const pid = args.find((a) => !a.startsWith('-'));
      if (!pid) return { outputHtml: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...' };
      return { outputHtml: `[ok] Process ${escapeHtml(pid)} received SIGTERM.` };
    }

    // ----------------------------------------------------
    // Filesystem Operations (VFS)
    // ----------------------------------------------------
    case 'pwd':
      return { outputHtml: escapeHtml(ctx.currentDir) };

    case 'cd': {
      const target = args[0] || '~';
      const resolved = vfs.resolvePath(ctx.currentDir, target);
      const node = vfs.getNode(resolved);
      if (!node) {
        return {
          outputHtml: `<span style="color: #f43f5e;">bash: cd: ${escapeHtml(target)}: No such file or directory</span>`
        };
      }
      if (node.type !== 'dir') {
        return {
          outputHtml: `<span style="color: #f43f5e;">bash: cd: ${escapeHtml(target)}: Not a directory</span>`
        };
      }
      return { nextDir: resolved };
    }

    case 'ls': {
      let target = ctx.currentDir;
      let isLong = false;
      let showAll = false;

      for (const a of args) {
        if (a.startsWith('-')) {
          if (a.includes('l')) isLong = true;
          if (a.includes('a')) showAll = true;
        } else {
          target = vfs.resolvePath(ctx.currentDir, a);
        }
      }

      const items = vfs.listDir(target);
      if (!items) {
        return {
          outputHtml: `<span style="color: #f43f5e;">ls: cannot access '${escapeHtml(target)}': No such file or directory</span>`
        };
      }

      const filtered = showAll ? items : items.filter((item) => !item.name.startsWith('.'));

      if (isLong) {
        let out = `total ${filtered.length * 4}\n`;
        for (const item of filtered) {
          const isDir = item.type === 'dir';
          const col = isDir ? '#7aa2f7' : '#e2e8f0';
          const size = item.size ? String(item.size).padStart(6, ' ') : '  4096';
          out += `${item.permissions} 1 ${item.owner} ${item.group} ${size} Sep 26 03:00 <span style="color: ${col}; font-weight: ${isDir ? 'bold' : 'normal'
            }">${escapeHtml(item.name)}${isDir ? '/' : ''}</span>\n`;
        }
        return { outputHtml: `<pre class="font-mono text-xs leading-tight">${out}</pre>` };
      }

      return {
        outputHtml: filtered
          .map((item) => {
            const col = item.type === 'dir' ? '#7aa2f7' : '#e2e8f0';
            const suffix = item.type === 'dir' ? '/' : '';
            return `<span style="color: ${col}; font-weight: ${item.type === 'dir' ? 'bold' : 'normal'
              }">${escapeHtml(item.name)}${suffix}</span>`;
          })
          .join('   ')
      };
    }

    case 'cat':
    case 'more':
    case 'less': {
      if (!args[0]) return { outputHtml: `${cmd}: missing file operand` };
      const resolved = vfs.resolvePath(ctx.currentDir, args[0]);
      const content = vfs.readFile(resolved);
      if (content === null) {
        const node = vfs.getNode(resolved);
        if (node && node.type === 'dir') {
          return { outputHtml: `<span style="color: #f43f5e;">${cmd}: ${escapeHtml(args[0])}: Is a directory</span>` };
        }
        return {
          outputHtml: `<span style="color: #f43f5e;">${cmd}: ${escapeHtml(args[0])}: No such file or directory</span>`
        };
      }
      return { outputHtml: `<pre class="font-mono text-xs whitespace-pre-wrap">${escapeHtml(content)}</pre>` };
    }

    case 'head': {
      let count = 10;
      let fileIdx = 0;
      if (args[0] === '-n' && args[1]) {
        count = parseInt(args[1], 10) || 10;
        fileIdx = 2;
      }
      const filename = args[fileIdx];
      if (!filename) return { outputHtml: 'head: missing file operand' };
      const resolved = vfs.resolvePath(ctx.currentDir, filename);
      const content = vfs.readFile(resolved);
      if (content === null) return { outputHtml: `<span style="color: #f43f5e;">head: cannot open '${escapeHtml(filename)}'</span>` };
      const lines = content.split('\n').slice(0, count).join('\n');
      return { outputHtml: `<pre class="font-mono text-xs whitespace-pre-wrap">${escapeHtml(lines)}</pre>` };
    }

    case 'tail': {
      let count = 10;
      let fileIdx = 0;
      if (args[0] === '-n' && args[1]) {
        count = parseInt(args[1], 10) || 10;
        fileIdx = 2;
      }
      const filename = args[fileIdx];
      if (!filename) return { outputHtml: 'tail: missing file operand' };
      const resolved = vfs.resolvePath(ctx.currentDir, filename);
      const content = vfs.readFile(resolved);
      if (content === null) return { outputHtml: `<span style="color: #f43f5e;">tail: cannot open '${escapeHtml(filename)}'</span>` };
      const lines = content.split('\n').slice(-count).join('\n');
      return { outputHtml: `<pre class="font-mono text-xs whitespace-pre-wrap">${escapeHtml(lines)}</pre>` };
    }

    case 'grep': {
      if (args.length < 2) return { outputHtml: 'usage: grep [pattern] [file]' };
      const pattern = args[0];
      const filename = args[1];
      const resolved = vfs.resolvePath(ctx.currentDir, filename);
      const content = vfs.readFile(resolved);
      if (content === null) return { outputHtml: `grep: ${escapeHtml(filename)}: No such file` };
      const matches = content
        .split('\n')
        .filter((l) => l.toLowerCase().includes(pattern.toLowerCase()));
      if (matches.length === 0) return {};
      return {
        outputHtml: matches
          .map((m) => escapeHtml(m).replace(new RegExp(pattern, 'gi'), (match) => `<span style="color: #f38ba8; font-weight: bold;">${match}</span>`))
          .join('\n')
      };
    }

    case 'wc': {
      const filename = args.find((a) => !a.startsWith('-'));
      if (!filename) return { outputHtml: 'wc: missing file operand' };
      const resolved = vfs.resolvePath(ctx.currentDir, filename);
      const content = vfs.readFile(resolved);
      if (content === null) return { outputHtml: `wc: ${escapeHtml(filename)}: No such file` };
      const lineCount = content.split('\n').length;
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      const byteCount = content.length;
      return { outputHtml: `${lineCount}  ${wordCount}  ${byteCount} ${escapeHtml(filename)}` };
    }

    case 'tree': {
      const target = args[0] || ctx.currentDir;
      const resolved = vfs.resolvePath(ctx.currentDir, target);

      function buildTree(path: string, depth = 0): string {
        if (depth > 3) return '';
        const items = vfs.listDir(path);
        if (!items) return '';
        let treeStr = '';
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const isLast = i === items.length - 1;
          const prefix = isLast ? '└── ' : '├── ';
          const indent = '    '.repeat(depth);
          const isDir = item.type === 'dir';
          const col = isDir ? '#7aa2f7' : '#e2e8f0';
          treeStr += `${indent}${prefix}<span style="color: ${col}; font-weight: ${isDir ? 'bold' : 'normal'}">${escapeHtml(item.name)}${isDir ? '/' : ''}</span>\n`;
          if (isDir) {
            treeStr += buildTree(`${path}/${item.name}`, depth + 1);
          }
        }
        return treeStr;
      }

      return {
        outputHtml: `<pre class="font-mono text-xs leading-tight">${escapeHtml(resolved)}\n${buildTree(resolved)}</pre>`
      };
    }

    case 'find': {
      const searchRoot = args[0]?.startsWith('-') ? ctx.currentDir : args[0] || ctx.currentDir;
      const nameIndex = args.indexOf('-name');
      const pattern = nameIndex !== -1 && args[nameIndex + 1] ? args[nameIndex + 1].replace(/[*"]/g, '') : '';
      const resolved = vfs.resolvePath(ctx.currentDir, searchRoot);

      const results: string[] = [];
      function scan(p: string) {
        const items = vfs.listDir(p);
        if (!items) return;
        for (const item of items) {
          const subPath = p === '/' ? `/${item.name}` : `${p}/${item.name}`;
          if (!pattern || item.name.includes(pattern)) {
            results.push(subPath);
          }
          if (item.type === 'dir' && results.length < 50) {
            scan(subPath);
          }
        }
      }
      scan(resolved);
      return { outputHtml: results.map((r) => escapeHtml(r)).join('\n') || '<span style="color: #64748b;">(No matches found)</span>' };
    }

    case 'stat': {
      if (!args[0]) return { outputHtml: 'stat: missing operand' };
      const resolved = vfs.resolvePath(ctx.currentDir, args[0]);
      const node = vfs.getNode(resolved);
      if (!node) return { outputHtml: `stat: cannot statx '${escapeHtml(args[0])}': No such file or directory` };
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
  File: ${escapeHtml(args[0])}
  Size: ${node.size || 4096}       Blocks: 8          IO Block: 4096   ${node.type === 'dir' ? 'directory' : 'regular file'}
Device: nvme0n1p2     Inode: 48912903    Links: 1
Access: (${node.permissions})  Uid: ( 1000/   ${node.owner})   Gid: ( 1000/   ${node.group})
Modify: ${node.updatedAt.toISOString()}
</pre>
`
      };
    }

    case 'mkdir': {
      const t = args.find((a) => !a.startsWith('-'));
      if (!t) return { outputHtml: 'mkdir: missing operand' };
      vfs.createDir(vfs.resolvePath(ctx.currentDir, t), 'duong', 'duong');
      return {};
    }

    case 'touch': {
      if (!args[0]) return { outputHtml: 'touch: missing file operand' };
      vfs.writeFile(vfs.resolvePath(ctx.currentDir, args[0]), '', 'duong', '644');
      return {};
    }

    case 'rm': {
      const t = args.find((a) => !a.startsWith('-'));
      if (!t) return { outputHtml: 'rm: missing operand' };
      const ok = vfs.deleteNode(vfs.resolvePath(ctx.currentDir, t));
      if (!ok) {
        return {
          outputHtml: `<span style="color: #f43f5e;">rm: cannot remove '${escapeHtml(t)}': No such file or directory</span>`
        };
      }
      return {};
    }

    case 'cp': {
      if (args.length < 2) return { outputHtml: 'cp: missing file operand' };
      const ok = vfs.copyNode(vfs.resolvePath(ctx.currentDir, args[0]), vfs.resolvePath(ctx.currentDir, args[1]));
      if (!ok) return { outputHtml: `<span style="color: #f43f5e;">cp: cannot copy '${escapeHtml(args[0])}'</span>` };
      return {};
    }

    case 'mv': {
      if (args.length < 2) return { outputHtml: 'mv: missing file operand' };
      const ok = vfs.moveNode(vfs.resolvePath(ctx.currentDir, args[0]), vfs.resolvePath(ctx.currentDir, args[1]));
      if (!ok) return { outputHtml: `<span style="color: #f43f5e;">mv: cannot move '${escapeHtml(args[0])}'</span>` };
      return {};
    }

    case 'chmod':
    case 'chown':
      return { outputHtml: '' };

    // ----------------------------------------------------
    // Text Processing & Utilities
    // ----------------------------------------------------
    case 'echo': {
      let text = args.join(' ');
      text = text.replace(/\$USER/g, 'duong');
      text = text.replace(/\$HOME/g, '/home/silvestrike');
      text = text.replace(/\$SHELL/g, '/bin/bash');
      text = text.replace(/\$PWD/g, ctx.currentDir);
      return { outputHtml: escapeHtml(text) };
    }

    case 'base64': {
      const isDecode = args.includes('-d') || args.includes('--decode');
      const val = args.find((a) => !a.startsWith('-'));
      if (!val) return { outputHtml: 'base64: missing input string' };
      try {
        if (isDecode) {
          return { outputHtml: escapeHtml(atob(val)) };
        }
        return { outputHtml: escapeHtml(btoa(val)) };
      } catch {
        return { outputHtml: '<span style="color: #f43f5e;">base64: error processing string</span>' };
      }
    }

    case 'diff': {
      if (args.length < 2) return { outputHtml: 'diff: missing operand' };
      const f1 = vfs.readFile(vfs.resolvePath(ctx.currentDir, args[0]));
      const f2 = vfs.readFile(vfs.resolvePath(ctx.currentDir, args[1]));
      if (f1 === null || f2 === null) return { outputHtml: 'diff: cannot access files' };
      if (f1 === f2) return {};
      return {
        outputHtml: `
<pre class="font-mono text-xs">
--- ${escapeHtml(args[0])}
+++ ${escapeHtml(args[1])}
@@ -1,2 +1,2 @@
-${escapeHtml(f1.slice(0, 100))}
+${escapeHtml(f2.slice(0, 100))}
</pre>
`
      };
    }

    case 'sort': {
      const filename = args[0];
      if (!filename) return { outputHtml: 'sort: missing file operand' };
      const content = vfs.readFile(vfs.resolvePath(ctx.currentDir, filename));
      if (content === null) return { outputHtml: `sort: ${escapeHtml(filename)}: No such file` };
      const sorted = content.split('\n').sort().join('\n');
      return { outputHtml: `<pre class="font-mono text-xs whitespace-pre-wrap">${escapeHtml(sorted)}</pre>` };
    }

    case 'uniq': {
      const filename = args[0];
      if (!filename) return { outputHtml: 'uniq: missing file operand' };
      const content = vfs.readFile(vfs.resolvePath(ctx.currentDir, filename));
      if (content === null) return { outputHtml: `uniq: ${escapeHtml(filename)}: No such file` };
      const lines = content.split('\n');
      const unique = lines.filter((l, i) => i === 0 || l !== lines[i - 1]).join('\n');
      return { outputHtml: `<pre class="font-mono text-xs whitespace-pre-wrap">${escapeHtml(unique)}</pre>` };
    }

    case 'which':
    case 'whereis': {
      const target = args[0];
      if (!target) return {};
      const knownPaths: Record<string, string> = {
        bash: '/usr/bin/bash',
        sh: '/bin/sh',
        zsh: '/usr/bin/zsh',
        git: '/usr/bin/git',
        node: '/usr/local/bin/node',
        npm: '/usr/local/bin/npm',
        pnpm: '/usr/local/bin/pnpm',
        bun: '/home/silvestrike/.bun/bin/bun',
        python: '/usr/bin/python3',
        python3: '/usr/bin/python3',
        pip: '/usr/bin/pip3',
        docker: '/usr/bin/docker',
        curl: '/usr/bin/curl',
        nano: '/usr/bin/nano',
        fastfetch: '/usr/bin/fastfetch',
        hyprland: '/usr/bin/Hyprland'
      };
      if (knownPaths[target]) {
        return { outputHtml: knownPaths[target] };
      }
      return { outputHtml: `/usr/bin/${escapeHtml(target)}` };
    }

    // ----------------------------------------------------
    // Networking & Connectivity
    // ----------------------------------------------------
    case 'ping': {
      const host = args.find((a) => !a.startsWith('-')) || 'google.com';
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
PING ${escapeHtml(host)} (142.250.204.46) 56(84) bytes of data.
64 bytes from hcm08s04-in-f14.1e100.net (142.250.204.46): icmp_seq=1 ttl=118 time=12.4 ms
64 bytes from hcm08s04-in-f14.1e100.net (142.250.204.46): icmp_seq=2 ttl=118 time=11.8 ms
64 bytes from hcm08s04-in-f14.1e100.net (142.250.204.46): icmp_seq=3 ttl=118 time=12.1 ms
64 bytes from hcm08s04-in-f14.1e100.net (142.250.204.46): icmp_seq=4 ttl=118 time=11.9 ms

--- ${escapeHtml(host)} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 11.821/12.052/12.410/0.224 ms
</pre>
`
      };
    }

    case 'curl':
    case 'wget': {
      const url = args.find((a) => !a.startsWith('-'));
      if (!url) return { outputHtml: `${cmd}: try '${cmd} --help' or '${cmd} URL'` };
      if (url.includes('api/system')) {
        return {
          outputHtml: `
<pre class="font-mono text-xs text-emerald-400">
HTTP/2 200 OK
content-type: application/json
{
  "hostname": "SILVES",
  "cpuModel": "13th Gen Intel Core i5-13420H",
  "physicalCores": 8,
  "threadCount": 12,
  "gpuModel": "WebOS Accelerated GPU Engine",
  "status": "online"
}
</pre>
`
        };
      }
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
HTTP/2 200 OK
server: cloudflare
date: ${new Date().toUTCString()}
content-type: text/html; charset=UTF-8
connection: keep-alive

[200 OK: Payload received from ${escapeHtml(url)}]
</pre>
`
      };
    }

    case 'ifconfig':
    case 'ip': {
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
wlan0: flags=4163&lt;UP,BROADCAST,RUNNING,MULTICAST&gt;  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a120:e9ff:fe4b:88b2  prefixlen 64  scopeid 0x20&lt;link&gt;
        ether 74:15:75:a4:2b:81  txqueuelen 1000  (Ethernet)
        RX packets 1482012  bytes 1820492102 (1.8 GB)
        TX packets 920412   bytes 412094201  (412.0 MB)

lo: flags=73&lt;UP,LOOPBACK,RUNNING&gt;  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10&lt;host&gt;
        loop  txqueuelen 1000  (Local Loopback)
</pre>
`
      };
    }

    case 'netstat':
    case 'ss':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN      204/next-server     
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      82/nginx: master    
tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN      112/postgres        
tcp        0      0 127.0.0.1:6379          0.0.0.0:*               LISTEN      115/redis-server    
tcp6       0      0 :::22                   :::*                    LISTEN      1/systemd           
</pre>
`
      };

    case 'nslookup':
    case 'dig': {
      const domain = args.find((a) => !a.startsWith('-')) || 'silvestrike.dev';
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Server:         1.1.1.1
Address:        1.1.1.1#53

Non-authoritative answer:
Name:   ${escapeHtml(domain)}
Address: 185.199.108.153
Address: 185.199.109.153
Address: 185.199.110.153
Address: 185.199.111.153
</pre>
`
      };
    }

    case 'traceroute': {
      const host = args.find((a) => !a.startsWith('-')) || 'google.com';
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
traceroute to ${escapeHtml(host)} (142.250.204.46), 30 hops max, 60 byte packets
 1  _gateway (192.168.1.1)  2.124 ms  1.821 ms  1.902 ms
 2  10.204.0.1 (10.204.0.1)  8.412 ms  7.912 ms  8.102 ms
 3  142.250.204.46 (142.250.204.46)  12.052 ms  11.821 ms  12.104 ms
</pre>
`
      };
    }

    // ----------------------------------------------------
    // Developer Tooling & Environments
    // ----------------------------------------------------
    case 'git': {
      const sub = args[0]?.toLowerCase();
      if (!sub || sub === 'help') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
usage: git [--version] [--help] [-C &lt;path&gt;] [-c &lt;name&gt;=&lt;value&gt;]
           &lt;command&gt; [&lt;args&gt;]

Available commands:
   status      Show the working tree status
   log         Show commit logs
   branch      List or manage branches
   remote -v   List remote repositories
   diff        Show changes between commits
   checkout    Switch branches
   commit      Record changes to repository
   help        Display this help message
</pre>
`
        };
      }
      if (sub === 'status') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
On branch <span class="text-[#7aa2f7] font-bold">main</span>
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
</pre>
`
        };
      }
      if (sub === 'log') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
<span class="text-amber-400 font-bold">commit 9fa4c81b2e8d47b</span> (HEAD -> <span class="text-[#7aa2f7]">main</span>, <span class="text-emerald-400">origin/main</span>)
Author: Van Trong Duong &lt;vtduong04@gmail.com&gt;
Date:   Sat Sep 26 03:00:00 2026 +0700

    feat(fastfetch): integrate real hardware telemetry (8 cores, 12 threads)

<span class="text-amber-400 font-bold">commit 5a1b3c9d7e2f4a0</span>
Author: Van Trong Duong &lt;vtduong04@gmail.com&gt;
Date:   Fri Sep 25 18:30:15 2026 +0700

    feat(dossier): add direct CV download and contact workstation
</pre>
`
        };
      }
      if (sub === 'branch') {
        return {
          outputHtml: `* <span class="text-emerald-400 font-bold">main</span>\n  feat/hyprland-ui`
        };
      }
      if (sub === 'remote') {
        return {
          outputHtml: `origin  https://github.com/SILVESTRIKE/portfolio.git (fetch)\norigin  https://github.com/SILVESTRIKE/portfolio.git (push)`
        };
      }
      return { outputHtml: `git: '${escapeHtml(sub)}' executed successfully.` };
    }

    case 'node': {
      if (args.includes('-v') || args.includes('--version') || args.length === 0) {
        return { outputHtml: 'v22.14.0' };
      }
      return { outputHtml: '[Node.js interactive REPL session - Type .exit to return]' };
    }

    case 'npm': {
      if (args.includes('-v') || args.includes('--version')) return { outputHtml: '10.9.2' };
      if (args[0] === 'list' || args[0] === 'ls') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
silvestrike-portfolio-os@0.1.0 /srv/silvestrike
├── next@16.0.0
├── react@19.0.0
├── react-dom@19.0.0
├── tailwindcss@4.0.0
├── lucide-react@0.470.0
└── typescript@5.7.3
</pre>
`
        };
      }
      return { outputHtml: `npm: command '${escapeHtml(args.join(' '))}' complete.` };
    }

    case 'pnpm':
      return { outputHtml: '9.15.0' };

    case 'bun':
      return { outputHtml: '1.2.4' };

    case 'yarn':
      return { outputHtml: '1.22.22' };

    case 'python':
    case 'python3': {
      if (args.includes('-v') || args.includes('--version') || args.includes('-V')) {
        return { outputHtml: 'Python 3.12.3' };
      }
      return { outputHtml: 'Python 3.12.3 (main, Sep 26 2026, 03:00:00) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.' };
    }

    case 'pip':
    case 'pip3':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
Package            Version
------------------ ---------
torch              2.5.1+cu124
torchvision        0.20.1+cu124
langgraph          0.2.70
opencv-python      4.11.0.86
transformers       4.48.2
numpy              2.2.2
</pre>
`
      };

    case 'docker': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'ps') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
CONTAINER ID   IMAGE                 COMMAND                  CREATED        STATUS        PORTS                    NAMES
8f912b3c4d5e   silvestrike/web:v2    "npm start"              24 hours ago   Up 24 hours   0.0.0.0:3000->3000/tcp   silvestrike-web
1a2b3c4d5e6f   pgvector/pgvector:16  "docker-entrypoint.s…"   24 hours ago   Up 24 hours   0.0.0.0:5432->5432/tcp   postgres-vector
3d4e5f6a7b8c   redis:7-alpine        "docker-entrypoint.s…"   24 hours ago   Up 24 hours   0.0.0.0:6379->6379/tcp   redis-cache
</pre>
`
        };
      }
      if (sub === 'images') {
        return {
          outputHtml: `
<pre class="font-mono text-xs leading-tight">
REPOSITORY            TAG       IMAGE ID       CREATED        SIZE
silvestrike/web       v2        e82938a192b1   24 hours ago   184MB
pgvector/pgvector     16        710294b281c9   2 weeks ago    420MB
redis                 7-alpine  410924b1092a   1 month ago    38MB
</pre>
`
        };
      }
      return { outputHtml: 'Docker version 27.3.1, build ce12230' };
    }

    case 'cargo':
    case 'rustc':
      return { outputHtml: 'rustc 1.84.0 (9fc6b4312 2025-01-07)' };

    case 'code':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-files');
        return { outputHtml: '[ok] Opening file editor workspace...' };
      }
      return { outputHtml: 'VS Code WebOS session initialized.' };

    // ----------------------------------------------------
    // Shell Builtins & Interactive Editors
    // ----------------------------------------------------
    case 'history': {
      if (args[0] === '-c') {
        if (ctx.onClearHistory) ctx.onClearHistory();
        return { outputHtml: '[ok] Command history cleared.' };
      }
      if (ctx.commandHistory.length === 0) {
        return { outputHtml: '<span style="color: #64748b;">(No recorded command history)</span>' };
      }
      return {
        outputHtml: ctx.commandHistory
          .map((h, i) => `${String(i + 1).padStart(4, ' ')}  ${escapeHtml(h)}`)
          .join('\n')
      };
    }

    case 'alias':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight">
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias gs='git status'
alias gp='git push'
alias dc='docker compose'
alias fastfetch='fastfetch'
alias cls='clear'
</pre>
`
      };

    case 'export':
      return { outputHtml: '[ok] Environment variable updated in current session.' };

    case 'source':
      return { outputHtml: '[ok] Shell configuration reloaded (~/.bashrc).' };

    case 'sudo': {
      const rest = args.join(' ');
      if (rest) {
        return { outputHtml: `[sudo] user duong elevated privileges granted. Executing: ${escapeHtml(rest)}` };
      }
      return { outputHtml: 'usage: sudo command' };
    }

    case 'nano':
    case 'vim':
    case 'vi': {
      const file = args[0] || 'scratch.txt';
      return {
        outputHtml: `<div class="p-2 bg-black/60 border border-white/10 rounded font-mono text-xs text-slate-300">
[GNU nano 7.2 - Editing ${escapeHtml(file)}]
(Press ^X to exit. You can also view this file with 'cat ${escapeHtml(file)}')
</div>`
      };
    }

    // ----------------------------------------------------
    // Classic Terminal Easter Eggs
    // ----------------------------------------------------
    case 'cowsay': {
      const text = args.join(' ') || 'Hello from SILVESTRIKE WebOS!';
      const len = text.length;
      const border = '-'.repeat(len + 2);
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight text-emerald-400">
 ${border}
&lt; ${escapeHtml(text)} &gt;
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</pre>
`
      };
    }

    case 'fortune': {
      const quotes = [
        'There are 10 types of people in the world: those who understand binary, and those who do not.',
        'Simplicity is prerequisite for reliability. - Edsger W. Dijkstra',
        'Programs must be written for people to read, and only incidentally for machines to execute. - Hal Abelson',
        'Premature optimization is the root of all evil. - Donald Knuth',
        'Clean Architecture & high test coverage turn complex systems into calm machinery.'
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      return { outputHtml: `"${escapeHtml(randomQuote)}"` };
    }

    case 'sl':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight text-amber-300">
      ====        ________                ___________
  _D _|  |_______/        \\__I_I_____===__|_________|
   |(_)---  |   HUIT 2026       |   |      | ;;; ;;; |
   /     |===========================|   |___________|
  |      |___________________________|   |___________|
  |________|_______________________|_______|_________|
   (O)(O)        (O)(O)(O)           (O)(O)     (O)(O)
</pre>
`
      };

    case 'cmatrix':
      return {
        outputHtml: `
<pre class="font-mono text-xs leading-tight text-emerald-400 select-none">
0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0
1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 1
0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1 0 1 1 0 1 0 0 1
[Wake up, Neo... The Matrix has you. Follow the white rabbit.]
</pre>
`
      };

    // ----------------------------------------------------
    // Portfolio Shortcuts
    // ----------------------------------------------------
    case 'fastfetch':
      return { isFastfetch: true };

    case 'whois':
    case 'about':
    case 'profile':
    case 'bio':
      return {
        outputHtml: `
<div class="p-3 bg-[#0d121f] border border-[#7aa2f7]/30 rounded-lg space-y-2 font-mono text-xs my-1">
  <div class="text-[#7aa2f7] font-bold text-sm">VAN TRONG DUONG (SILVESTRIKE)</div>
  <div class="text-slate-400">Full-Stack Developer | AI/ML Engineer | Aspiring Solutions Architect</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px]">
    <div><span class="text-[#7aa2f7]">Education:</span> B.Eng in IT @ HUIT</div>
    <div><span class="text-[#7aa2f7]">GPA:</span> 3.2 / 4.0 | <span class="text-[#7aa2f7]">IELTS:</span> 6.5 Academic</div>
    <div><span class="text-[#7aa2f7]">Timeline:</span> 2022 - 2026 (Final Year)</div>
    <div><span class="text-[#7aa2f7]">Location:</span> Ho Chi Minh City, Vietnam</div>
  </div>
  <div class="pt-2 border-t border-white/5 text-[11px] text-slate-300">
    <div class="text-amber-300 font-bold mb-1">Engineering Philosophy:</div>
    <div>* Clean Architecture &amp; strictly decoupled services over ad-hoc scripts</div>
    <div>* High test coverage with clear bounded contexts and validation schemas</div>
    <div>* Bridging deep learning models with high-throughput production infrastructure</div>
  </div>
</div>
`
      };

    case 'skills':
      return {
        outputHtml: `
<div class="p-3 bg-[#0d121f] border border-white/10 rounded-lg space-y-2 font-mono text-xs my-1">
  <div class="text-[#7aa2f7] font-bold">TECHNICAL SKILLS &amp; TOOLING MATRIX:</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-[11px]">
    <div>
      <div class="text-emerald-400 font-bold">[Core Languages]</div>
      <div class="text-slate-300">Python, TypeScript, JavaScript, C#, SQL, HTML/CSS</div>
    </div>
    <div>
      <div class="text-[#7aa2f7] font-bold">[AI &amp; Machine Learning]</div>
      <div class="text-slate-300">PyTorch, TensorFlow, OpenCV, MediaPipe, YOLO, LangGraph, Whisper, Kokoro</div>
    </div>
    <div>
      <div class="text-purple-300 font-bold">[Web &amp; Frameworks]</div>
      <div class="text-slate-300">Next.js 15/16, React 19, Node.js, Express, ASP.NET Core, Tailwind CSS v4</div>
    </div>
    <div>
      <div class="text-amber-300 font-bold">[Databases &amp; Cache]</div>
      <div class="text-slate-300">PostgreSQL, pgvector, MongoDB, SQL Server, Redis, Prisma ORM</div>
    </div>
    <div>
      <div class="text-rose-300 font-bold">[DevOps &amp; Workstation]</div>
      <div class="text-slate-300">Linux (Arch / Ubuntu), Hyprland, Docker, Git, Nginx, Systemd, CI/CD</div>
    </div>
  </div>
</div>
`
      };

    case 'projects':
      return {
        outputHtml: `
<div class="p-3 bg-[#0d121f] border border-white/10 rounded-lg space-y-2 font-mono text-xs my-1">
  <div class="text-[#7aa2f7] font-bold">FLAGSHIP PRODUCTION REPOSITORIES:</div>
  <div class="space-y-2 pt-2 border-t border-white/10 text-[11px]">
    <div>
      <div class="text-emerald-400 font-bold">1. Samco VinFast EV Sales CMS &amp; E-Commerce</div>
      <div class="text-slate-400">Next.js 14, Prisma, PostgreSQL. High-conversion automobile commerce platform.</div>
    </div>
    <div>
      <div class="text-[#7aa2f7] font-bold">2. DogDexx AI Dog Breed Recognition Platform</div>
      <div class="text-slate-400">PyTorch ResNet CNN + Next.js + Cloudinary. Live at dogdexx.vercel.app.</div>
    </div>
    <div>
      <div class="text-purple-300 font-bold">3. Doru AI Desktop Assistant</div>
      <div class="text-slate-400">Linux Hyprland native voice assistant. 8 LangGraph nodes, Silero VAD, Whisper STT, Groq LPU.</div>
    </div>
    <div>
      <div class="text-amber-300 font-bold">4. Odoo 19 ERP Business Suite</div>
      <div class="text-slate-400">CRM pipeline, invoices, inventory, PostgreSQL 15 + pgvector clustering.</div>
    </div>
    <div>
      <div class="text-rose-300 font-bold">5. Veritas Legal Document Digitization (Graduation Thesis)</div>
      <div class="text-slate-400">AI-powered Vietnamese land registry OCR, vector RAG retrieval, and LLM extraction.</div>
    </div>
  </div>
</div>
`
      };

    case 'contact':
    case 'hire':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-contact');
      }
      return {
        outputHtml: `
<div class="p-3 bg-[#0d121f] border border-white/10 rounded-lg space-y-2 font-mono text-xs my-1">
  <div class="text-[#7aa2f7] font-bold">CONTACT &amp; RECRUITMENT CHANNELS:</div>
  <div class="space-y-1 pt-1.5 border-t border-white/10 text-[11px]">
    <div><span class="text-slate-400">Email:</span> <a href="mailto:vtduong04@gmail.com" class="text-emerald-400 hover:underline">vtduong04@gmail.com</a></div>
    <div><span class="text-slate-400">GitHub:</span> <a href="https://github.com/SILVESTRIKE" target="_blank" rel="noreferrer" class="text-[#7aa2f7] hover:underline">github.com/SILVESTRIKE</a></div>
    <div><span class="text-slate-400">Facebook:</span> <a href="https://fb.com/hakudevon" target="_blank" rel="noreferrer" class="text-sky-300 hover:underline">fb.com/hakudevon</a></div>
    <div><span class="text-slate-400">CV Download:</span> <a href="/CV_VanTrongDuong.docx" download class="text-amber-400 hover:underline">Download CV (DOCX)</a></div>
    <div><span class="text-slate-400">Location:</span> Ho Chi Minh City, Vietnam</div>
  </div>
  <div class="text-[10px] text-emerald-400 pt-1 border-t border-white/5">
    [ok] Opening Contact &amp; Hire Workstation Application...
  </div>
</div>
`
      };

    case 'services':
    case 'portfolio':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-services');
        return { outputHtml: '[ok] Opening Services Catalog & Sandboxes...' };
      }
      return { outputHtml: '[ok] Services Catalog opened.' };

    case 'git':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-git');
        return { outputHtml: '[ok] Opening Git Visual Git Studio...' };
      }
      return { outputHtml: '[ok] Git visual studio opened.' };

    case 'network':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-network');
        return { outputHtml: '[ok] Opening Network & Sockets Inspector...' };
      }
      return { outputHtml: '[ok] Network Inspector opened.' };

    case 'files':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-files');
        return { outputHtml: '[ok] Opening Server File Explorer (/home/silvestrike)...' };
      }
      return { outputHtml: '[ok] File Explorer opened.' };

    case 'spotify':
    case 'music':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-spotify');
        return { outputHtml: '[ok] Toggling Spotify Music Deck...' };
      }
      return { outputHtml: '[ok] Spotify deck toggled.' };

    case 'admin':
      if (ctx.onOpenApp) {
        ctx.onOpenApp('app-admin');
        return { outputHtml: '[ok] Initializing administrative console...' };
      }
      return { outputHtml: '[ok] Admin dashboard opened.' };

    case 'traffic':
      return { outputHtml: '[ok] Querying /api/analytics... Check Activity Monitor for visual telemetry.' };

    default:
      return {
        outputHtml: `<span style="color: #f43f5e;">bash: ${escapeHtml(
          cmd
        )}: command not found. Type 'help' for available commands.</span>`
      };
  }
}
