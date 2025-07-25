
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
  '/cookie-policy': {
    en: '/cookie-policy',
    es: '/politica-de-cookies',
  },
  '/disclaimer': {
    en: '/disclaimer',
    es: '/descargo-de-responsabilidad',
  },
  '/privacy-policy': {
    en: '/privacy-policy',
    es: '/politica-de-privacidad',
  },
  '/refund-policy': {
    en: '/refund-policy',
    es: '/politica-de-reembolso',
  },
  '/terms-of-service': {
    en: '/terms-of-service',
    es: '/terminos-de-servicio',
  },

} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;

    