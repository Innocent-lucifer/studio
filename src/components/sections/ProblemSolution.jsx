import React from "react";
import { motion } from "framer-motion";
import { Clock, Brain, CalendarClock } from "lucide-react";

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

const iconVariants = {
  initial: {
    scale: 1,
    filter: "drop-shadow(0 0 0 rgba(0, 0, 0, 0))",
    rotate: 0,
  },
  hover: {
    scale: 1.15,
    filter: "drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))",
    rotate: 360,
    transition: { duration: 0.1, ease: "easeInOut" },
  },
};

export default function ProblemSolution() {
  return (
    <motion.section
      id="problem-solution"
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
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 tracking-wide text-shadow-sm">
          The Real Struggles of Social Media!
        </h2>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-bold leading-relaxed max-w-3xl mx-auto">
          Everyone faces them. Now there’s a smarter way out.
        </p>
        <div className="mt-6 w-24 h-1 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-7xl mx-auto relative z-10">
        <motion.div
          custom={0}
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
          className="bg-gradient-to-br from-white/90 to-indigo-100/40 p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-200/40 backdrop-blur-xl"
        >
          <motion.div
            className="mb-6 sm:mb-8 flex justify-center"
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 drop-shadow-md" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-wide relative">
            Too Much Time Spent Writing
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
          </h3>
          <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed mb-3">
            Crafting each post from scratch takes forever.
          </p>
          <p className="text-sm sm:text-base text-indigo-600 font-bold leading-relaxed bg-gradient-to-r from-indigo-100/30 to-purple-100/30 px-2 py-1 rounded-md hover:text-purple-500 transition-colors duration-100">
            SagePostAI generates quality posts instantly based on your topic.
          </p>
        </motion.div>
        <motion.div
          custom={1}
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
          className="bg-gradient-to-br from-white/90 to-indigo-100/40 p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-200/40 backdrop-blur-xl"
        >
          <motion.div
            className="mb-6 sm:mb-8 flex justify-center"
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 drop-shadow-md" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-wide relative">
            Struggling for Post Ideas
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
          </h3>
          <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed mb-3">
            You run out of fresh, engaging content ideas quickly.
          </p>
          <p className="text-sm sm:text-base text-indigo-600 font-bold leading-relaxed bg-gradient-to-r from-indigo-100/30 to-purple-100/30 px-2 py-1 rounded-md hover:text-purple-500 transition-colors duration-100">
            We auto-research and generate creative content tailored to your
            needs.
          </p>
        </motion.div>
        <motion.div
          custom={2}
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
          className="bg-gradient-to-br from-white/90 to-indigo-100/40 p-6 sm:p-8 rounded-3xl shadow-2xl border border-indigo-200/40 backdrop-blur-xl"
        >
          <motion.div
            className="mb-6 sm:mb-8 flex justify-center"
            variants={iconVariants}
            initial="initial"
            whileHover="hover"
          >
            <CalendarClock className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600 drop-shadow-md" />
          </motion.div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 tracking-wide relative">
            Inconsistent Posting
            <span className="absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
          </h3>
          <p className="text-sm sm:text-base text-gray-700 font-bold leading-relaxed mb-3">
            You miss optimal times or post irregularly.
          </p>
          <p className="text-sm sm:text-base text-indigo-600 font-bold leading-relaxed bg-gradient-to-r from-indigo-100/30 to-purple-100/30 px-2 py-1 rounded-md hover:text-purple-500 transition-colors duration-100">
            SagePostAI formats and schedules your posts for peak impact.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
