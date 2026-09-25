/*
Reason for existence: Next.js API Route serving virtualized WebOS journalctl syslog telemetry from systemd microservices.
System impact if absent: LogsApp and journalctl terminal commands will lack live syslog streaming.
*/

import { NextRequest, NextResponse } from 'next/server';
import { LogItem } from '@/types';

const LOG_TEMPLATES: Array<{ service: string; level: LogItem['level']; msg: string }> = [
  { service: 'systemd', level: 'INFO', msg: 'Started Doru AI Desktop Assistant Daemon.' },
  { service: 'doru-ai', level: 'INFO', msg: 'LangGraph audio loop initialized with Silero VAD engine.' },
  { service: 'doru-ai', level: 'INFO', msg: 'Agnes / Groq LPU inference pipeline warm and listening.' },
  { service: 'nginx', level: 'INFO', msg: 'GET / HTTP/2 200 - TLSv1.3 ECDHE-RSA-AES256-GCM-SHA384' },
  { service: 'nginx', level: 'INFO', msg: 'GET /api/system HTTP/2 200 0.8ms' },
  { service: 'dogdexx', level: 'INFO', msg: 'PyTorch ResNet-50 vision backbone verified. Batch inference 18ms.' },
  { service: 'sentiment-nlp', level: 'INFO', msg: 'Underthesea tokenizer loaded. Vocabulary: 45,000 tokens.' },
  { service: 'odoo-erp', level: 'INFO', msg: 'PostgreSQL 15 pgvector connection pool active on port 5432.' },
  { service: 'kernel', level: 'INFO', msg: 'VirtIO network interface eth0: link state UP, 10000 Mbps Full Duplex.' },
  { service: 'auth', level: 'INFO', msg: 'Session authenticated for user duong via pam_unix.' },
  { service: 'systemd-resolved', level: 'INFO', msg: 'Using degraded feature set UDP instead of TCP for DNS server 1.1.1.1.' },
  { service: 'nginx', level: 'INFO', msg: 'GET /api/git?action=repos HTTP/2 200 1.2ms' },
  { service: 'cron', level: 'INFO', msg: 'CRON (root) CMD (/usr/local/bin/backup-vfs-snapshot.sh > /dev/null 2>&1)' },
  { service: 'doru-ai', level: 'INFO', msg: 'Memory context compacted. Active token buffer: 1,420 tokens.' },
  { service: 'nginx', level: 'WARN', msg: 'Rate-limiting window evaluated for client session. Burst quota healthy.' },
  { service: 'kernel', level: 'INFO', msg: 'Hyprland Wayland compositor surface rendered in 2.1ms.' }
];

let globalLogSequence = 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '40', 10)));
  const serviceFilter = (searchParams.get('service') || '').trim().toLowerCase();

  const now = Date.now();
  const logs: LogItem[] = [];

  for (let i = 0; i < limit; i++) {
    const templateIdx = (i + Math.floor(now / 30000)) % LOG_TEMPLATES.length;
    const template = LOG_TEMPLATES[templateIdx];

    if (serviceFilter && !template.service.toLowerCase().includes(serviceFilter)) {
      continue;
    }

    const itemTime = new Date(now - (limit - i) * 8000).toISOString().replace('T', ' ').substring(0, 19);

    logs.push({
      id: globalLogSequence + i,
      timestamp: itemTime,
      service: template.service,
      level: template.level,
      message: template.msg
    });
  }

  return NextResponse.json({ logs }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
