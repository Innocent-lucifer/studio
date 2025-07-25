
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle } from "lucide-react";

interface ComparisonProps {
  title: string;
  headers: {
    feature: string;
    sage: string;
    others: string;
    speed: string;
  };
  data: {
    task: string;
    sage: string;
    others: string;
    speed: string;
  }[];
}

const SageCell: React.FC<{ content: string }> = ({ content }) => {
  if (content.includes("Instant")) {
    return (
      <>
        <Zap className="inline-block w-4 h-4 text-accent mr-2" />
        <span className="text-primary">{content}</span>
      </>
    );
  }
  if (content.includes("Plan")) {
    return (
      <>
        <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
        <span className="text-primary">{content}</span>
      </>
    );
  }
  if (content.startsWith("Fast")) {
     return <span className="text-primary">{content}</span>;
  }
  return (
    <>
      <CheckCircle className="inline-block w-4 h-4 text-green-500 mr-2" />
      <span className="text-primary">{content}</span>
    </>
  );
};

const ComparisonComponent: React.FC<ComparisonProps> = ({ title, headers, data }) => {
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
          {title}
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
                  <th className="p-4 text-sm font-semibold text-foreground/80">{headers.feature}</th>
                  <th className="p-4 text-sm font-semibold text-primary">{headers.sage}</th>
                  <th className="p-4 text-sm font-semibold text-foreground/50">{headers.others}</th>
                  <th className="p-4 text-sm font-semibold text-accent">{headers.speed}</th>
                </tr>
              </thead>
              <tbody>
                {data.map(({ task, sage, others, speed }, index) => (
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
                    <td className="p-4 text-sm font-semibold text-foreground">
                      <SageCell content={sage} />
                    </td>
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
};

export default React.memo(ComparisonComponent);
