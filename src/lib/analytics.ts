/*
Reason for existence: Persistent local file-based analytics engine tracking real website visits, unique visitors, browser fingerprints, and recruiter leads in data/analytics.json.
System impact if absent: Web analytics dashboard and private recruiter tracking will lack visitor metrics, fingerprint telemetry, and traffic persistence.
*/

import fs from 'fs';
import path from 'path';

export interface VisitLogEntry {
  id: string;
  timestamp: string;
  path: string;
  device: string;
  ip: string;
  fingerprint?: string;
  location?: string;
  org?: string;
  referrer?: string;
  count?: number;
}

export interface VisitorProfile {
  fingerprint: string;
  ip: string;
  country: string;
  city: string;
  org: string;
  isp: string;
  device: string;
  browser: string;
  os: string;
  screen: string;
  language: string;
  timezone: string;
  referrer: string;
  firstSeen: string;
  lastSeen: string;
  totalVisits: number;
  pageviews: number;
  pagesVisited: string[];
  isRecruiterCandidate: boolean;
  tag: 'lead' | 'recruiter' | 'contacted' | 'interviewing' | 'general';
  notes: string;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  uniqueVisitors: number;
  activeSessions: number;
  routes: Record<string, number>;
  recentLogs: VisitLogEntry[];
  recruiterLeadsCount?: number;
}

interface AnalyticsDbFile {
  totalPageviews: number;
  visitorHashes: string[];
  sessions: Array<{ id: string; lastSeen: number; route: string }>;
  routes: Record<string, number>;
  recentLogs: VisitLogEntry[];
  visitors: Record<string, VisitorProfile>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'analytics.json');

const INITIAL_DB: AnalyticsDbFile = {
  totalPageviews: 0,
  visitorHashes: [],
  sessions: [],
  routes: {},
  recentLogs: [],
  visitors: {}
};

function ensureDbExists(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    }
  } catch {
    // Ignore fs errors in read-only environments
  }
}

export function readAnalytics(): AnalyticsDbFile {
  ensureDbExists();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      totalPageviews: typeof parsed.totalPageviews === 'number' ? parsed.totalPageviews : 1,
      visitorHashes: Array.isArray(parsed.visitorHashes) ? parsed.visitorHashes : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      routes: typeof parsed.routes === 'object' && parsed.routes !== null ? parsed.routes : {},
      recentLogs: Array.isArray(parsed.recentLogs) ? parsed.recentLogs : [],
      visitors: typeof parsed.visitors === 'object' && parsed.visitors !== null ? parsed.visitors : {}
    };
  } catch {
    return { ...INITIAL_DB };
  }
}

// In-memory GeoIP cache to minimize external network lookups
const geoCache = new Map<string, { country: string; city: string; org: string; isp: string }>();

