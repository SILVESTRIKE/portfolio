/*
Reason for existence: Secured administration API endpoint for Duong to monitor website visitor telemetry, identify recruiter companies, and manage outreach notes.
System impact if absent: The private recruiter intelligence dashboard cannot securely retrieve visitor profiles or persist recruitment outreach notes.
*/

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAllVisitors, getAnalyticsSummary, updateVisitorNote } from '@/lib/analytics';
import { readContacts } from '@/lib/contact';

interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

// In-memory rate limiting map for admin auth attempts
const failedAttemptsMap = new Map<string, AttemptRecord>();
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { isLocked: boolean; remainingLockMs: number } {
  const record = failedAttemptsMap.get(ip);
  if (!record) return { isLocked: false, remainingLockMs: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    return { isLocked: true, remainingLockMs: record.lockedUntil - now };
  }

  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    failedAttemptsMap.delete(ip);
    return { isLocked: false, remainingLockMs: 0 };
  }

  return { isLocked: false, remainingLockMs: 0 };
}

function recordFailedAttempt(ip: string): { locked: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    failedAttemptsMap.set(ip, record);
    return { locked: true, remainingAttempts: 0 };
  }

  failedAttemptsMap.set(ip, record);
  return { locked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - record.count };
}

function recordSuccess(ip: string): void {
  failedAttemptsMap.delete(ip);
}

function verifyAdminToken(req: NextRequest): {
  authorized: boolean;
  status?: number;
  error?: string;
  remainingAttempts?: number;
} {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (rateLimit.isLocked) {
    const minutesLeft = Math.ceil(rateLimit.remainingLockMs / 60000);
    return {
      authorized: false,
      status: 429,
      error: `Rate limit: Da nhap sai qua 3 lan. Vui long thu lai sau ${minutesLeft} phut.`
    };
  }

  const expectedToken = process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD;
  if (!expectedToken) {
    return {
      authorized: false,
      status: 403,
      error: 'Admin access unavailable: ADMIN_TOKEN chua duoc cau hinh trong moi truong server.'
    };
  }

  let clientToken = '';
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    clientToken = authHeader.substring(7).trim();
  } else if (req.headers.get('x-admin-token')) {
    clientToken = (req.headers.get('x-admin-token') || '').trim();
  }

  // Timing-safe constant-time token comparison against timing attacks
  const clientBuf = Buffer.from(clientToken);
  const expectedBuf = Buffer.from(expectedToken);
  const isMatch =
    clientBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(clientBuf, expectedBuf);

  if (isMatch) {
    recordSuccess(ip);
    return { authorized: true };
  }

  const result = recordFailedAttempt(ip);
  if (result.locked) {
    return {
      authorized: false,
      status: 429,
      error: 'Rate limit: Da nhap sai qua 3 lan. He thong tam khoa 15 phut.',
      remainingAttempts: 0
    };
  }

  return {
    authorized: false,
    status: 401,
    error: `Unauthorized: Sai mat khau. Con lai ${result.remainingAttempts} lan thu.`,
    remainingAttempts: result.remainingAttempts
  };
}

export async function GET(req: NextRequest) {
  const auth = verifyAdminToken(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error, remainingAttempts: auth.remainingAttempts },
      { status: auth.status || 401 }
    );
  }

  const summary = getAnalyticsSummary();
  const visitors = getAllVisitors();
  const recruiterLeads = visitors.filter(
    (v) => v.isRecruiterCandidate || v.tag === 'lead' || v.tag === 'recruiter' || v.tag === 'contacted'
  );

  return NextResponse.json({
    summary,
    visitors,
    contacts: readContacts(),
    recruiterLeads,
    totalVisitorsCount: visitors.length,
    leadsCount: recruiterLeads.length
  });
}

export async function POST(req: NextRequest) {
  const auth = verifyAdminToken(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error, remainingAttempts: auth.remainingAttempts },
      { status: auth.status || 401 }
    );
  }

  try {
    const body = await req.json();
    const { fingerprint, notes, tag } = body;

    if (!fingerprint || typeof fingerprint !== 'string') {
      return NextResponse.json({ error: 'Thieu fingerprint cua visitor' }, { status: 400 });
    }

    const safeNotes = typeof notes === 'string' ? notes.substring(0, 500) : '';
    const safeTag = ['lead', 'recruiter', 'contacted', 'interviewing', 'general'].includes(tag)
      ? tag
      : undefined;

    const ok = updateVisitorNote(fingerprint, safeNotes, safeTag);
    if (!ok) {
      return NextResponse.json({ error: 'Khong tim thay visitor de cap nhat' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Da cap nhat ghi chu thanh cong' });
  } catch {
    return NextResponse.json({ error: 'Loi khi cap nhat du lieu' }, { status: 500 });
  }
}
