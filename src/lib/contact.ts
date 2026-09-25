/*
Reason for existence: Local file-based storage and persistence for recruiter contact inquiries submitted via the Contact Me application.
System impact if absent: Recruiter callbacks and submitted contact inquiries cannot be stored or viewed by the administrator.
*/

import fs from 'fs';
import path from 'path';
import { updateVisitorNote } from '@/lib/analytics';

export interface ContactSubmission {
  id: string;
  timestamp: string;
  name: string;
  contact: string;
  message: string;
  ip: string;
  fingerprint?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

function ensureContactsDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONTACTS_FILE)) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch {
    // Ignore fs errors in read-only environment
  }
}

export function readContacts(): ContactSubmission[] {
  ensureContactsDb();
  try {
    const raw = fs.readFileSync(CONTACTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveContactSubmission(sub: Omit<ContactSubmission, 'id' | 'timestamp'>): ContactSubmission {
  ensureContactsDb();
  const list = readContacts();
  const newEntry: ContactSubmission = {
    ...sub,
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };

  list.unshift(newEntry);
  const capped = list.slice(0, 200);

  try {
    const tmpPath = `${CONTACTS_FILE}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(capped, null, 2), 'utf-8');
    fs.renameSync(tmpPath, CONTACTS_FILE);
  } catch {
    // Ignore write errors
  }

  // If fingerprint is provided, integrate with analytics visitor profile
  if (sub.fingerprint) {
    const noteText = `[Lead Form]: ${sub.name} | ${sub.contact} | ${sub.message}`.substring(0, 500);
    updateVisitorNote(sub.fingerprint, noteText, 'lead');
  }

  return newEntry;
}
