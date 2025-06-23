
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "@/components/ui/toaster"; 

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "SagePostAI | AI Social Media Automation",
  description: "SagePostAI is the AI layer for social media — built to help creators and brands automate every post, grow faster, and scale effortlessly with intelligent workflows.",
  keywords: "SagePostAI, AI social media tool, automate posts, AI content planner, GPT social media, AI scheduler",
  authors: [{ name: "SagePostAI Team" }],
  openGraph: {
    title: "SagePostAI | AI Social Media Automation",
    description: "Automate every post, grow faster, and scale effortlessly with intelligent workflows.",
    url: "https://sagepostai.com",
    siteName: "SagePostAI",
    images: [
      {
        url: 'https://placehold.co/1200x630.png', // Replace with your actual OG image URL
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
    images: ['https://placehold.co/1200x630.png'], // Replace with your actual Twitter image URL
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
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
