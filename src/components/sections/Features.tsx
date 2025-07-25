
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Edit, Sparkles, Flame, PenTool, Bot, Hash, Monitor, Zap, Icon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

interface FeaturesProps {
    title: string;
    subtitle: string;
    features: Feature[];
}

const icons: Icon[] = [ImageIcon, Edit, Sparkles, Flame, PenTool, Bot, Hash, Monitor, Zap];

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

const FeaturesComponent: React.FC<FeaturesProps> = ({ title, subtitle, features }) => {
  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            {title}
          </h2>
          <p className="text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map(({ title, description }, index) => {
            const Icon = icons[index] || Zap;
            return (
              <motion.div
                key={title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                className="p-5 text-left rounded-2xl bg-background border border-border shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30"
              >
                <div className="bg-primary/10 text-primary p-2 rounded-lg inline-block mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {title}
                </h3>
                <p className="text-foreground/70 text-sm">
                  {description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
}

export default React.memo(FeaturesComponent);
