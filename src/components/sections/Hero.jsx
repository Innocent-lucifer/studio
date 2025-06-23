import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import ProductHuntBadge from "../compos/ProductHuntBadge";
import { useRouter } from 'next/router';

export default function Hero({
  inputFocused,
  setInputFocused,
  inputText,
  setInputText,
  displayText,
}) {

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/quick-post?topic=${encodeURIComponent(inputText)}`);
  };
  
  return (
    <section className="px-5 sm:px-6 py-12 sm:py-16 lg:py-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 sm:items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 sm:mb-7 leading-tight">
            Automate Social Media <br />
            <span className="text-indigo-600">Dominate with AI</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            SagePostAI helps you plan, write, and publish social media content
            effortlessly — with zero-effort automation.
          </p>

          {/* Input + Button */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 sm:ml-[-20px]">
            <input
              type="text"
              className={`w-full sm:w-[72%] px-5 py-[1rem] text-sm sm:text-base rounded-2xl shadow-lg transition-all duration-300 outline-none ${
                inputFocused ? "ring-2 ring-indigo-400" : ""
              }`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder={displayText}
            />
            <button type="submit" className="w-full sm:w-[26%] px-5 py-[1rem] bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white font-bold rounded-2xl text-sm sm:text-base hover:scale-105 transition duration-300 shadow-md">
              Generate Posts
            </button>
          </form>

          {/* Subheadline */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mt-4 flex items-center text-sm sm:text-base text-indigo-600 font-medium cursor-default"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
            Let AI research and generate posts for you — unlimited, free, no
            credit card needed.
          </motion.div>

          {/* Product Hunt Badge */}
          <div className="mt-6 sm:mt-8">
            <ProductHuntBadge />
          </div>
        </div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 0.8,
            scale: {
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            },
          }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="w-full h-[220px] sm:h-[300px] md:h-[384px] bg-gradient-to-br from-[#f5f7ff] to-[#e0e7ff] rounded-2xl shadow-xl flex items-center justify-center text-indigo-500 font-semibold text-sm sm:text-base"
        >
          Product Preview Coming Soon
        </motion.div>
      </div>
    </section>
  );
}
