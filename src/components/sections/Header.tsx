
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";

interface NavLink {
  name: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

interface HeaderProps {
  scrolled: boolean;
  menuOpen: boolean;
  toggleMenu: () => void;
  navLinks: NavLink[];
}

export default function Header({ scrolled, menuOpen, toggleMenu, navLinks }: HeaderProps) {

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 20 } },
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        <Link href="/" passHref>
          <div className="flex items-center space-x-3 cursor-pointer group">
            <AppLogo className="h-10 w-10 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground tracking-wide group-hover:text-primary transition-colors duration-300">
              SagePostAI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} passHref>
              <Button variant="ghost" onClick={link.onClick as any} className="text-foreground/80 hover:text-foreground hover:bg-secondary">
                  {link.name}
              </Button>
            </Link>
          ))}
          <Link href="/login" passHref>
            <Button className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105">
              Try it Free
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <Button onClick={toggleMenu} variant="ghost" size="icon" className="text-foreground">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
        >
          <div className="flex flex-col items-center space-y-4 px-4 py-8">
            {navLinks.map((link, i) => (
              <motion.div key={link.name} variants={navItemVariants} initial="hidden" animate="visible" transition={{delay: i * 0.1}}>
                 <Link href={link.href} passHref>
                  <Button variant="link" onClick={link.onClick as any} className="text-lg text-foreground/80 hover:text-primary">
                    {link.name}
                  </Button>
                </Link>
              </motion.div>
            ))}
             <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{delay: navLinks.length * 0.1}}>
                <Link href="/login" passHref>
                    <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    Try it Free
                    </Button>
                </Link>
            </motion.div>
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
}
