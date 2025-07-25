
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Brain, CalendarClock, LucideProps } from "lucide-react";

const icons = [Clock, Brain, CalendarClock];

interface Card {
    title: string;
    desc: string;
}

interface ProblemSolutionProps {
    title: string;
    subtitle: string;
    cards: Card[];
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ProblemSolutionComponent: React.FC<ProblemSolutionProps> = ({ title, subtitle, cards }) => {
  return (
    <section
      id="problem-solution"
      className="py-20 sm:py-28 px-4 sm:px-6"
    >
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
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto mb-16">
              {subtitle}
            </p>
        </motion.div>
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map(({ title, desc }, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
                className="bg-background p-8 rounded-2xl border border-border transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default React.memo(ProblemSolutionComponent);
