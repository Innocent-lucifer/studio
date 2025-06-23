
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQProps {
  faqs: { q: string; a: string }[];
  openFAQIndex: number | null;
  toggleFAQ: (index: number) => void;
}

const answerVariants = {
  hidden: { height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    marginTop: '1rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export default function FAQ({ faqs, openFAQIndex, toggleFAQ }: FAQProps) {
  return (
    <motion.section
      id="faq"
      className="py-20 sm:py-28 px-4 sm:px-6"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
            </h2>
            <p className="text-lg text-foreground/70">
            Everything you need to know about SagePostAI.
            </p>
        </div>
        <div className="space-y-4">
          {faqs.map(({ q, a }, i) => (
            <motion.div
              key={i}
              className="bg-secondary rounded-lg border border-border overflow-hidden"
              whileHover={{ borderColor: "hsl(var(--primary))", transition: { duration: 0.2 } }}
            >
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full flex justify-between items-center text-left p-6 focus:outline-none"
                aria-expanded={openFAQIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <h4 className="text-lg font-semibold text-foreground tracking-wide">
                  {q}
                </h4>
                <motion.div
                  animate={{ rotate: openFAQIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-primary" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFAQIndex === i && (
                  <motion.div
                    id={`faq-answer-${i}`}
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden px-6"
                  >
                    <div className="border-t border-border">
                        <p className="text-base text-foreground/80 leading-relaxed pt-4 pb-2">
                        {a}
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
