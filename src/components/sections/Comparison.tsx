
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

export default function Comparison() {
  const comparisonData = [
    {
      task: "Post Generation Speed",
      sage: (
        <>
          <Zap className="inline-block w-4 h-4 text-primary mr-2" />
          <span>Instant (&lt;2s)</span>
        </>
      ),
      others: "5–10s",
      speed: "Real-Time",
    },
    {
      task: "AI Research + Visual Input",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Text + Image Support
        </>
      ),
      others: "Text Only",
      speed: "",
    },
    {
      task: "Human-like Tone & Emotion",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Mirrors Your Style
        </>
      ),
      others: "Robotic & Flat",
      speed: "",
    },
    {
      task: "Hashtag & Emoji Automation",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Smart & Contextual
        </>
      ),
      others: "Manual & Random",
      speed: "",
    },
    {
      task: "Platform-Specific Formatting",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Auto-Tailored
        </>
      ),
      others: "One-Size-Fits-All",
      speed: "",
    },
    {
      task: "Multi-Post Campaigns",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Built-In Feature
        </>
      ),
      others: "Not Available",
      speed: "",
    },
    {
      task: "Trending Topic Insights",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          Real-Time Trends
        </>
      ),
      others: "No Trend Detection",
      speed: "",
    },
    {
      task: "Unlimited Generation",
      sage: (
        <>
          <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
          (Sage Infinity Plan)
        </>
      ),
      others: "Credit Capped",
      speed: "",
    },
    {
      task: "Conclusion",
      sage: "Fast. Smart. Emotionally Tuned.",
      others: "Slow. Generic. Prompt-Heavy.",
      speed: "Real-Time",
    },
  ];

  return (
    <section id="comparison" className="px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold mb-12 text-foreground"
        >
          Why SagePostAI Stands Out
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px -5px hsl(var(--primary)/0.1)" }}
          className="rounded-2xl overflow-hidden bg-secondary shadow-lg border border-border"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="p-4 text-sm font-semibold text-foreground/80">Feature</th>
                  <th className="p-4 text-sm font-semibold text-primary">SagePostAI</th>
                  <th className="p-4 text-sm font-semibold text-foreground/50">Other Tools</th>
                  <th className="p-4 text-sm font-semibold text-accent">Speed</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(({ task, sage, others, speed }, index) => (
                  <motion.tr
                    key={task}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ backgroundColor: "hsl(var(--background))" }}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="p-4 text-sm font-medium text-foreground">{task}</td>
                    <td className="p-4 text-sm font-semibold text-foreground">{sage}</td>
                    <td className="p-4 text-sm text-foreground/60">{others}</td>
                    <td className="p-4 text-sm font-semibold text-accent">{speed}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
