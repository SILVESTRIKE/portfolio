/*
Reason for existence: Next.js API route handler for receiving recruiter contact form submissions and storing them in data/contacts.json.
System impact if absent: Visitors cannot submit callback requests or contact notes directly from the Contact Me application.
*/

import { NextRequest, NextResponse } from 'next/server';
import { saveContactSubmission } from '@/lib/contact';

// Rate limiting: 5 submissions per 10 minutes per IP
const contactRateMap = new Map<string, { count: number; resetTime: number }>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateMap.get(ip);
  if (!entry || now > entry.resetTime) {
    contactRateMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_REQUESTS) {
    return true;
  }
  entry.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit: Qua nhieu yeu cau lien he. Vui long thu lai sau.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' 
      ? body.message.trim().substring(0, 1000) 
      : (typeof body.content === 'string' ? body.content.trim().substring(0, 1000) : '');
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim().substring(0, 100) : 'Visitor';
    const contact = typeof body.contact === 'string' && body.contact.trim() ? body.contact.trim().substring(0, 100) : '';
    const fingerprint = typeof body.fingerprint === 'string' ? body.fingerprint.trim().substring(0, 64) : undefined;

    if (!message) {
      return NextResponse.json(
        { error: 'Vui long nhap noi dung tin nhan / thong tin lien he.' },
        { status: 400 }
      );
    }

    const saved = saveContactSubmission({
      name,
      contact: contact || 'Embedded in message',
      message,
      ip,
      fingerprint
    });

    return NextResponse.json({ success: true, id: saved.id });
  } catch {
    return NextResponse.json({ error: 'Failed to process contact submission' }, { status: 500 });
  }
}
