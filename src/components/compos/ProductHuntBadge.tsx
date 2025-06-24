
"use client";

import { Triangle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductHuntBadge() {
  return (
    <motion.a
      href="https://www.producthunt.com/posts/sagepostai"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-between space-x-4 bg-background text-[#FF6154] border border-[#FF6154]/50 rounded-xl px-4 py-2 font-semibold shadow-lg transition-all duration-300 ease-in-out hover:bg-[#FF6154] hover:text-white hover:shadow-xl hover:shadow-[#FF6154]/30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-[#FF6154] text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center text-lg">
          P
        </div>
        <div className="text-left leading-tight">
          <div className="text-xs font-bold leading-none text-foreground/70">FEATURED ON</div>
          <div className="text-base font-bold leading-tight">Product Hunt</div>
        </div>
      </div>
      <div className="flex flex-col items-center pl-4 border-l border-[#FF6154]/30">
        <Triangle className="w-4 h-4 fill-current mb-0.5" />
        <span className="text-base font-bold leading-none">1.2k</span>
      </div>
    </motion.a>
  );
}

    