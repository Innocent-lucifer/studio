import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BuiltWith() {
  return (
    <section className="py-4 sm:py-6 pb-8 sm:pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm sm:text-base text-gray-700 mb-4 font-bold">
          Built with ChatGPT and Gemini
        </p>
        <div className="flex justify-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 0.8,
              scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="h-12 w-12 sm:h-14 sm:w-14 p-2 bg-white rounded-2xl shadow-lg"
          >
            <Image
              src="https://placehold.co/48x48.png"
              alt="OpenAI Logo"
              width={48}
              height={48}
              data-ai-hint="openai logo"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              scale: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="h-12 w-12 sm:h-14 sm:w-14 p-2 bg-white rounded-2xl shadow-lg"
          >
            <Image
              src="https://placehold.co/48x48.png"
              alt="Gemini Logo"
              width={48}
              height={48}
              data-ai-hint="gemini logo"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
