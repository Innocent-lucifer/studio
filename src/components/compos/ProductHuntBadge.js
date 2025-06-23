import React from "react";
import { Triangle } from "lucide-react";

export default function ProductHuntBadge() {
  return (
    <a
      href="https://www.producthunt.com/posts/your-product-name"
      target="_blank"
      rel="noopener noreferrer"
      className="
          inline-flex items-center justify-between space-x-4
          bg-white text-[#FF6154] border border-[#FF6154]
          rounded-xl px-6 py-[10.8px]
          font-semibold
          shadow-md
          transition-all duration-300 ease-in-out
          min-w-[264px]
          hover:bg-[#FF6154] hover:text-white hover:shadow-lg hover:scale-105
        "
    >
      <div className="flex items-center space-x-2.5">
        <div className="bg-[#FF6154] text-white font-bold rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors duration-300 hover:bg-white hover:text-[#FF6154]">
          P
        </div>
        <div className="text-left leading-tight">
          <div className="text-[11px] font-bold leading-none">FEATURED ON</div>
          <div className="text-[15px] font-bold leading-tight">Product Hunt</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Triangle className="w-4 h-4 fill-current mb-0.5" />
        <span className="text-[15px] font-bold leading-none">000</span>
      </div>
    </a>
  );
}
