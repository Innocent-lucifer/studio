
"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    step: "Step 1: Choose Your Input",
    desc: "Write a topic, upload an image, or pick a category — our AI understands context and adapts to your intent.",
  },
  {
    step: "Step 2: Let AI Do the Work",
    desc: "It crafts personalized posts instantly — tone, format, and length adjusted automatically for the platform.",
  },
  {
    step: "Step 3: Share or Repurpose",
    desc: "Copy, refine, or share your post. Or turn it into a multi-post campaign in one click.",
  },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-12 text-foreground">
          How SagePostAI Works
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {steps.map(({ step, desc }, index) => (
            <motion.div
              key={step}
              variants={itemVariants}
              className="p-8 rounded-2xl bg-secondary border border-border shadow-md"
            >
              <h3 className="text-xl font-semibold mb-3 text-primary">
                {step}
              </h3>
              <p className="text-foreground/80 text-base">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
