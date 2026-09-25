/*
Reason for existence: Root layout for Next.js App Router configuring Google Fonts (JetBrains Mono & Outfit), HTML head metadata, and dark theme wrapper.
System impact if absent: Next.js cannot render root HTML structure and typography will fallback to system defaults.
*/

import type { Metadata } from 'next';
import { JetBrains_Mono, Outfit } from 'next/font/google';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

const outfit = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SILVESTRIKE Portfolio OS',
  description: 'Interactive browser-based developer portfolio and Linux workstation for Van Trong Duong (SILVESTRIKE) featuring live telemetry, bash terminal, services catalog, and AI assistant.',
  metadataBase: new URL('https://silvestrike.dev'),
  openGraph: {
    title: 'SILVESTRIKE Portfolio OS',
    description: 'Interactive browser-based developer portfolio and Linux workstation for Van Trong Duong (SILVESTRIKE)',
    url: 'https://silvestrike.dev',
    siteName: 'SILVESTRIKE Portfolio OS',
    locale: 'en_US',
    type: 'website',
  },
};

import { I18nProvider } from '@/lib/i18n';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${outfit.variable} h-full dark`}>
      <body className="h-full w-full overflow-hidden font-sans text-slate-100 antialiased flex flex-col bg-obsidian-950">
        <div className="crt-scanline" />
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
