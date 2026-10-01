/*
Reason for existence: Static SSR 30-second recruiter summary page allowing search crawlers, social bots, and hiring managers to scan core engineering strengths, projects, and contact details without needing interactive WebOS boots.
System impact if absent: Search engines and recruiters who do not interact with client-side WebOS terminals will not be able to index or quickly review developer qualifications.
*/

import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { DEVELOPER_CONFIG } from '@/config';
import { ResumeView } from './ResumeView';

export const metadata: Metadata = {
  title: `${DEVELOPER_CONFIG.name} | ${DEVELOPER_CONFIG.title} Resume`,
  description: `30-second executive summary of ${DEVELOPER_CONFIG.name} (${DEVELOPER_CONFIG.alias}). Full-stack web architecture, production AI engineering, core projects, and contact channels.`,
  openGraph: {
    title: `${DEVELOPER_CONFIG.name} | Full-Stack & AI/ML Engineer (30s Resume)`,
    description: 'Executive overview, selected projects (Samco Binh Tan, DogDexx AI, Doru AI), tech stack, and direct CV download.',
    url: 'https://silvestrike.vercel.app/resume',
    siteName: 'SILVESTRIKE Portfolio',
    type: 'profile'
  }
};

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#080b12] flex items-center justify-center text-slate-400 font-mono text-xs">
          Loading 30s Resume...
        </div>
      }
    >
      <ResumeView />
    </Suspense>
  );
}