async function resolveGeo(ip: string): Promise<{ country: string; city: string; org: string; isp: string }> {
  const cleanIp = ip.split(',')[0].trim();
  if (
    cleanIp === '127.0.0.1' ||
    cleanIp === '::1' ||
    cleanIp.startsWith('192.168.') ||
    cleanIp.startsWith('10.') ||
    cleanIp.startsWith('172.16.')
  ) {
    return { country: 'Vietnam', city: 'Ho Chi Minh City', org: 'Local DevStation', isp: 'Internal' };
  }

  const cached = geoCache.get(cleanIp);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    const res = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,country,city,isp,org`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        const info = {
          country: data.country || 'Global',
          city: data.city || 'Online',
          org: data.org || data.isp || 'Enterprise Network',
          isp: data.isp || 'Standard ISP'
        };
        geoCache.set(cleanIp, info);
        return info;
      }
    }
  } catch {
    // Fallback on timeout or network error
  }

  const fallback = { country: 'Global', city: 'Online', org: 'Standard Network', isp: 'ISP' };
  geoCache.set(cleanIp, fallback);
  return fallback;
}

function parseDevice(ua: string): { device: string; browser: string; os: string } {
  let device = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Browser';

  // Device & OS
  if (/mobile/i.test(ua)) device = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device = 'Tablet';

  if (/linux/i.test(ua)) os = 'Linux';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad/i.test(ua)) os = 'iOS';

  // Browser
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/firefox/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';

  return {
    device: `${device} (${os})`,
    browser,
    os
  };
}

export function maskIp(ip?: string): string {
  if (!ip) return '127.0.*.*';
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (clean === '::1' || clean === '127.0.0.1') return '127.0.*.*';
  const parts = clean.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  if (clean.includes(':')) {
    const colons = clean.split(':');
    return `${colons.slice(0, 2).join(':')}::****`;
  }
  return '***.***.***.***';
}

export async function recordVisit(payload: {
  path?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  fingerprint?: string;
  screen?: string;
  language?: string;
  timezone?: string;
  referrer?: string;
}): Promise<AnalyticsSummary> {
  ensureDbExists();
  const db = readAnalytics();

  const visitPath = (payload.path || '/').substring(0, 120);
  const rawIp = (payload.ip || '127.0.0.1').split(',')[0].trim();
  const ua = payload.userAgent || 'WebBrowser';
  const sessionId = (payload.sessionId || `sess-${Date.now()}`).substring(0, 80);
  const fingerprint = (payload.fingerprint || `fp_${rawIp.replace(/[:.]/g, '_')}`).substring(0, 64);
  const screen = (payload.screen || 'unknown').substring(0, 30);
  const language = (payload.language || 'vi').substring(0, 20);
  const timezone = (payload.timezone || 'UTC').substring(0, 40);
  const referrer = (payload.referrer || '').substring(0, 200);
  const now = Date.now();
  const timestampStr = new Date(now).toISOString().replace('T', ' ').substring(0, 19);

  // Increment total views
  db.totalPageviews += 1;

  // Track unique visitors
  if (!db.visitorHashes.includes(rawIp)) {
    db.visitorHashes.push(rawIp);
  }

  // Update route breakdown
  db.routes[visitPath] = (db.routes[visitPath] || 0) + 1;

  // Clean stale sessions (older than 10 minutes) and update active sessions
  const tenMinutesAgo = now - 10 * 60 * 1000;
  const activeSessions = db.sessions.filter((s) => s.lastSeen > tenMinutesAgo);
  const existingSessionIdx = activeSessions.findIndex((s) => s.id === sessionId);

  const isNewSession = existingSessionIdx === -1;
  if (!isNewSession) {
    activeSessions[existingSessionIdx].lastSeen = now;
    activeSessions[existingSessionIdx].route = visitPath;
  } else {
    activeSessions.push({ id: sessionId, lastSeen: now, route: visitPath });
  }
  db.sessions = activeSessions;

  // Parse device info
  const parsedDev = parseDevice(ua);

  // GeoIP and Organization resolution
  const geo = await resolveGeo(rawIp);

  // Recruiter candidate heuristics
  const isLinkedInReferrer = /linkedin\.com/i.test(referrer);
  const isJobBoard = /topcv|vietnamworks|itviec|github\.com/i.test(referrer);
  const isCorporateOrg = /telecom|corporation|company|tech|enterprise|fpt|viettel|vng|shopee/i.test(geo.org);
  const isCandidate = isLinkedInReferrer || isJobBoard || isCorporateOrg;

  // Update or insert VisitorProfile
  const existingVisitor = db.visitors[fingerprint];
  if (existingVisitor) {
    existingVisitor.lastSeen = timestampStr;
    existingVisitor.pageviews += 1;
    if (isNewSession) {
      existingVisitor.totalVisits += 1;
    }
    if (!existingVisitor.pagesVisited.includes(visitPath)) {
      existingVisitor.pagesVisited.push(visitPath);
    }
    if (referrer && !existingVisitor.referrer) {
      existingVisitor.referrer = referrer;
    }
    if (isCandidate && existingVisitor.tag === 'general') {
      existingVisitor.tag = 'lead';
      existingVisitor.isRecruiterCandidate = true;
    }
  } else {
    db.visitors[fingerprint] = {
      fingerprint,
      ip: rawIp === '::1' ? '127.0.0.1' : rawIp,
      country: geo.country,
      city: geo.city,
      org: geo.org,
      isp: geo.isp,
      device: parsedDev.device,
      browser: parsedDev.browser,
      os: parsedDev.os,
      screen,
      language,
      timezone,
      referrer,
      firstSeen: timestampStr,
      lastSeen: timestampStr,
      totalVisits: 1,
      pageviews: 1,
      pagesVisited: [visitPath],
      isRecruiterCandidate: isCandidate,
      tag: isCandidate ? 'lead' : 'general',
      notes: isCandidate ? 'Tu dong nhan dien: Khach tu mang to chuc hoac link tuyen dung' : ''
    };
  }

  // Add or update recent access logs (increment count if same fingerprint exists)
  const existingLogIndex = db.recentLogs.findIndex(
    (l) => Boolean(fingerprint && l.fingerprint === fingerprint)
  );

  if (existingLogIndex !== -1) {
    const existing = db.recentLogs[existingLogIndex];
    existing.count = (existing.count || 1) + 1;
    existing.timestamp = timestampStr;
    existing.path = visitPath;
    if (referrer && !existing.referrer) {
      existing.referrer = referrer;
    }
    // Bring latest activity to front of recent logs
    db.recentLogs.splice(existingLogIndex, 1);
    db.recentLogs.unshift(existing);
  } else {
    const newEntry: VisitLogEntry = {
      id: `v-${now}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timestampStr,
      path: visitPath,
      device: parsedDev.device,
      ip: rawIp === '::1' ? '127.0.0.1' : rawIp,
      fingerprint,
      location: `${geo.city}, ${geo.country}`,
      org: geo.org,
      referrer,
      count: 1
    };

    db.recentLogs = [newEntry, ...db.recentLogs.slice(0, 49)];
  }

  // Write atomically
  try {
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
  } catch {
    // Write failure fallback
  }

  const recruiterLeads = Object.values(db.visitors).filter((v) => v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter').length;

  const sanitizedLogs = (db.recentLogs || []).map((log) => ({
    ...log,
    ip: maskIp(log.ip)
  }));

  return {
    totalPageviews: db.totalPageviews,
    uniqueVisitors: Object.keys(db.visitors).length || db.visitorHashes.length,
    activeSessions: db.sessions.length,
    routes: db.routes,
    recentLogs: sanitizedLogs,
    recruiterLeadsCount: recruiterLeads
  };
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const db = readAnalytics();
  const now = Date.now();
  const tenMinutesAgo = now - 10 * 60 * 1000;
  const activeSessions = db.sessions.filter((s) => s.lastSeen > tenMinutesAgo);
  const recruiterLeads = Object.values(db.visitors || {}).filter(
    (v) => v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter'
  ).length;

  const sanitizedLogs = (db.recentLogs || []).map((log) => ({
    ...log,
    ip: maskIp(log.ip)
  }));

  return {
    totalPageviews: db.totalPageviews,
    uniqueVisitors: Object.keys(db.visitors || {}).length || db.visitorHashes.length,
    activeSessions: Math.max(1, activeSessions.length),
    routes: db.routes,
    recentLogs: sanitizedLogs,
    recruiterLeadsCount: recruiterLeads
  };
}

export function getAllVisitors(): VisitorProfile[] {
  const db = readAnalytics();
  return Object.values(db.visitors || {}).sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
}

export function updateVisitorNote(
  fingerprint: string,
  notes: string,
  tag?: VisitorProfile['tag']
): boolean {
  ensureDbExists();
  const db = readAnalytics();
  if (!db.visitors[fingerprint]) return false;

  db.visitors[fingerprint].notes = notes.substring(0, 500);
  if (tag) {
    db.visitors[fingerprint].tag = tag;
  }

  try {
    const tmpPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmpPath, DB_PATH);
    return true;
  } catch {
    return false;
  }
}
