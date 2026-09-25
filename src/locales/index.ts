/*
Reason for existence: Central TypeScript contract and dictionary registry unifying all localized namespaces for EN and VI.
System impact if absent: Type safety for localization keys is lost, resulting in runtime missing key or undefined string errors.
*/

import { enLocale } from './en';
import { viLocale } from './vi';

export type LocaleId = 'en' | 'vi';
export type LocaleDictionary = typeof enLocale;

export const locales: Record<LocaleId, LocaleDictionary> = {
  en: enLocale,
  vi: viLocale
};

export { enLocale, viLocale };
