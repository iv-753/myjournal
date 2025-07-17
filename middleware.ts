import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['zh', 'en'];
const defaultLocale = 'zh';

// 获取首选语言
function getLocale(request: NextRequest): string {
  // 1. 检查 URL 路径中是否已有语言代码
  const pathname = request.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return pathname.split('/')[1];
  }

  // 2. 检查 Accept-Language 头
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => {
        return locales.some(locale => lang.toLowerCase().startsWith(locale));
      });
    
    if (preferredLocale) {
      const matchedLocale = locales.find(locale => 
        preferredLocale.toLowerCase().startsWith(locale)
      );
      if (matchedLocale) {
        return matchedLocale;
      }
    }
  }

  // 3. 默认语言
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查路径是否已经包含支持的语言代码
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果路径没有语言代码，重定向到带语言代码的路径
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路径，除了以下这些：
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};