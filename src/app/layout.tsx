
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"; 
import StarryBackground from '@/components/StarryBackground';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  metadataBase: new URL('https://sagepostai.com'),
  title: "SagePostAI | AI Social Media Automation",
  description: "SagePostAI is the AI layer for social media — built to help creators and brands automate every post, grow faster, and scale effortlessly with intelligent workflows.",
  keywords: "SagePostAI, AI social media tool, automate posts, AI content planner, GPT social media, AI scheduler",
  authors: [{ name: "SagePostAI Team" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "SagePostAI | AI Social Media Automation",
    description: "Automate every post, grow faster, and scale effortlessly with intelligent workflows.",
    url: "https://sagepostai.com",
    siteName: "SagePostAI",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SagePostAI an AI social media tool',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SagePostAI | AI Social Media Automation",
    description: "Automate every post, grow faster, and scale effortlessly with intelligent workflows.",
    images: ['/og-image.png'],
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StarryBackground />
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
