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

import { DEVELOPER_CONFIG } from '@/config';

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://silvestrike.vercel.app');

export const metadata: Metadata = {
  title: `${DEVELOPER_CONFIG.alias} Portfolio OS`,
  description: `Interactive browser-based developer portfolio and Linux workstation for ${DEVELOPER_CONFIG.name} (${DEVELOPER_CONFIG.alias}) featuring live telemetry, bash terminal, services catalog, and AI assistant.`,
  metadataBase: new URL(appUrl),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: `${DEVELOPER_CONFIG.alias} Portfolio OS`,
    description: `Interactive browser-based developer portfolio and Linux workstation for ${DEVELOPER_CONFIG.name} (${DEVELOPER_CONFIG.alias})`,
    url: appUrl,
    siteName: `${DEVELOPER_CONFIG.alias} Portfolio OS`,
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
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
