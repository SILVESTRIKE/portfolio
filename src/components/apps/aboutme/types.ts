/*
Reason for existence: Type definitions for the Dossier Studio About Me application, including file IDs, activity tabs, and dossier file metadata.
System Impact of Absence: Type mismatch or lack of strict typing across decomposed About Me components and views.
*/

export type FileId =
  | 'profile.yml'
  | 'README.md'
  | 'skills.json'
  | 'samco-binhtan.ts'
  | 'dogdexx-ai.py'
  | 'doru-agent.py'
  | 'webbantra.cs'
  | 'thesis-veritas.md'
  | 'contact.sh'
  | 'manual.man';

export type ActivityTab = 'explorer' | 'search' | 'git' | 'sysinfo';

export interface DossierFile {
  id: FileId;
  name: string;
  folder?: string;
  lang: string;
  badge: string;
  color: string;
  summary: string;
}

export interface AboutMeTerminalAppProps {
  onNotify?: (msg: string, type?: 'info' | 'warn' | 'error') => void;
  onOpenApp?: (appId: string) => void;
}
