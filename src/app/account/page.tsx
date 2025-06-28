
"use client";

import React, { useEffect, useState } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';


export default function AccountPage() {
  const { user, userData, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isYearlyUpgradeModalOpen, setIsYearlyUpgradeModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

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
      subtitle: "Try 3 days free, then $19.99/month",
      features: [
        "Unlimited Generations",
        "Image to Post Wizard",
        "Quick Post Generator",
        "Smart Campaign Builder",
        "Upload image & get content ideas",
        "Tone Styler (auto-matches human, casual, or pro)",
        "Visibility Booster (adds optimal emojis & hashtags)",
        "AI Post Editor (Auto cleans grammar & flow instantly)",
        "Copy & export posts anytime",
        "Post history access",
      ],
      priceId: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MONTHLY_PRICE_ID || "pri_01jytrrggq73bfpd9bce3resb0"
    },
    {
      title: "Yearly",
      price: "$197",
      subtitle: "Try 3 days free, then $197/year (~$16/mo)",
      badge: "BEST VALUE",
      discountBadge: "18% OFF",
      features: [
        "Unlimited Generations",
        "Image to Post Wizard",
        "Quick Post Generator",
        "Smart Campaign Builder",
        "Upload image & get content ideas",
        "Tone Styler (auto-matches human, casual, or pro)",
        "Visibility Booster (adds optimal emojis & hashtags)",
        "AI Post Editor (Auto cleans grammar & flow instantly)",
        "Copy & export posts anytime",
        "Post history access",
      ],
      priceId: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_YEARLY_PRICE_ID || "pri_01jytrs4wqac0a8pnyttzz34w1"
    }
  ];

  const yearlyPlan = plans.find(p => p.title === "Yearly");

  return (
    <>
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
                <div className="pt-2 text-center">
                    <h4 className="text-md font-semibold text-slate-100 mb-2">Upgrade to Unlock More Power</h4>
                    <p className="text-sm text-slate-400 mb-4">You are currently on the Free plan. Upgrade to get unlimited generations and more.</p>
                    <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setIsPricingModalOpen(true)}>
                        <Icons.sparkles className="mr-2 h-5 w-5" /> View Upgrade Options
                    </Button>
                </div>
              )}

              {userData?.plan === 'monthly' && (
                <div className="pt-2 text-center">
                  <h4 className="text-md font-semibold text-slate-100 mb-2">Upgrade to Yearly & Save</h4>
                  <p className="text-sm text-slate-400 mb-4">You are currently on the Monthly plan. Save 18% by switching to Yearly!</p>
                  <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setIsYearlyUpgradeModalOpen(true)}>
                      <Icons.sparkles className="mr-2 h-5 w-5" /> View Yearly Plan
                  </Button>
                </div>
              )}

              {userData?.plan === 'yearly' && (
                <div className="pt-2 text-center">
                    <h4 className="text-md font-semibold text-slate-100 mb-2">You're on the best plan!</h4>
                    <p className="text-sm text-slate-400 mb-4">You have full access to all features. For account management, see below.</p>
                     <Button onClick={() => setIsRefundModalOpen(true)} variant="link" className="text-slate-400 hover:text-red-400 text-xs">
                        Need a refund?
                     </Button>
                </div>
              )}

              {userData?.plan !== 'free' && (
                 <div className="mt-4 flex justify-center">
                     <Button onClick={() => window.Paddle?.Checkout.open({ settings: { theme: 'dark' } })} variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                        Manage Billing & Subscription
                     </Button>
                 </div>
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

    {/* Free plan -> Upgrade Modal */}
    <Dialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <DialogContent className="bg-slate-800/80 backdrop-blur-md border-slate-700 sm:max-w-4xl text-white">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary text-center">Upgrade Your Plan</DialogTitle>
                <DialogDescription className="text-center text-slate-400">
                    Choose the plan that's right for you. Get lifetime access at early-bird value.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                {plans.map(plan => (
                    <Card key={plan.priceId} className={`relative bg-slate-700/60 border-slate-600 text-left flex flex-col ${plan.badge ? 'border-primary/80' : ''}`}>
                        {plan.badge && (
                            <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">{plan.badge}</Badge>
                        )}
                        <CardHeader className="p-6 pb-4 text-center">
                            <CardTitle className="text-2xl text-primary">{plan.title}</CardTitle>
                            <p className="text-3xl font-bold text-slate-100 pt-2">{plan.price}</p>
                            <p className="text-sm text-slate-400">{plan.subtitle}</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 flex-grow">
                            <ul className="space-y-3 text-sm">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <Icons.checkCircle className="h-4 w-4 text-green-400 mr-3 mt-1 shrink-0" />
                                        <span className="text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-6 mt-auto">
                            <Button onClick={() => { handleCheckout(plan.priceId); setIsPricingModalOpen(false); }} className="w-full bg-primary hover:bg-primary/90 text-lg py-3">
                                Choose Plan
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </DialogContent>
    </Dialog>
    
    {/* Monthly plan -> Yearly Upgrade Modal */}
    <Dialog open={isYearlyUpgradeModalOpen} onOpenChange={setIsYearlyUpgradeModalOpen}>
        <DialogContent className="bg-slate-800/80 backdrop-blur-md border-slate-700 sm:max-w-md text-white">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary text-center">Upgrade to Yearly & Save!</DialogTitle>
                <DialogDescription className="text-center text-slate-400">
                    Get all the same great features and save 18% by switching to our yearly plan.
                </DialogDescription>
            </DialogHeader>
            {yearlyPlan && (
                <div className="py-6">
                    <Card key={yearlyPlan.priceId} className="relative bg-slate-700/60 border-slate-600 text-left flex flex-col border-primary/80">
                        <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">{yearlyPlan.badge}</Badge>
                        <CardHeader className="p-6 pb-4 text-center">
                            <CardTitle className="text-2xl text-primary">{yearlyPlan.title}</CardTitle>
                            <p className="text-3xl font-bold text-slate-100 pt-2">{yearlyPlan.price}</p>
                            <p className="text-sm text-slate-400">{yearlyPlan.subtitle}</p>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 flex-grow">
                            <ul className="space-y-3 text-sm">
                                {yearlyPlan.features.map(feature => (
                                    <li key={feature} className="flex items-start">
                                        <Icons.checkCircle className="h-4 w-4 text-green-400 mr-3 mt-1 shrink-0" />
                                        <span className="text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="p-6 mt-auto">
                            <Button onClick={() => { handleCheckout(yearlyPlan.priceId); setIsYearlyUpgradeModalOpen(false); }} className="w-full bg-primary hover:bg-primary/90 text-lg py-3">
                                Upgrade to Yearly
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </DialogContent>
    </Dialog>

    {/* Yearly plan -> Refund Modal */}
    <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">Refund Request</DialogTitle>
          <DialogDescription className="text-slate-400 pt-2 leading-relaxed">
            We generally do not offer refunds except in a few cases. 
            Please email us at <a href="mailto:refund@sagepostai.com" className="text-primary underline">refund@sagepostai.com</a> with your query. 
            We will try to solve it within 3 business days.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Close
                </Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
