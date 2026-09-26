/*
Reason for existence: Central configuration for WebOS system specifications, hostname, default simulated hardware, and runtime timeline anchors.
System Impact of Absence: System monitors, terminal banners, top panel, and virtual files will display inconsistent hostname and platform specs.
*/

import { DEVELOPER_CONFIG } from './developer';

export const SYSTEM_CONFIG = {
  hostname: 'silves.dev',
  serverHost: 'srv-silvestrike',
  userAtHost: 'duong@srv-silvestrike',
  userAtSilvestrike: 'duong@silvestrike',

  os: {
    name: 'SILVESTRIKE WebOS',
    version: '2.0',
    humanBuild: 'Human, Vietnam build [VN]',
    kernel: 'WebOS 2.0',
    kernelFull: 'Linux 7.0.0-31-generic',
    wm: 'Hyprland (Wayland)'
  },

  shell: {
    default: 'bash / zsh',
    developer: 'bash / Python / TypeScript',
    terminalPrompt: 'duong@srv-silvestrike:~$'
  },

  hardwareDefaults: {
    hostModel: DEVELOPER_CONFIG.name.toUpperCase(),
    cpu: 'Intel i5-13420H (8C/12T)',
    gpu: 'WebOS Accelerated GPU Engine',
    memoryTotalGb: 16,
    packagesCount: '143 (npm)'
  },

  timeline: {
    birthYear: 2004,
    universityStartYear: 2022,
    codingStartDate: new Date('2023-09-01T00:00:00+07:00')
  }
} as const;
