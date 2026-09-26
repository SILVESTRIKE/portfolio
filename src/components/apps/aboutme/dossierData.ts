/*
Reason for existence: Central repository of dossier file metadata, badges, languages, and summaries for the Dossier Studio About Me app.
System Impact of Absence: Dossier application will have no file index or metadata definitions to display in the explorer, search, and tab manager.
*/

import { DossierFile } from './types';

export const DOSSIER_FILES: DossierFile[] = [
  {
    id: 'profile.yml',
    name: 'profile.yml',
    lang: 'YAML',
    badge: 'YML',
    color: '#f59e0b',
    summary: 'Developer metadata, specs, and education credentials'
  },
  {
    id: 'README.md',
    name: 'README.md',
    lang: 'Markdown',
    badge: 'MD',
    color: '#7aa2f7',
    summary: 'Executive overview, engineering pillars, and background'
  },
  {
    id: 'skills.json',
    name: 'skills.json',
    lang: 'JSON',
    badge: 'JSON',
    color: '#eab308',
    summary: '6 core dialects, AI/ML tools, web architecture, and databases'
  },
  {
    id: 'samco-binhtan.ts',
    name: 'samco-binhtan.ts',
    folder: 'projects',
    lang: 'TypeScript',
    badge: 'TS',
    color: '#3b82f6',
    summary: 'Samco VinFast EV CMS (samco-cms-prod:v2.1): Next.js 14, Prisma, PostgreSQL, 15k+ visits, 0 downtime'
  },
  {
    id: 'dogdexx-ai.py',
    name: 'dogdexx-ai.py',
    folder: 'projects',
    lang: 'Python',
    badge: 'PY',
    color: '#10b981',
    summary: 'DogDexx Edge AI (dogdexx-ai:v1.2): PyTorch ResNet, Next.js BFF, 94% accuracy, <180ms edge inference'
  },
  {
    id: 'doru-agent.py',
    name: 'doru-agent.py',
    folder: 'projects',
    lang: 'Python',
    badge: 'PY',
    color: '#10b981',
    summary: 'Doru AI Host Daemon (doru-voice-agent:v2.0): 8-node LangGraph, Whisper STT, Kokoro TTS, <650ms loop'
  },
  {
    id: 'webbantra.cs',
    name: 'webbantra.cs',
    folder: 'projects',
    lang: 'C#',
    badge: 'CS',
    color: '#a855f7',
    summary: 'WebBanTra POS Suite (webbantra-sql:v1.0): ASP.NET Core, WinForms, MSSQL stored procs, 100% ACID'
  },
  {
    id: 'thesis-veritas.md',
    name: 'thesis-veritas.md',
    lang: 'Markdown',
    badge: 'MD',
    color: '#c084fc',
    summary: 'Graduation Thesis (veritas-engine:v1.0): Hybrid BM25+BGE-M3 RAG, Qdrant DB, 92.4% recall on 15.4k laws'
  },
  {
    id: 'contact.sh',
    name: 'contact.sh',
    lang: 'Shell',
    badge: 'SH',
    color: '#4ade80',
    summary: 'Interactive cURL script, verified email, and social profiles'
  },
  {
    id: 'manual.man',
    name: 'manual.man',
    lang: 'Manpage',
    badge: 'MAN',
    color: '#94a3b8',
    summary: 'UNIX section 1 manpage for SILVESTRIKE software suite'
  }
];
