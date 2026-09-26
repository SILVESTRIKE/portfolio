/*
Reason for existence: Calculates real-time developer coding uptime since university Year 2 (September 2023) down to second precision.
System Impact of Absence: FastfetchBanner and ProfileView cannot display synchronized live ticking developer uptime counters.
*/

'use client';

import { useState, useEffect } from 'react';
import { SYSTEM_CONFIG } from '@/config';

// Start date: University Year 2 (Fall semester, September 1, 2023)
export const CODING_START_DATE = SYSTEM_CONFIG.timeline.codingStartDate;

export interface UptimeBreakdown {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function getCodingUptimeBreakdown(
  startDate: Date = CODING_START_DATE,
  now: Date = new Date()
): UptimeBreakdown {
  const diffMs = Math.max(0, now.getTime() - startDate.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  // Exact calendar calculation
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < startDate.getDate())) {
    years--;
  }

  // Days since last year anniversary
  const lastAnniversary = new Date(startDate);
  lastAnniversary.setFullYear(startDate.getFullYear() + years);
  const diffFromAnniversary = Math.max(0, now.getTime() - lastAnniversary.getTime());

  let remSecs = Math.floor(diffFromAnniversary / 1000);
  const days = Math.floor(remSecs / 86400);
  remSecs %= 86400;

  const hours = Math.floor(remSecs / 3600);
  remSecs %= 3600;

  const minutes = Math.floor(remSecs / 60);
  const seconds = remSecs % 60;

  return {
    years,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds
  };
}

export function formatCodingUptime(
  breakdown: UptimeBreakdown,
  mode: 'full' | 'compact' | 'clock' = 'full'
): string {
  const { years, days, hours, minutes, seconds } = breakdown;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (mode === 'clock') {
    return `${years}y ${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  if (mode === 'compact') {
    return `${years} yrs, ${days}d, ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  // Authentic Fastfetch style with seconds ticking
  return `${years} yrs, ${days}d, ${hours}h ${minutes}m ${seconds}s`;
}

export function useCodingUptime(mode: 'full' | 'compact' | 'clock' = 'full'): string {
  const [uptimeStr, setUptimeStr] = useState<string>(() =>
    formatCodingUptime(getCodingUptimeBreakdown(), mode)
  );

  useEffect(() => {
    const tick = () => {
      setUptimeStr(formatCodingUptime(getCodingUptimeBreakdown(), mode));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  return uptimeStr;
}
