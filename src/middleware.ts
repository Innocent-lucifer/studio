import createMiddleware from 'next-intl/middleware';
import {locales, pathnames} from './i18n-config';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The pathnames object holds pairs of internal
  // and external paths, separated by locale.
  pathnames,
 
  // Used when no locale matches
  defaultLocale: 'en',
  localePrefix: 'always'
});
 
export const config = {
  // Match only internationalized pathnames and exclude Next.js assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
