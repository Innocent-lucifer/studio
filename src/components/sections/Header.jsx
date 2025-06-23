import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, X } from "lucide-react";

const childVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

// Helper scroll function (slower)
const smoothScrollTo = (id) => {
  const section = document.getElementById(id);
  if (section) {
    const y = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

export default function Header({
  scrolled,
  menuOpen,
  toggleMenu,
  handleReload,
}) {

  return (
    <header
      className={`relative md:fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-sm md:shadow-none ${
        scrolled
          ? "bg-[#4338db]/90 shadow-lg backdrop-blur-lg rounded-b-2xl"
          : "bg-[#4F46E5] rounded-b-2xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-[13.5px] flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleReload}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          <img
            src="https://placehold.co/48x48.png"
            alt="SagePostAI Logo"
            width="24"
            height="24"
            data-ai-hint="sage logo"
            className="h-[36px] md:h-[57.6px] w-auto transition-transform duration-300 hover:rotate-6 brightness-0 invert"
          />
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide hover:tracking-wider transition-all duration-300">
            SagePostAI
          </span>
        </motion.div>

        {/* Mobile Menu Toggle */}
        <motion.div
          className="md:hidden"
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          <button onClick={toggleMenu} className="text-white p-2">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          className={`${
            menuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-[#4F46E5] md:bg-transparent px-4 sm:px-6 md:px-0 py-4 md:p-0 space-y-2 md:space-y-0 md:space-x-6 text-sm sm:text-base font-semibold md:justify-end md:items-center`}
          variants={childVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Replace “Future Vision” with Comparison scroll */}
          <button
            onClick={() => {
              smoothScrollTo("comparison");
              if (menuOpen) toggleMenu();
            }}
            className="text-white/90 hover:text-[#A5B4FC] relative py-2 md:py-1 transition duration-300 after:block after:h-0.5 after:bg-[#A5B4FC] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
          >
            Why SagePostAI
          </button>

          <button
            onClick={() => {
              smoothScrollTo("pricing");
              if (menuOpen) toggleMenu();
            }}
            className="text-white/90 hover:text-[#A5B4FC] relative py-2 md:py-1 transition duration-300 after:block after:h-0.5 after:bg-[#A5B4FC] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
          >
            Pricing
          </button>

          {/* About Team */}
          <Link
            href="/about-team"
            className="relative text-white/90 transition duration-300 inline-block after:block after:h-0.5 after:bg-[#A5B4FC] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left after:duration-300 hover:text-[#A5B4FC] py-2 md:py-1 leading-none"
            onClick={() => {if (menuOpen) toggleMenu();}}
          >
            About Team
          </Link>

          {/* You can remove this if Contact isn’t needed */}
          <Link
            href="/contact"
            className={`text-white/90 hover:text-[#A5B4FC] relative py-2 md:py-1 transition duration-300 after:block after:h-0.5 after:bg-[#A5B4FC] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left`}
            onClick={() => {if (menuOpen) toggleMenu();}}
          >
            Contact
          </Link>

          <a
            href="https://www.nexushive.in"
            className="bg-white text-[#4F46E5] px-4 sm:px-5 py-2 rounded-xl hover:bg-gray-100 transition shadow-md font-semibold hover:scale-105 duration-300"
            onClick={() => {if (menuOpen) toggleMenu();}}
          >
            Try it Free
          </a>
        </motion.nav>
      </div>
    </header>
  );
}
