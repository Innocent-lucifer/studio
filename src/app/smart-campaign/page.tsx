
"use client";

import { Suspense } from 'react';
import { SmartCampaignWizard } from '@/components/SmartCampaignWizard';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';

const SmartCampaignPageContent = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8"
    >
      <main className="container mx-auto w-full max-w-4xl">
        <header className="flex justify-between items-center w-full mb-8 py-4 px-4">
          {/* LEFT GROUP: Hamburger (MD+), Logo/Title Link */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block">
              <HamburgerMenu />
            </div>
            <Link href="/" passHref>
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
                <AppLogo className="h-12 w-12 sm:h-20 sm:w-20 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                    SagePostAI
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">Smart Campaign</p>
                </div>
              </div>
            </Link>
          </div>
          
          {/* RIGHT GROUP: Action Buttons, Auth Info, Hamburger (SM) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex">
              <Link href="/" passHref legacyBehavior={false}>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 hover:text-purple-300 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                  size="sm"
                >
                  <Icons.edit className="mr-1 h-4 w-4" />
                  Quick Posts
                </Button>
              </Link>
            </div>
            
            <div className="text-right text-xs">
              <p className="font-semibold text-primary">Dev Mode</p>
              <p className="text-slate-400">Guest</p>
            </div>
            {/* Hamburger for screens smaller than MD */}
            <div className="md:hidden">
              <HamburgerMenu />
            </div>
          </div>
        </header>
        
        <div className="sm:hidden w-full mb-6 px-4">
          <Link href="/" passHref legacyBehavior={false}>
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10 hover:text-purple-300"
            >
              <Icons.edit className="mr-2 h-5 w-5" />
              Quick Posts
            </Button>
          </Link>
        </div>
        
        <SmartCampaignWizard />
      </main>
      <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
          Built By EZ Teenagers.
          <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </motion.div>
  );
};

export default function SmartCampaignPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SmartCampaignPageContent />
    </Suspense>
  );
}

const LoadingState = () => (
  <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
    <Icons.loader className="h-16 w-16 animate-spin text-primary" />
    <p className="mt-4 text-xl">Loading Smart Campaign...</p>
  </div>
);

    