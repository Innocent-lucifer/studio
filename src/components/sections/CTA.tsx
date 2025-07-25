
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

interface CTAProps {
  title: string;
  subtitle: string;
  buttonText: string;
  trialInfo: string;
}

const CTAComponent: React.FC<CTAProps> = ({ title, subtitle, buttonText, trialInfo }) => {
  return (
    <section
      id="cta"
      className="text-center py-20 sm:py-32 px-4 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          {title}
        </h2>
        <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>
        
        <div className="flex flex-col items-center gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 shadow-lg shadow-primary/20">
            <Link href="/login">
              {buttonText}
            </Link>
          </Button>
          <p className="text-sm text-accent font-semibold drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)] animate-pulse">
             {trialInfo}
          </p>
        </div>

      </motion.div>
    </section>
  );
}

export default React.memo(CTAComponent);
