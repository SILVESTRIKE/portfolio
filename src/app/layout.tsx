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
  title: 'Linux Server WebOS (srv-doru)',
  description: 'Interactive browser-based Linux Server WebOS featuring bash terminal, htop activity monitor, systemd service manager, and live syslog stream.',
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
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
