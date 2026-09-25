/*
Reason for existence: Lightweight React Context provider and hook for application internationalization across English and Vietnamese with localStorage persistence.
System impact if absent: Desktop components cannot retrieve localized strings or toggle languages.
*/

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocaleId, LocaleDictionary, locales } from '@/locales';
import { WebOSPersistence } from '@/lib/persistence';

interface I18nContextValue {
  locale: LocaleId;
  setLocale: (locale: LocaleId) => void;
  t: LocaleDictionary;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: locales.en
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>('en');

  useEffect(() => {
    const saved = WebOSPersistence.loadLocale();
    if (saved && (saved === 'en' || saved === 'vi')) {
      setLocaleState(saved);
    } else if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('vi')) {
      setLocaleState('vi');
    }
  }, []);

  const setLocale = (newLocale: LocaleId) => {
    setLocaleState(newLocale);
    WebOSPersistence.saveLocale(newLocale);
  };

  const t = locales[locale] || locales.en;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
