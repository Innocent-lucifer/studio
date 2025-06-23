import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {
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

  return (
    <section id="how-it-works" className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-gray-800">
          How SagePostAI Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map(({ step, desc }, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#f5f7ff] to-[#e0e7ff] shadow-md transition-all duration-300"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-800">
                {step}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
