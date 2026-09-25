/*
Reason for existence: English localization dictionary for all in-app UI strings across every application component.
System impact if absent: App components will display hardcoded English strings that cannot be translated to Vietnamese.
*/

export const enApps = {
  // MonitorApp
  monitor: {
    cpuTitle: 'CPU UTILIZATION',
    memoryTitle: 'MEMORY ALLOCATION',
    swapLabel: 'Swap Allocation',
    telemetryTitle: 'REAL-TIME LOAD TELEMETRY (CPU & MEMORY)',
    intervalLabel: 'Interval',
    filterPlaceholder: 'Filter processes by name, user, or PID...',
    activeLabel: 'Active',
    killBtn: 'SIGTERM',
    colPid: 'PID',
    colUser: 'USER',
    colCpu: '%CPU',
    colMem: '%MEM',
    colVirt: 'VIRT',
    colRes: 'RES',
    colTime: 'TIME+',
    colCommand: 'COMMAND',
    colAction: 'ACTION'
  },

  // LogsApp
  logs: {
    filterPlaceholder: 'Filter message or service...',
    levelAll: 'ALL LEVELS',
    levelInfo: 'INFO',
    levelWarn: 'WARN',
    levelError: 'ERROR',
    pauseBtn: 'Pause Stream',
    resumeBtn: 'Resume Stream',
    clearBtn: 'Clear',
    pauseToast: 'Log stream paused',
    resumeToast: 'Log stream resumed',
    emptyMsg: 'No logs matching filter criteria.'
  },

  // NetworkApp
  network: {
    interfaceLabel: 'INTERFACE (eth0)',
    firewallLabel: 'FIREWALL (UFW)',
    gatewayLabel: 'GATEWAY & NAMESERVERS',
    statusActive: 'Active',
    statusDisabled: 'Disabled',
    disableUfw: 'Disable UFW',
    enableUfw: 'Enable UFW',
    socketsTitle: 'ACTIVE LISTENING SOCKETS (netstat -tuln)',
    openSockets: 'Open Sockets',
    diagTitle: 'NETWORK LATENCY DIAGNOSTICS (ping)',
    pingPlaceholder: 'Host or IP (e.g. 1.1.1.1)',
    startPing: 'Start Ping',
    stopPing: 'Stop Ping',
    pingReady: 'Ready to diagnose network connectivity.',
    ufwEnabledToast: 'UFW Firewall Enabled',
    ufwDisabledToast: 'UFW Firewall Disabled',
    colProto: 'Proto',
    colLocal: 'Local Address',
    colForeign: 'Foreign Address',
    colState: 'State',
    colService: 'Service',
    colPid: 'PID'
  },

  // FilesApp
  files: {
    upBtn: '.. (Up)',
    homeBtn: 'Home',
    newFileBtn: '+ File',
    newFolderBtn: '+ Folder',
    refreshBtn: 'Refresh',
    placesLabel: 'Places',
    emptyDir: 'Directory is empty',
    editBtn: 'Edit',
    deleteBtn: 'Del',
    colName: 'Name',
    colPermissions: 'Permissions',
    colOwner: 'Owner',
    colSize: 'Size',
    colActions: 'Actions',
    saveBtn: 'Save',
    closeBtn: 'Close',
    savedToast: 'Saved changes to',
    createdFileToast: 'Created file',
    createdDirToast: 'Created directory',
    deletedToast: 'Deleted',
    newFilePrompt: 'Enter new file name:',
    newFolderPrompt: 'Enter new directory name:',
    deleteConfirm: "Are you sure you want to delete"
  },

  // ServicesApp
  services: {
    searchPlaceholder: 'Search SILVESTRIKE services...',
    categoryAll: 'ALL',
    filterAi: 'AI',
    filterSystem: 'SYS',
    filterBusiness: 'BIZ',
    filterWeb: 'WEB',
    openLiveSite: 'Open Live Site',
    openGitKraken: 'GitKraken Studio',
    openOdoo: 'Open Odoo ERP',
    launchSandbox: 'Launch Sandbox',
    closeSandbox: '[ Close Sandbox ]',
    liveSim: 'Live Simulator',
    sandboxHeader: 'Interactive Sandbox',
    statusDeployed: 'DEPLOYED',
    statusRunning: 'RUNNING',
    statusHostEngine: 'HOST ENGINE',
    forkLabel: 'Forks',
    pushedLabel: 'Pushed',
    openNewWindow: 'Open in New Window',
    runSentimentBtn: 'Run Sentiment Analysis',
    generateQuizBtn: 'Generate Quiz'
  },

  // AIAssistantApp
  ai: {
    headerTitle: 'Doru AI Native Engine',
    backendLabel: 'Backend: Local Hybrid LPU',
    thinkingMsg: 'Doru AI is generating response...',
    inputPlaceholder: 'Ask Doru AI about server, projects, or Linux commands...',
    sendBtn: 'Send',
    quickPrompt1: 'How does Doru AI work?',
    quickPrompt2: 'What is special about DogDexx?',
    quickPrompt3: 'Current status of silvestrike.dev server?',
    quickPrompt4: 'What does Odoo Sandbox manage?',
    initMsg: 'Hello! I am Doru AI Native Assistant on SILVESTRIKE Portfolio OS. I can help answer questions about SILVESTRIKE portfolio projects, Linux server commands, or system status analysis.'
  },

  // TilingPane / WM
  pane: {
    maximizeTooltip: 'Toggle monocle / full pane',
    restoreTooltip: 'Restore tiling layout',
    closeTooltip: 'Close pane',
    swapTooltip: 'Drag header to swap window position'
  },

  // Toast messages from page.tsx
  toast: {
    switchedLayout: 'Switched layout to',
    toggledAudio: 'Toggled audio stream',
    terminatedPid: 'Terminated PID'
  }
};
