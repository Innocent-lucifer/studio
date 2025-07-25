import createMiddleware from 'next-intl/middleware';
import {locales, pathnames} from './src/i18n-config';
 
export default createMiddleware({
  locales,
  pathnames,
  defaultLocale: 'en',
  localePrefix: 'always'
});
 
export const config = {
  // Match only internationalized pathnames and exclude Next.js assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};