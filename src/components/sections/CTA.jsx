import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section
      id="contact"
      className="text-center py-12 sm:py-20 px-4 sm:px-6 mt-12 sm:mt-16"
    >
      <div className="relative inline-block">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900"
        >
          Start Posting Smarter
        </motion.h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
          className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"
        />
      </div>
      <p className="text-gray-700 text-sm sm:text-base mb-6">
        Join early users who are already transforming their content flow with
        SagePostAI.
      </p>
      <Link href="/login">
        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/50 transition duration-200"
        >
          Join the Beta Free
        </motion.button>
      </Link>
    </section>
  );
}
