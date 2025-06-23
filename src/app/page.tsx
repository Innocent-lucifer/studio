
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import BuiltWith from "@/components/sections/BuiltWith";
import ProblemSolution from "@/components/sections/ProblemSolution";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Comparison from "@/components/sections/Comparison";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";
import SEO from "@/components/SEO";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState(null);
  const loopText = "Enter topic to see the magic";
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (inputText) return;
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplayText(loopText.substring(0, index + 1));
        if (index + 1 === loopText.length) {
          setTimeout(() => setDeleting(true), 2000);
        } else {
          setIndex((prev) => prev + 1);
        }
      } else {
        setDisplayText(loopText.substring(0, index - 1));
        if (index - 1 === 0) {
          setDeleting(false);
        }
        setIndex((prev) => prev - 1);
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [index, deleting, loopText, inputText]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };
  
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    if(menuOpen) setMenuOpen(false);
  };

  const navLinks = [
    { name: "Features", href: "#features", onClick: (e) => handleScrollToSection(e, 'features') },
    { name: "Testimonials", href: "#testimonials", onClick: (e) => handleScrollToSection(e, 'testimonials') },
    { name: "Pricing", href: "#pricing", onClick: (e) => handleScrollToSection(e, 'pricing') },
    { name: "FAQ", href: "#faq", onClick: (e) => handleScrollToSection(e, 'faq') }
  ];

  const plans = [
  {
    title: "Monthly",
    price: "$19.99",
    subtitle: "Try 3 days free, then $19.99/month",
    borderClass: "border-indigo-300",
    features: [
      " Unlimited Generations",
      " Image to Post Wizard",
      " Quick Post Generator",
      " Smart Campaign Builder",
      " Upload image & get content ideas",
      " Tone Styler (auto-matches human, casual, or pro)",
      " Visibility Booster (adds optimal emojis & hashtags)",
      " AI Post Editor (Auto cleans grammar & flow instantly)",
      " Copy & export posts anytime",
      " Post history access",
      " Private Creator Community"
    ]
  },
  {
    title: "Yearly",
    price: "$197",
    subtitle: "Try 3 days free, then $197/year (~$16/mo)",
    badge: "BEST VALUE",
    badgeClass: "from-purple-600 to-indigo-500",
    borderClass: "border-purple-500 ring-2 ring-indigo-300",
    features: [
       " Unlimited Generations",
      " Image to Post Wizard",
      " Quick Post Generator",
      " Smart Campaign Builder",
      " Upload image & get content ideas",
      " Tone Styler (auto-matches human, casual, or pro)",
      " Visibility Booster (adds optimal emojis & hashtags)",
      " AI Post Editor (Auto cleans grammar & flow instantly)",
      " Copy & export posts anytime",
      " Post history access",
      " Private Creator Community"
    ]
  }
];

  const faqs = [
  {
    q: "How does SagePostAI actually create social media content?",
    a: "SagePostAI combines your topic input with real-time research, brand tone detection, and formatting intelligence to generate professional-grade posts for LinkedIn and Twitter instantly."
  },
  {
    q: "What makes SagePostAI better than other AI tools?",
    a: "We go beyond templates. SagePostAI uses tone styling, grammar cleaning, emoji optimization, and post enrichment to match human-like writing that resonates and performs well."
  },
  {
    q: "Can I generate content using an image or screenshot?",
    a: "Yes! With the Image-to-Post Wizard, you can upload an image or screenshot and SagePostAI will extract key insights, detect context, and generate a relevant post instantly."
  },
  {
    q: "How does the Tone Styler feature work?",
    a: "Tone Styler detects your intended style — casual, professional, or personal — and automatically adjusts sentence flow, wording, and punctuation to match it precisely."
  },
  {
    q: "What is the Smart Campaign Builder?",
    a: "It’s a power feature that lets you plan 3–5 AI posts around a single idea or goal. It generates themed posts for a product launch, a story arc, or an educational series."
  },
  {
    q: "Can I edit the generated posts?",
    a: "Yes. The AI Post Editor helps you clean up grammar, improve sentence clarity, or rephrase sections without losing the original meaning — with one click."
  },
  {
    q: "Do I get hashtags and emojis automatically?",
    a: "Absolutely. Our Visibility Booster adds high-engagement hashtags and relevant emojis to make your post stand out while preserving professionalism and tone."
  },
  {
    q: "Do I need experience with social media to use SagePostAI?",
    a: "Not at all. If you can type a topic, you're ready. We built this tool for founders, creators, marketers, and even students — no prior expertise needed."
  },
  {
    q: "Is there a free trial?",
    a: "Yes. You get 3 days of full access to explore all premium features with unlimited generations — no card required."
  },
  {
    q: "What are the pricing options?",
    a: "You can choose a Monthly Plan ($19.99/month) or Yearly Plan ($197/year). All plans include unlimited AI generations and full access to every feature."
  }
];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#a5b4fc] text-gray-900">
      <SEO />
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        navLinks={navLinks}
      />
      <main className="pt-10 sm:pt-14 flex-grow">
        <Hero
          inputFocused={inputFocused}
          setInputFocused={setInputFocused}
          inputText={inputText}
          setInputText={setInputText}
          displayText={displayText}
        />
        <BuiltWith />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <Comparison />
        <Testimonials />
        <Pricing plans={plans} />
        <FAQ faqs={faqs} openFAQIndex={openFAQIndex} toggleFAQ={toggleFAQ} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
