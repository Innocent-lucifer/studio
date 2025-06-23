import React, { useRef } from "react";
import { motion, useAnimation } from "framer-motion";

export default function Testimonials() {
  const testimonials = [
    {
      quote: "SagePostAI doubled my engagement in just a week!",
      name: "Emily R.",
      role: "Social Media Strategist",
    },
    {
      quote: "The automation saves me hours every day—amazing tool!",
      name: "Carlos M.",
      role: "Content Creator",
    },
    {
      quote: "Best AI tool for social media I’ve ever used.",
      name: "Sophie L.",
      role: "Marketing Lead",
    },
    {
      quote: "It feels like SagePostAI knows my brand perfectly!",
      name: "Liam J.",
      role: "Startup Founder",
    },
    {
      quote: "Content creation is now effortless and fast.",
      name: "Ava D.",
      role: "Freelance Writer",
    },
    {
      quote: "The tone-matching feature is a game-changer.",
      name: "Rohan P.",
      role: "Marketing Consultant",
    }, // Keeping one Indian name
  ];

  const controls = useAnimation();
  const containerRef = useRef(null);

  const TestimonialCard = ({ quote, name, role }) => (
    <motion.div
      className="min-w-[360px] sm:min-w-[400px] h-auto bg-white/90 border border-indigo-200 hover:shadow-xl transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
      whileHover={{ scale: 1.04 }}
    >
      <p className="text-gray-800 text-base sm:text-lg italic mb-4 line-clamp-4">
        “{quote}”
      </p>
      <div className="text-left">
        <p className="text-indigo-600 font-semibold text-sm">{name}</p>
        <p className="text-gray-500 text-xs">{role}</p>
      </div>
    </motion.div>
  );

  return (
    <section
      id="testimonials"
      className="relative py-20 px-6 sm:px-10 bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#a5b4fc] text-gray-900 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-12 text-gray-900">
          What Our Global Users Say 🌍
        </h2>
        <div
          ref={containerRef}
          className="overflow-hidden relative"
          onMouseEnter={() => controls.stop()}
          onMouseLeave={() =>
            controls.start({
              x: ["0%", "-50%"],
              transition: {
                x: { duration: 40, repeat: Infinity, ease: "linear" },
              },
            })
          }
        >
          <motion.div
            className="flex gap-6"
            animate={controls}
            initial={{ x: "0%" }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </motion.div>

          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#e0e7ff] to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#e0e7ff] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
