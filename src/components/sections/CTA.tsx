
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
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
          Start Posting Smarter, Today.
        </h2>
        <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
          Join early users who are already transforming their content flow with
          SagePostAI.
        </p>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 shadow-lg shadow-primary/20">
          <Link href="/login">
            Join the Beta Free <ArrowRight className="ml-2 h-5 w-5"/>
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

    