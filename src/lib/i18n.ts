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
  let value: unknown = getTranslations(locale);
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // 如果路径不存在，返回原始key
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export const supportedLocales: Locale[] = ['zh', 'en'];
export const defaultLocale: Locale = 'zh';