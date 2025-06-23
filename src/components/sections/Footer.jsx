import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Twitter, Linkedin } from "lucide-react";

export default function Footer({ handleReload }) {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-tr from-[#4F46E5] to-[#4338CA] text-white py-[3.6] sm:py-[5.4] mt-12 sm:mt-16 rounded-t-2xl rounded-b-0"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 mb-4 cursor-pointer"
          onClick={handleReload}
        >
          <img
            src="https://placehold.co/48x48.png"
            alt="Logo"
            width="48"
            height="48"
            data-ai-hint="sage logo"
            className="h-[36px] md:h-[48px] w-auto brightness-0 invert transition-transform duration-300 hover:rotate-6"
            loading="lazy"
            decoding="async"
          />
          <span className="font-semibold text-white text-sm sm:text-base hover:tracking-wider transition-all duration-300">
            SagePostAI
          </span>
        </motion.div>

        {/* Footer Links */}
        <div className="sm:col-span-1 lg:col-span-2 flex flex-col sm:flex-row sm:justify-between sm:gap-8 lg:gap-12">
          {/* Product Section */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-2 text-xs sm:text-base text-white">
              Product
            </h4>
            <ul className="space-y-1 py-1">
              <li>
                <a
                  href="#problem-solution"
                  className="hover:underline text-white"
                >
                  Problem & Solution
                </a>
              </li>
              <li>
                <a href="#features" className="hover:underline text-white">
                  Features
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:underline text-white">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="flex flex-col">
            <h4 className="font-semibold mb-2 text-xs sm:text-base text-white">
              Support
            </h4>
            <ul className="space-y-1 py-1">
              <li>
                <a href="#faq" className="hover:underline text-white">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:underline text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:underline text-white">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="flex flex-col mt-6 sm:mt-0">
            <h4 className="font-semibold mb-2 text-xs sm:text-base text-white">
              Legal
            </h4>
            <ul className="space-y-1 py-1">
              <li>
                <Link
                  href="/PrivacyPolicy"
                  className="hover:underline text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:underline text-white"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/Refund" className="hover:underline text-white">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/Cookie-Policy"
                  className="hover:underline text-white"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/Disclaimer" className="hover:underline text-white">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social Icons Placeholder */}
      <div className="flex justify-center space-x-3 mt-4">
        <a href="#" aria-label="Twitter" className="hover:scale-110 transition">
          <Twitter className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
        </a>
        <a href="#" aria-label="LinkedIn" className="hover:scale-110 transition">
          <Linkedin className="h-3 sm:h-4 w-3 sm:w-4 text-white" />
        </a>
      </div>

      {/* Copyright */}
      <p className="text-center text-[0.55rem] sm:text-[0.7rem] text-white/70 mt-4 mb-4 sm:mb-6 tracking-tight">
        © {new Date().getFullYear()} SagePostAI. All rights reserved.
      </p>
    </motion.footer>
  );
}
