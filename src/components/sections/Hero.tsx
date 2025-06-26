
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import ProductHuntBadge from "../compos/ProductHuntBadge";
import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const placeholders = [
  "Enter a topic to see the magic...",
  "For Founders: 'Go-to-market strategy for a new SaaS'",
  "For Creators: 'My journey building a personal brand'",
  "For Marketers: 'Latest trends in content marketing'",
];

export default function Hero() {
  const [topic, setTopic] = useState("");
  const router = useRouter();
  const { user } = useAuth();
  const [placeholder, setPlaceholder] = useState("Enter a topic to see the magic...");
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (isUserInteracting) return; // Stop animation if user is typing

    let currentText = "";
    let placeholderIndex = 0;
    let isDeleting = false;
    let loopTimeout: NodeJS.Timeout;

    const type = () => {
      // Stop the loop if the user starts typing
      if (isUserInteracting) {
        clearTimeout(loopTimeout);
        return;
      }

      const fullText = placeholders[placeholderIndex];
      currentText = isDeleting
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1);

      setPlaceholder(currentText + "|");

      let typeSpeed = 150;
      if (isDeleting) {
        typeSpeed /= 2;
      }

      if (!isDeleting && currentText === fullText) {
        typeSpeed = 2000; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && currentText === "") {
        isDeleting = false;
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        typeSpeed = 500; // Pause before typing new word
      }

      loopTimeout = setTimeout(type, typeSpeed);
    };

    loopTimeout = setTimeout(type, 1000); // Initial delay

    return () => clearTimeout(loopTimeout); // Cleanup on unmount
  }, [isUserInteracting]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUserInteracting) {
      setIsUserInteracting(true);
      setPlaceholder(""); // Clear animated placeholder
    }
    setTopic(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topicToSubmit = topic.trim();

    if (topicToSubmit) {
      const redirectUrl = `/quick-post?topic=${encodeURIComponent(topicToSubmit)}`;
      if (user) {
        router.push(redirectUrl);
      } else {
        sessionStorage.setItem('postLoginRedirect', redirectUrl);
        router.push('/login');
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <section className="px-4 sm:px-6 py-28 sm:py-32 lg:py-40">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
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

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto sm:flex-grow">
              <input
                type="text"
                value={topic}
                onChange={handleInputChange}
                placeholder={isUserInteracting ? "" : placeholder}
                className="flex h-14 w-full items-center rounded-md border border-input bg-secondary px-5 py-2 text-base text-foreground ring-offset-background placeholder:text-foreground/60"
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full sm:w-auto h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 shadow-lg shadow-primary/20">
              <Search className="mr-2 h-5 w-5" />
              Start Generating
            </Button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 flex items-center text-sm text-foreground/60"
          >
            <Clock className="w-4 h-4 mr-2 text-accent" />
            Let AI research and generate posts for you — free trial available.
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          className="w-full h-auto aspect-video relative"
        >
          <Image
            src="/product-preview.png"
            alt="SagePostAI application preview"
            fill
            style={{objectFit:"cover"}}
            className="rounded-2xl shadow-2xl border-2 border-border"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
