import {Pathnames} from 'next-intl/navigation';

export const locales = ['en', 'es'] as const;

export const pathnames = {
  '/': '/',
  '/about-team': {
    en: '/about-team',
    es: '/sobre-nosotros',
  },
  '/contact': {
    en: '/contact',
    es: '/contacto',
  },
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;
