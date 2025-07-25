import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames and exclude Next.js assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
