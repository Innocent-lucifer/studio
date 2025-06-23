
import React from 'react';
import { AppLogo } from '@/components/AppLogo';
import Link from 'next/link';

export default function Footer({ handleReload }) {
  const footerLinks = [
    { name: "Privacy Policy", href: "/PrivacyPolicy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/Cookie-Policy" },
    { name: "Disclaimer", href: "/Disclaimer" },
    { name: "Refund Policy", href: "/Refund" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <AppLogo className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">SagePostAI</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
            {footerLinks.map(link => (
              <Link key={link.name} href={link.href} className="text-gray-600 hover:text-indigo-600 transition">
                  {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} SagePostAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
