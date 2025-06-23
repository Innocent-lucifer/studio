import React from "react";
import { motion } from "framer-motion";

export default function Features() {
  const features = [
    {
      title: "Image to Post Wizard",
      description:
        "Upload an image and let our AI craft a personalized, descriptive social media post based on its content and your chosen tone.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 5h18M5 7v12h14V7M9 15h.01M12 15h.01M15 15h.01"
          />
        </svg>
      ),
    },
    {
      title: "Quick Post Generator",
      description:
        "Research any topic and instantly generate engaging drafts for Twitter and LinkedIn. Perfect for rapid content creation.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553 2.276A2 2 0 0120 14.09v.82a2 2 0 01-.447 1.276L15 18m0-8v8m0-8L9 6m6 2H9m0 0L4.553 9.276A2 2 0 004 11.09v.82a2 2 0 00.447 1.276L9 16"
          />
        </svg>
      ),
    },
    {
      title: "Smart Campaign Builder",
      description:
        "Create cohesive multi-post campaigns. Select content angles, generate series for different platforms, and get repurposing ideas.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 8h10M7 12h4m-4 4h10M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
          />
        </svg>
      ),
    },
    {
      title: "Trend Explorer",
      description:
        "Discover what's buzzing on social media. Explore trending topics across platforms and categories to inspire your next viral post.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Human-Like AI Writing",
      description:
        "Think it. Type it. Watch it turn viral. Posts that sound like you, not a robot — crafted for engagement, not just grammar.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
          />
        </svg>
      ),
    },
    {
      title: "Emotion-Aware Intelligence",
      description:
        "It senses your vibe. Casual, bold, or subtle — SagePostAI mirrors your tone without prompts.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Smart Hashtags + Emojis",
      description:
        "Looks real. Works better. Context-aware enhancers that boost reach without feeling forced.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      title: "Platform-Tailored Output",
      description:
        "LinkedIn ≠ Twitter. We get it. Each post is fine-tuned for its platform — format, tone, and style aligned.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
    {
      title: "Fast, Frictionless Output",
      description:
        "Under 2 seconds. Every time. Post-ready. Always. No delays. Just copy, paste, and publish — effortlessly.",
      icon: () => (
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-gray-800">
          Why Choose SagePostAI?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map(({ title, description, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#f5f7ff] to-[#e0e7ff] shadow-md transition-all duration-300"
            >
              <Icon />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-indigo-800">
                {title}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
