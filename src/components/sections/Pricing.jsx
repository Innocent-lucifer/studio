import React from "react";
import { motion } from "framer-motion";
import { MdOutlineCheckCircle } from "react-icons/md";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const cardVariantsPricing = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function Pricing({ plans }) {
  return (
    <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 sm:mb-8">
          Simple, Transparent Pricing
        </h2>
        <div className="flex items-center justify-center gap-2 text-purple-700 font-semibold text-sm sm:text-base mb-2 sm:mb-3">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" />
          <span>
            Launching-only Pricing — lifetime access at early-bird value
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-10">
          Choose the plan that’s right for you — no subscriptions, no surprises.
        </p>

        <motion.div
          className="flex flex-col md:flex-row justify-center items-stretch gap-6 md:gap-10 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.title}
              variants={cardVariantsPricing}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: {
                  duration: 0.1,
                  ease: "easeOut",
                },
              }}
              className={`relative w-full md:w-[48%] h-full flex flex-col justify-between mx-auto rounded-2xl p-10 sm:p-12 bg-[#ffffff]/90 shadow-xl border-2 will-change-transform ${
                plan.borderClass || "border-indigo-200"
              } transition-all duration-100 hover:shadow-2xl ${
                plan.badge ? "z-10 ring-2 ring-indigo-300 scale-[1.02]" : ""
              }`}
            >
              {plan.badge && (
                <motion.div
                  className={`absolute -top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md bg-gradient-to-r ${
                    plan.badgeClass || "from-purple-600 to-indigo-500"
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                >
                  {plan.badge}
                </motion.div>
              )}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 text-indigo-700">
                  {plan.title}
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-2">
                  {plan.price}
                </p>
                <p className="text-gray-600 text-sm font-semibold mb-6">
                  {plan.subtitle}
                </p>
                <Link href="/login">
                  <button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transform hover:scale-105 text-white font-bold py-2 sm:py-3 rounded-xl text-sm sm:text-base shadow-md mb-8 transition duration-100">
                    Try 3 Days Free
                  </button>
                </Link>
              </div>
              <ul className="text-left space-y-4">
                {plan.features.map((feat, i) => (
                  <motion.li
                    key={i}
                    className={`flex items-center text-gray-800 text-sm font-semibold ${
                      feat.includes("Everything in") ? "justify-center" : ""
                    }`}
                    whileHover={{ x: 5, transition: { duration: 0.2 } }}
                  >
                    {!feat.includes("Everything in") && (
                      <motion.span
                        whileHover={{
                          scale: 1.2,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <MdOutlineCheckCircle className="text-green-500 text-lg mr-2 min-w-[18px]" />
                      </motion.span>
                    )}
                    <span dangerouslySetInnerHTML={{ __html: feat }} />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
