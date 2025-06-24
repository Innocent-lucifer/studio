"use client";

import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Edit, Sparkles, Flame, PenTool, Bot, Hash, Monitor, Zap } from "lucide-react";
import type { Icon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: Icon;
}

const features: Feature[] = [
  {
    title: "Image to Post Wizard",
    description: "Upload an image and let our AI craft a personalized, descriptive social media post based on its content and your chosen tone.",
    icon: ImageIcon,
  },
  {
    title: "Quick Post Generator",
    description: "Research any topic and instantly generate engaging drafts for Twitter and LinkedIn. Perfect for rapid content creation.",
    icon: Edit,
  },
  {
    title: "Smart Campaign Builder",
    description: "Create cohesive multi-post campaigns. Select content angles, generate series for different platforms, and get repurposing ideas.",
    icon: Sparkles,
  },
  {
    title: "Trend Explorer",
    description: "Discover what's buzzing on social media. Explore trending topics across platforms and categories to inspire your next viral post.",
    icon: Flame,
  },
  {
    title: "Human-Like AI Writing",
    description: "Posts that sound like you, not a robot — crafted for engagement, not just grammar.",
    icon: PenTool,
  },
  {
    title: "Emotion-Aware Intelligence",
    description: "It senses your vibe. Casual, bold, or subtle — SagePostAI mirrors your tone without prompts.",
    icon: Bot,
  },
  {
    title: "Smart Hashtags + Emojis",
    description: "Context-aware enhancers that boost reach without feeling forced.",
    icon: Hash,
  },
  {
    title: "Platform-Tailored Output",
    description: "Each post is fine-tuned for its platform — format, tone, and style aligned.",
    icon: Monitor,
  },
  {
    title: "Fast, Frictionless Output",
    description: "Under 2 seconds. Every time. No delays. Just copy, paste, and publish — effortlessly.",
    icon: Zap,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 bg-secondary">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Why Choose SagePostAI?
          </h2>
          <p className="text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">
            Go beyond basic generation. We provide an intelligent suite of tools designed for modern creators.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map(({ title, description, icon: Icon }) => (
            <motion.div
              key={title}
              variants={itemVariants}
              whileHover={{ scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
              className="p-6 text-left rounded-2xl bg-background border border-border shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30"
            >
              <div className="bg-primary/10 text-primary p-2.5 rounded-lg inline-block mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {title}
              </h3>
              <p className="text-foreground/70 text-sm">
                {description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
