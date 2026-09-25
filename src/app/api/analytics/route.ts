/*
Reason for existence: Next.js API Route handler for recording page visits and serving web traffic analytics from data/analytics.json.
System impact if absent: Client applications cannot record visitor traffic or query visitor statistics.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsSummary, recordVisit } from '@/lib/analytics';

// P3-01: Rate limiting for analytics endpoint to prevent storage exhaustion
const analyticsRateMap = new Map<string, { count: number; resetTime: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = analyticsRateMap.get(ip);
  if (!entry || now > entry.resetTime) {
    analyticsRateMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function GET() {
  const summary = getAnalyticsSummary();
  return NextResponse.json(summary, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const userAgent = request.headers.get('user-agent') || 'Browser';

    // P3-03: Input sanitization and bounds checking
    const path = typeof body.path === 'string' ? body.path.substring(0, 120) : '/';
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.substring(0, 80) : undefined;
    const fingerprint = typeof body.fingerprint === 'string' ? body.fingerprint.substring(0, 64) : undefined;
    const screen = typeof body.screen === 'string' ? body.screen.substring(0, 30) : undefined;
    const language = typeof body.language === 'string' ? body.language.substring(0, 20) : undefined;
    const timezone = typeof body.timezone === 'string' ? body.timezone.substring(0, 40) : undefined;
    const referrer = typeof body.referrer === 'string' ? body.referrer.substring(0, 200) : undefined;

    const result = await recordVisit({
      path,
      ip,
      userAgent,
      sessionId,
      fingerprint,
      screen,
      language,
      timezone,
      referrer
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}
