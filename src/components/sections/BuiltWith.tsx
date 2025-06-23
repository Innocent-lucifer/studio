"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BuiltWith() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-foreground/60 mb-6 font-semibold tracking-wider uppercase">
          BUILT WITH THE BEST AI MODELS
        </p>
        <motion.div
          className="flex justify-center items-center gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            className="h-12 w-12 md:h-16 md:w-16 transition-transform duration-300"
          >
            <Image
              src="/openai.svg"
              alt="OpenAI Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain invert"
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            className="h-12 w-12 md:h-16 md:w-16 transition-transform duration-300"
          >
            <Image
              src="/gemini.svg"
              alt="Google Gemini Logo"
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
