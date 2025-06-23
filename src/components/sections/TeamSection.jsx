import React from "react";
import { motion } from "framer-motion";
import { FaUser, FaLinkedin, FaTwitter } from "react-icons/fa";

const founders = [
  {
    name: "Rishabh Nauhowar",
    title: "Founder & Product Strategist",
    desc: "Leads product vision, development, and AI systems. Focused on building experiences that scale.",
    linkedin: "https://linkedin.com/in/rishabh-kumarr/",
    twitter: "https://x.com/ChilledCeo?s=09",
  },
  {
    name: "Siddharth Gaur",
    title: "Co-founder & Growth Strategist",
    desc: "Handles outreach, customer acquisition, and market-fit strategy. Ensures we solve real problems.",
    linkedin: "https://linkedin.com/in/siddharthgaur01/",
    twitter: "https://x.com/siddharthg17481?t=8fofWw3WkJaus7_wXm_Z9A&s=09",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="px-5 sm:px-6 py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Meet the Makers
        </h2>
        <p className="text-gray-600 text-base sm:text-lg">
          We’re a duo of 15-year-old founders building fast, solving real
          problems, and shipping tools that matter.
        </p>
      </div>

      {/* Founder Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
      >
        {founders.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-6 rounded-2xl text-center shadow hover:shadow-lg transition duration-200"
          >
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-indigo-600 text-2xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              {member.name}
            </h3>
            <p className="text-sm text-indigo-600 font-medium">
              {member.title}
            </p>
            <p className="text-gray-600 text-sm mt-2">{member.desc}</p>
            <div className="flex gap-4 justify-center mt-4">
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-indigo-600 hover:text-indigo-800 text-xl transition" />
                </a>
              )}
              {member.twitter && (
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter className="text-indigo-600 hover:text-indigo-800 text-xl transition" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Our Story & Sections */}
      <div className="max-w-3xl mx-auto mt-20 space-y-12 text-center">
        <div>
          <h3 className="text-2xl font-bold mb-2">Our Story</h3>
          <p className="text-gray-600 text-base">
            We’re both 15. SagePostAI was born during a technical block on our
            bigger project. Rishabh built the first version in just 20 hours
            straight. We realized great ideas often die in silence because
            writing posts is hard and inconsistent — so we decided to fix that.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">What We’ve Built So Far</h3>
          <p className="text-gray-600 text-base">
            Rishabh has built an AI chatbot in under 18 hours, an AI Ghibli
            image generator app, several websites with real-world impact, and
            more. We also created and scaled an online store called ZenithCart
            and a social media agency PixelHiveStudio. Currently, we’re working
            on two stealth projects — <strong>NexusHive</strong>, which could
            redefine how industries work, and another that might launch a new
            kind of tech.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Where We’re Going</h3>
          <p className="text-gray-600 text-base">
            We’re focused on building real tools that save time, create
            leverage, and empower people — creators, solopreneurs, and teams — to
            scale their ideas with less friction.
          </p>
        </div>

        <div>
          <h3 className="text-2xl font-bold mb-2">Why We Care</h3>
          <p className="text-gray-600 text-base">
            We deeply care about technology — not just building for hype, but
            building to help. The right tech, in the right hands, can unlock
            huge change. We’re here to build that.
          </p>
        </div>
      </div>
    </section>
  );
}
