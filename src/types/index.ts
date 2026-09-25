/*
Reason for existence: Central TypeScript interfaces and data contracts for WebOS applications, processes, services, files, GitHub portfolio repos, AI chat, and Odoo ERP sandbox.
System impact if absent: Type safety is compromised and type errors occur across all WebOS components.
*/

export type AppId = 
  | 'app-terminal' 
  | 'hub-portfolio'
  | 'hub-system'
  | 'hub-workspace'
  | 'app-monitor' 
  | 'app-services' 
  | 'app-files' 
  | 'app-logs' 
  | 'app-network' 
  | 'app-settings'
  | 'app-ai'
  | 'app-odoo'
  | 'app-spotify'
  | 'app-gitkraken'
  | 'app-about';

export type WorkspaceId = 1 | 2 | 3 | 4;

export type TilingLayoutMode = 'master-stack' | 'grid' | 'columns' | 'monocle';

export interface ProcessItem {
  pid: number;
  user: string;
  cpu: number;
  mem: number;
  virt: string;
  res: string;
  time: string;
  cmd: string;
}

export interface ServiceUnit {
  name: string;
  displayName: string;
  status: 'running' | 'stopped' | 'failed' | 'deployed';
  pid: number;
  memory: string;
  uptime: string;
  description: string;
  logs: string[];
  repoUrl?: string;
  deployUrl?: string;
  language?: string;
  category?: 'ai' | 'web' | 'system' | 'business';
  hasSandbox?: boolean;
}

export interface FileNode {
  name: string;
  type: 'file' | 'dir';
  permissions: string;
  owner: string;
  group: string;
  size?: number;
  updatedAt: Date;
  content?: string;
  children?: Record<string, FileNode>;
}

export interface LogItem {
  id: number;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRIT';
  message: string;
}

export interface WindowState {
  id: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface PaneState {
  appId: AppId;
  title: string;
  isMaximized: boolean;
}

export interface WorkspaceState {
  id: WorkspaceId;
  name: string;
  activeAppIds: AppId[];
  layout: TilingLayoutMode;
  maximizedAppId: AppId | null;
}

export interface SystemSnapshot {
  cores: number[];
  totalCpu: number;
  ramTotal: number;
  ramUsed: number;
  ramPercent: number;
  swapTotal: number;
  swapUsed: number;
  rxRate: number;
  txRate: number;
  cpuHistory: number[];
  ramHistory: number[];
  processes: ProcessItem[];
  hostname?: string;
  cpuModel?: string;
  kernel?: string;
  platform?: string;
  arch?: string;
  uptime?: number;
  loadAvg?: number[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface OdooLead {
  id: number;
  name: string;
  contact: string;
  revenue: number;
  stage: 'new' | 'qualified' | 'proposition' | 'won';
}

export interface OdooInvoice {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'paid' | 'draft' | 'overdue';
}

export interface SpotifyTrackInfo {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  songUrl: string;
  previewUrl: string | null;
  progressMs: number;
  durationMs: number;
  trackId: string;
}

export interface GitCommitNode {
  hash: string;
  shortHash: string;
  author: string;
  email: string;
  date: string;
  relativeTime: string;
  message: string;
  parents: string[];
  branch?: string;
  tags?: string[];
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
}

export interface GitBranchInfo {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
  commitHash: string;
}

export interface GitFileDiff {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed';
  diff: string;
}

export interface GitRepoData {
  repoName: string;
  currentBranch: string;
  branches: GitBranchInfo[];
  commits: GitCommitNode[];
  totalCommits: number;
}

