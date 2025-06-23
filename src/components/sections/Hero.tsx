
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Search } from "lucide-react";
import ProductHuntBadge from "../compos/ProductHuntBadge";
import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Hero() {
  const [inputText, setInputText] = useState("");
  
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
            <Link href="/login" passHref legacyBehavior>
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-200 hover:scale-105 shadow-lg shadow-primary/20">
                  <Search className="mr-2 h-5 w-5" />
                  Start Generating
                </Button>
            </Link>
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
            src="https://placehold.co/1200x675.png"
            alt="SagePostAI application preview"
            layout="fill"
            objectFit="cover"
            className="rounded-2xl shadow-2xl border-2 border-border"
            data-ai-hint="social media dashboard"
          />
        </motion.div>
      </div>
    </section>
  );
}
