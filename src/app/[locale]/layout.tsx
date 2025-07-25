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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <StarryBackground />
        {children}
        <Toaster />
        <PaddleLoader />
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
