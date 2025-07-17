import zhTranslations from '@/locales/zh.json';
import enTranslations from '@/locales/en.json';

export type Locale = 'zh' | 'en';

const translations = {
  zh: zhTranslations,
  en: enTranslations,
};

export function getTranslations(locale: Locale) {
  return translations[locale] || translations.zh;
}

export function t(key: string, locale: Locale = 'zh'): string {
  const keys = key.split('.');
  let value: any = getTranslations(locale);
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export const supportedLocales: Locale[] = ['zh', 'en'];
export const defaultLocale: Locale = 'zh';