"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Plan {
    title: string;
    price: string;
    subtitle: string;
    borderClass: string;
    badge?: string;
    badgeClass?: string;
    discountBadge?: string;
    features: string[];
    priceId: string;
}

interface PricingProps {
    plans: Plan[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function Pricing({ plans }: PricingProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = (priceId: string) => {
    if (user) {
      if (window.Paddle) {
        window.Paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customer: {
            email: user.email ?? undefined,
          },
          customData: {
            userId: user.uid,
          },
          settings: {
            successUrl: 'https://sagepostai.com/dashboard' 
          }
        });
      } else {
        console.error("Paddle.js is not loaded or initialized.");
        toast({
          title: "Checkout Error",
          description: "Payment system is not available. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to subscribe.",
        iconType: 'lock'
      });
      router.push('/login');
    }
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <div className="inline-flex items-center justify-center gap-2 text-primary-foreground font-semibold text-sm mb-3 bg-primary px-4 py-1.5 rounded-full shadow-md shadow-primary/30">
                <Sparkles className="w-5 h-5" />
                <span>Launching-only Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">
                Choose the plan that’s right for you. Get lifetime access at early-bird value.
            </p>
        </motion.div>

        <div
          className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto"
        >
          {plans.map((plan, i) => (
            <motion.div
              key={plan.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
              className={`relative w-full flex flex-col justify-between rounded-2xl p-8 bg-background shadow-lg border ${plan.borderClass} hover:shadow-xl hover:shadow-primary/20`}
            >
              <div>
                {plan.badge && (
                  <div
                    className={`absolute -top-4 right-6 px-4 py-1 text-xs font-bold text-white rounded-full shadow-md bg-gradient-to-r ${plan.badgeClass}`}
                  >
                    {plan.badge}
                  </div>
                )}
                {plan.discountBadge && (
                  <div className="absolute -top-4 left-6 px-4 py-1.5 text-xs font-bold text-accent-foreground bg-accent rounded-full shadow-lg shadow-accent/40">
                    {plan.discountBadge}
                  </div>
                )}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {plan.title}
                  </h3>
                  <p className="text-4xl font-bold text-primary mb-2">
                    {plan.price}
                  </p>
                  <p className="text-foreground/70 text-sm font-semibold mb-8">
                    {plan.subtitle}
                  </p>
                  <Button 
                    onClick={() => handleCheckout(plan.priceId)}
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base mb-2 shadow-lg shadow-primary/30"
                  >
                    Try 3 Days Free
                  </Button>
                  <p className="text-xs text-accent mb-8 font-semibold drop-shadow-[0_0_6px_hsl(var(--accent)/0.7)]">
                    No card required for trial.
                  </p>
                  <ul className="text-left space-y-3">
                    {plan.features.map((feat, i) => (
                      <li
                        key={i}
                        className="flex items-start text-foreground/90 text-sm"
                      >
                          <CheckCircle className="text-green-500 w-5 h-5 mr-3 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center text-sm text-slate-400">
                  <Lock className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-semibold">Secure payment</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
