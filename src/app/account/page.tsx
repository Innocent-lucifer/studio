
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";


export default function AccountPage() {
  const { user, userData, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  const handleCheckout = (priceId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to choose a plan.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    if (window.Paddle) {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: user.email ?? undefined,
        }
      });
    } else {
      toast({
        title: "Checkout Error",
        description: "Payment system is not available. Please try again later.",
        variant: "destructive",
      });
    }
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

  const plans = [
    {
      title: "Monthly",
      price: "$19.99",
      subtitle: "/month",
      priceId: "pri_01jytrrggq73bfpd9bce3resb0",
    },
    {
      title: "Yearly",
      price: "$197",
      subtitle: "/year (18% Off)",
      priceId: "pri_01jytrs4wqac0a8pnyttzz34w1",
    },
  ];

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
            <CardDescription className="text-slate-400">Manage your account details and subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">User Information</h3>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Email:</span> {userData?.email || user?.email}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">UID:</span> <span className="text-xs">{user?.uid}</span>
              </p>
            </div>

            <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">Plan & Subscription</h3>
              <p className="text-sm text-slate-300">
                Current Plan: <span className="font-semibold text-purple-400">{userData?.plan ? userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1) : 'Loading...'}</span>
              </p>
              
              {userData?.plan === 'free' && (
                <div className="pt-2">
                  <h4 className="text-md font-semibold text-slate-100 mb-3">Upgrade Your Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map(plan => (
                       <Card key={plan.priceId} className="bg-slate-600/50 border-slate-500 text-center">
                         <CardHeader className="p-4">
                           <CardTitle className="text-lg text-primary">{plan.title}</CardTitle>
                         </CardHeader>
                         <CardContent className="p-4 pt-0">
                           <p className="text-2xl font-bold text-slate-100">{plan.price}</p>
                           <p className="text-xs text-slate-400">{plan.subtitle}</p>
                         </CardContent>
                         <CardFooter className="p-4">
                           <Button onClick={() => handleCheckout(plan.priceId)} className="w-full bg-primary hover:bg-primary/90">
                              Choose Plan
                           </Button>
                         </CardFooter>
                       </Card>
                    ))}
                  </div>
                </div>
              )}

              {userData?.plan !== 'free' && (
                 <Button onClick={() => window.Paddle?.Checkout.open({ settings: { theme: 'dark' } })} variant="outline" className="mt-2 w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                    Manage Subscription
                 </Button>
              )}
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
