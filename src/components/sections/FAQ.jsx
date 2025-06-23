import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" },
  },
};

const cardVariants = {
  hidden: { scale: 0.9 },
  visible: (i) => ({
    scale: 1,
    transition: { duration: 0.8, delay: i * 0.3, ease: "easeInOut" },
  }),
};

const iconVariantsFAQ = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 },
};

const answerVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export default function FAQ({ faqs, openFAQIndex, toggleFAQ }) {
  return (
    <motion.section
      id="faq"
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-8 bg-gradient-to-br from-[#e0e7ff] via-[#d1d9ff] to-[#b3c2fe] rounded-3xl overflow-hidden shadow-2xl border border-indigo-200/30 font-sans"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 to-purple-100/20 mix-blend-overlay animate-gradientShift"></div>
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>
      <div className="absolute inset-0 border-2 border-transparent rounded-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)] pointer-events-none"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-2 h-2 bg-indigo-300 rounded-full opacity-30 animate-pulse top-1/4 left-1/4"></div>
        <div className="absolute w-3 h-3 bg-purple-300 rounded-full opacity-20 animate-pulse top-3/4 right-1/4 delay-500"></div>
      </div>
      <div className="max-w-7xl mx-auto text-center mb-16 sm:mb-20 relative z-10">
        <motion.h2
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 tracking-wide text-shadow-sm"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="mt-6 w-24 h-1 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg" />
      </div>
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {faqs.map(({ q, a }, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover={{
              scale: 1.05,
              rotateX: 2,
              rotateY: 2,
              boxShadow: "0 15px 20px rgba(99, 102, 241, 0.3)",
              transition: { duration: 0.1, ease: "easeInOut" },
            }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white/90 to-indigo-100/40 p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-200/40 backdrop-blur-xl transition-transform duration-100 perspective-1000 transform-style-preserve-3d shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]"
          >
            <button
              onClick={() => toggleFAQ(i)}
              className="w-full flex justify-between items-center text-left focus:outline-none"
              aria-expanded={openFAQIndex === i}
              aria-controls={`faq-answer-${i}`}
            >
              <div className="flex items-center">
                <h3 className="text-sm font-bold text-indigo-700 mr-4">
                  {String(i + 1).padStart(2, "0")}
                </h3>
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 tracking-wide">
                  {q}
                </h4>
              </div>
              <motion.div
                variants={iconVariantsFAQ}
                animate={openFAQIndex === i ? "expanded" : "collapsed"}
                transition={{ duration: 0.3 }}
              >
                {openFAQIndex === i ? (
                  <ChevronUp className="w-6 h-6 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-indigo-600" />
                )}
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
                  className="overflow-hidden"
                >
                  <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed mt-4">
                    {a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
