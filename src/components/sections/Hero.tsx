"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import ProductHuntBadge from "../compos/ProductHuntBadge";
import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const placeholders = [
  "Enter topic to see the magic",
  "e.g., The future of renewable energy",
  "e.g., How AI is changing marketing",
  "e.g., The benefits of a 4-day work week",
];

// Self-contained component for the typing animation
const TypingPlaceholder = () => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const handleType = () => {
      const i = loopNum % placeholders.length;
      const fullText = placeholders[i];

      const updatedText = isDeleting
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1);

      setCurrentText(updatedText);

      if (!isDeleting && updatedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause before deleting
      } else if (isDeleting && updatedText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const typingSpeed = isDeleting ? 75 : 150;
    const timer = setTimeout(handleType, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum]);

  return (
    <span className="text-foreground/60">
      {currentText}
      <span className="animate-pulse text-foreground/80">|</span>
    </span>
  );
};


export default function Hero() {
  return (
    <section className="px-4 sm:px-6 py-28 sm:py-32 lg:py-40">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <ProductHuntBadge />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mt-6 mb-6 leading-tight tracking-tighter">
            Automate Social Media <br />
            <span className="text-primary">Dominate with AI</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-xl">
            SagePostAI helps you plan, write, and publish social media content
            effortlessly — with zero-effort automation.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <div className="flex h-14 w-full items-center rounded-md border border-input bg-secondary px-5 py-2 text-base ring-offset-background">
                <TypingPlaceholder />
              </div>
            </div>
            
            <Button asChild size="lg" className="w-full sm:w-auto h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 shadow-lg shadow-primary/20">
                <Link href="/login">
                  <Search className="mr-2 h-5 w-5" />
                  Start Generating
                </Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 flex items-center text-sm text-foreground/60"
          >
            <Clock className="w-4 h-4 mr-2 text-accent" />
            Let AI research and generate posts for you — free trial available.
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="w-full h-auto aspect-video relative"
        >
          <Image
            src="/product-preview.png"
            alt="SagePostAI application preview"
            fill
            style={{objectFit:"cover"}}
            className="rounded-2xl shadow-2xl border-2 border-border"
          />
        </motion.div>
      </div>
    </section>
  );
}