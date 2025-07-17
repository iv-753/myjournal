'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Locale, supportedLocales } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: Locale) => {
    // 构建新的路径
    const segments = pathname.split('/').filter(Boolean);
    
    // 如果当前路径包含语言代码，替换它
    if (supportedLocales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      // 如果没有语言代码，添加到开头
      segments.unshift(newLocale);
    }
    
    const newPath = '/' + segments.join('/');
    router.push(newPath);
    setIsOpen(false);
  };

  const getLanguageName = (locale: Locale) => {
    const names = {
      zh: '中文',
      en: 'English'
    };
    return names[locale];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{getLanguageName(currentLocale)}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {supportedLocales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                locale === currentLocale 
                  ? 'text-teal-600 dark:text-teal-400 font-medium' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {getLanguageName(locale)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}