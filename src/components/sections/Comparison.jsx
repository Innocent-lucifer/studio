import React from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { MdOutlineCheckCircle } from "react-icons/md";

export default function Comparison() {
  const comparisonData = [
    {
      task: "Post Generation Speed",
      sage: (
        <>
          <motion.span whileHover={{ scale: 1.2 }}>
            <Zap className="inline-block w-4 h-4 text-indigo-600 mr-1" />
          </motion.span>
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
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
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
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
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
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
          Smart Contextual
        </>
      ),
      others: "Manual & Random",
      speed: "",
    },
    {
      task: "Platform-Specific Formatting",
      sage: (
        <>
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
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
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
          Built-In
        </>
      ),
      others: "Not Available",
      speed: "",
    },
    {
      task: "Trending Topic Insights",
      sage: (
        <>
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
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
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
          (Sage Infinity)
        </>
      ),
      others: "Credit Capped",
      speed: "",
    },
    {
      task: "Private Community Access",
      sage: (
        <>
          <motion.span whileHover={{ scale: 1.2 }}>
            <MdOutlineCheckCircle className="inline-block w-4 h-4 text-green-500 mr-1" />
          </motion.span>{" "}
          Included in All Plans
        </>
      ),
      others: "None",
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
    <section id="comparison" className="px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-gray-800"
        >
          Why SagePostAI Stands Out
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden bg-[#ffffff]/90 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-2 border-indigo-200"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-200">
                  <th className="p-4 text-sm sm:text-base font-bold text-indigo-700">
                    Feature
                  </th>
                  <th className="p-4 text-sm sm:text-base font-bold text-indigo-700">
                    SagePostAI
                  </th>
                  <th className="p-4 text-sm sm:text-base font-bold text-gray-500">
                    Other Tools
                  </th>
                  <th className="p-4 text-sm sm:text-base font-bold text-indigo-600">
                    Speed
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(({ task, sage, others, speed }, index) => (
                  <motion.tr
                    key={task}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className={`transition duration-300 hover:bg-indigo-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-[#f3f4f6]"
                    }`}
                  >
                    <td className="p-4 text-sm sm:text-base font-medium text-indigo-700">
                      {task}
                    </td>
                    <td className="p-4 text-sm sm:text-base font-semibold text-indigo-800">
                      {sage}
                    </td>
                    <td className="p-4 text-sm sm:text-base text-gray-600">
                      {others}
                    </td>
                    <td className="p-4 text-sm sm:text-base font-semibold text-indigo-600">
                      {speed}
                    </td>
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
