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
    openGitKraken: 'Git Studio',
    openOdoo: 'Open Odoo ERP',
    launchSandbox: 'Launch Sandbox',
    closeSandbox: '[ Close Sandbox ]',
    liveSim: 'Live Simulator',
    sandboxHeader: 'Interactive Sandbox',
    statusDeployed: 'DEPLOYED',
    statusRunning: 'RUNNING',
    statusHostEngine: 'HOST ENGINE',
    containerSummary: 'Docker Containers',
    imageLabel: 'IMAGE',
    portsLabel: 'PORTS',
    dependsOnLabel: 'DEPENDS ON',
    envLabel: 'ENVIRONMENT',
    healthLabel: 'HEALTHCHECK',
    forkLabel: 'Forks',
    pushedLabel: 'Pushed',
    openNewWindow: 'Open in New Window',
    runSentimentBtn: 'Run Sentiment Analysis',
    generateQuizBtn: 'Generate Quiz'
  },

  // AIAssistantApp
  ai: {
    headerTitle: 'Doru AI Assistant',
    backendLabel: 'Doru AI Inference Engine',
    thinkingMsg: 'Doru AI is generating response...',
    inputPlaceholder: 'Ask Doru AI about projects, skills, graduation thesis...',
    sendBtn: 'Send',
    quickPrompt1: 'What are Duong\'s flagship GitHub projects?',
    quickPrompt2: 'Tell me about the Veritas AI thesis pipeline.',
    quickPrompt3: 'What Full-Stack & AI skills does Duong have?',
    quickPrompt4: 'How does Samco Binh Tan WebApp work?',
    initMsg: 'Hello! I am Doru AI - the virtual guide for Van Trong Duong\'s (SILVESTRIKE) WebOS Portfolio. I can walk you through his GitHub projects, technical stack, thesis research, and contact channels!'
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
  },

  // AboutMeTerminalApp (IDE Dossier)
  about: {
    activityExplorer: 'Explorer',
    activitySearch: 'Search Dossier',
    activityGit: 'Source Control',
    activitySysinfo: 'Fetch Specs',
    sidebarTitle: 'EXPLORER: SILVESTRIKE',
    searchTitle: 'SEARCH: DOSSIER GREP',
    searchPlaceholder: 'Search files (e.g. PyTorch, Next.js, Veritas)...',
    gitTitle: 'SOURCE CONTROL: GIT',
    gitClean: 'Working tree clean. Branch main synced with origin.',
    terminalTitle: 'INTEGRATED TERMINAL',
    sendEmail: 'Send Email',
    copyEmail: 'Copy',
    copiedToast: 'Copied to clipboard',
    openRepo: 'View Repository',
    openLive: 'Visit Live Application',
    noResults: 'No matches found.',
    statusBranch: 'main',
    statusEncoding: 'UTF-8',
    statusSpaces: 'Spaces: 2'
  },

  // ContactApp
  contact: {
    title: 'Contact Me',
    headerTitle: 'VAN TRONG DUONG (SILVESTRIKE)',
    headerSub: 'Software Engineer (Full-Stack / Backend) | AI/ML Systems Engineer',
    headerEdu: 'HUIT IT (Final Year) | GPA: 3.2 / 4.0 | IELTS: 6.5 Academic | Ho Chi Minh City',
    openForHire: 'OPEN FOR HIRE',
    downloadCvBtn: 'Download CV',
    downloadingCvToast: 'Downloading CV_VanTrongDuong.docx...',

    // Direct Gmail action
    openGmailBtn: 'Open in Gmail',

    // Leave Contact Info
    leaveInfoTitle: 'LEAVE CONTACT INFO',
    leaveInfoSubtitle: 'Leave your contact info, job role, or inquiry below. Duong will reach out within 24 hours.',
    inputPlaceholder: 'Type your message, name, email/phone, or notes here...',
    submitBtn: 'Submit',
    submittingBtn: 'Submitting...',
    submitSuccess: 'Your message has been recorded. Duong will reach out shortly.',
    submitAnotherBtn: 'Send Another Note',
    errorRequired: 'Please enter your message or contact info.',
    errorGeneral: 'Failed to record details. Please try emailing directly.',

    copiedToast: 'Copied to clipboard'
  },

  // AdminDashboardApp
  admin: {
    authTitle: '[ADMINISTRATOR AUTHENTICATION]',
    authSubtitle: 'Recruiter Intelligence & Visitor Tracking System',
    tokenLabel: 'Master Access Token:',
    tokenPlaceholder: 'Enter master access token...',
    unlockBtn: 'Unlock Tracking Dashboard',
    authDesc: 'Proprietary monitoring dashboard for Van Trong Duong to trace corporate and recruiter visitors viewing portfolio.',
    headerTitle: 'RECRUITER & VISITOR INTELLIGENCE',
    headerSubtitle: 'Track corporate and recruiter visits to proactively outreach for employment',
    liveBadge: 'LIVE TELEMETRY',
    refreshBtn: 'Refresh',
    refreshingBtn: 'Syncing...',
    lockBtn: 'Lock',
    leadsCardTitle: 'POTENTIAL RECRUITERS',
    leadsCardDesc: 'From corporate ISP or LinkedIn/CV link',
    visitorsCardTitle: 'TOTAL UNIQUE VISITORS',
    visitorsCardDesc: 'Identified via unique browser fingerprint',
    pageviewsCardTitle: 'TOTAL PAGEVIEWS',
    pageviewsCardDesc: 'Aggregated across all WebOS views',
    sessionsCardTitle: 'ACTIVE SESSIONS',
    sessionsCardDesc: 'Within the last 10 minutes',
    searchPlaceholder: 'Filter by organization, city, IP, source, notes...',
    filterAll: 'All',
    filterLeads: 'Recruiters',
    filterContacted: 'Contacted',
    filterInterviewing: 'Interviewing',
    tableTitle: 'VISITOR ACCESS STREAM',
    tableTip: 'Click "Edit notes" to record interview follow-ups',
    colOrg: 'ORGANIZATION / ISP',
    colLocation: 'LOCATION',
    colReferrer: 'SOURCE',
    colDevice: 'DEVICE & OS',
    colVisits: 'SESSIONS / VIEWS',
    colPages: 'PAGES EXPLORED',
    colNotes: 'NOTES & STATUS',
    colActions: 'ACTIONS',
    editNotesBtn: 'Edit notes',
    copyLeadBtn: 'Copy lead',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    noData: 'No visitor telemetry matches current filters.'
  }
};
