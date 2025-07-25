
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FooterComponent: React.FC = () => {
  const pathname = usePathname();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      if (pathname === '/') {
        e.preventDefault();
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // If not on the homepage, the default Link behavior will navigate
      // to the homepage and jump to the hash, which is the correct fallback.
    }
  };

  const footerLinks = {
    Product: [
      { name: "Problem & Solution", href: "/#problem-solution" },
      { name: "Features", href: "/#features" },
      { name: "Get Started", href: "/login" },
    ],
    Support: [
      { name: "FAQ", href: "/#faq" },
      { name: "Contact", href: "/contact" },
      { name: "Help Center", href: "/contact" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Refund Policy", href: "/refund-policy" },
      { name: "Cookie Policy", href: "/cookie-policy" },
      { name: "Disclaimer", href: "/disclaimer" },
    ],
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-background text-secondary-foreground border-t border-border mt-16"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="md:col-span-1 lg:col-span-2 space-y-4">
            <Link href="/" passHref>
              <div className="flex items-center space-x-3 cursor-pointer group">
                <AppLogo className="h-8 w-8 md:h-12 md:w-12 text-primary transition-transform duration-300 group-hover:scale-110" />
                <span className="text-xl font-bold text-foreground">
                  SagePostAI
                </span>
              </div>
            </Link>
            <p className="text-secondary-foreground/70 text-sm max-w-xs">
              The AI layer for social media, helping you automate posts and scale effortlessly.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-foreground">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                      <span className="text-secondary-foreground/70 hover:text-primary transition-colors cursor-pointer">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-secondary-foreground/60">
              © {new Date().getFullYear()} SagePostAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="https://x.com/SagepostAI" passHref target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5 text-secondary-foreground/60 hover:text-primary transition-colors" /></Link>
              <Link href="https://linkedin.com/company/sagepostai" passHref target="_blank" rel="noopener noreferrer"><Linkedin className="h-5 w-5 text-secondary-foreground/60 hover:text-primary transition-colors" /></Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default React.memo(FooterComponent);
