import Script from 'next/script';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"; 
import StarryBackground from '@/components/StarryBackground';
import { PaddleLoader } from '@/components/PaddleLoader';
import {NextIntlClientProvider, useMessages} from 'next-intl';

declare global {
  interface Window {
    Paddle: any;
  }
}

export default function LocaleLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = useMessages();
  return (
    <>
      <StarryBackground />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </NextIntlClientProvider>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-R35KLPZN1G"
      />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-R35KLPZN1G');
        `}
      </Script>
      <PaddleLoader />
    </>
  );
}
