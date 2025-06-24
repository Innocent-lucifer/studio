
"use client";

import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

export default function Comparison() {
  const comparisonData = [
    {
      task: "Post Generation Speed",
      sage: (
        <>
          <Zap className="inline-block w-4 h-4 text-accent mr-2" />
          <span className="text-primary">Instant (&lt;2s)</span>
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
          <span className="text-primary">Text + Image Support</span>
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
          <span className="text-primary">Mirrors Your Style</span>
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
          <span className="text-primary">Smart & Contextual</span>
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
          <span className="text-primary">Auto-Tailored</span>
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
          <span className="text-primary">Built-In Feature</span>
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
          <span className="text-primary">Real-Time Trends</span>
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
          <span className="text-primary">(Sage Infinity Plan)</span>
        </>
      ),
      others: "Credit Capped",
      speed: "",
    },
    {
      task: "Conclusion",
      sage: <span className="text-primary">Fast. Smart. Emotionally Tuned.</span>,
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
          whileHover={{ y: -5, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
          className="rounded-2xl overflow-hidden bg-background shadow-lg border border-border"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
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
                    whileHover={{ backgroundColor: "hsl(var(--secondary))" }}
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
