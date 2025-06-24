
"use client";

import React, { useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import Link from 'next/link';


export default function AccountPage() {
  const { user, userData, loading: authLoading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading Account...</p>
      </div>
    );
  }
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <HamburgerMenu />
          <Link href="/dashboard" passHref>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
              <AppLogo className="h-12 w-12 sm:h-16 sm:w-16 text-primary group-hover:scale-110 transition-transform" />
               <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                    SagePostAI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">My Account</p>
                </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl flex-grow w-full">
        <motion.div variants={cardVariants} initial="initial" animate="animate">
        <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-primary">Account Overview</CardTitle>
            <CardDescription className="text-slate-400">Manage your account details and saved content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">User Information</h3>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Email:</span> {userData?.email || user?.email}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Phone:</span> <span className="text-slate-400 italic">N/A (Add phone number - Coming soon)</span>
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">UID:</span> <span className="text-xs">{user?.uid}</span>
              </p>
            </div>

            <div className="space-y-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">Plan & Credits</h3>
              <p className="text-sm text-slate-300">
                Current Plan: <span className="font-semibold text-purple-400">{userData?.plan ? userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1) : 'Loading...'}</span>
              </p>
              <Button variant="outline" className="mt-2 w-full sm:w-auto border-primary text-primary hover:bg-primary/10 whitespace-normal h-auto py-2" disabled>
                Manage Subscription / Buy Credits (Coming Soon)
              </Button>
            </div>
            
            <Separator className="bg-slate-700" />

            <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 text-center">
                <Icons.archive className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-slate-100 mb-2">My Saved Drafts & Campaigns</h3>
                <p className="text-slate-400 text-sm mb-4 max-w-md mx-auto">
                    Access all your saved post ideas, visual post drafts, and full smart campaigns in one organized place.
                </p>
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
                    <Link href="/saved-drafts">
                        <Icons.eye className="mr-2 h-5 w-5" /> View My Saved Content
                    </Link>
                </Button>
            </div>


            <Separator className="bg-slate-700" />
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <Icons.logOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </main>

      <footer className="w-full text-center p-6 sm:p-8 text-slate-500 text-sm mt-8">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
          Built by EZ Teenagers
          <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </div>
  );
}
