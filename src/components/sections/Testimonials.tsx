
"use client";

import React, { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

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
  },
];

const TestimonialCard = ({ quote, name, role }: { quote: string; name: string; role: string }) => (
  <motion.div
    className="min-w-[320px] sm:min-w-[360px] h-auto bg-background border border-border rounded-2xl p-8 flex flex-col justify-between shadow-lg"
  >
    <p className="text-foreground/80 text-lg italic mb-6">
      “{quote}”
    </p>
    <div className="text-left">
      <p className="text-primary font-semibold">{name}</p>
      <p className="text-foreground/60 text-sm">{role}</p>
    </div>
  </motion.div>
);

export default function Testimonials() {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controls.start({
        x: ["0%", "-100%"],
        transition: {
          x: { duration: 40, repeat: Infinity, ease: "linear", repeatType: "loop" },
        },
    });
  }, [controls]);

  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 text-foreground overflow-hidden"
    >
      <div className="max-w-7xl mx-auto text-center px-4">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-12 text-foreground">
          What Our Global Users Say 🌍
        </motion.h2>
        <div
          ref={containerRef}
          className="overflow-hidden relative"
          onMouseEnter={() => controls.stop()}
          onMouseLeave={() => controls.start({
            x: ["0%", "-100%"],
            transition: {
              x: { duration: 40, repeat: Infinity, ease: "linear", repeatType: "loop" },
            },
        })}
        >
          <motion.div
            className="flex gap-8"
            animate={controls}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`testimonial-${i}`} {...t} />
            ))}
          </motion.div>
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
