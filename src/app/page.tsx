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
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };
  
  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    if (menuOpen) setMenuOpen(false);
  };

  const navLinks = [
    { name: "Why SagePostAI", href: "#comparison", onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScrollToSection(e, 'comparison') },
    { name: "Pricing", href: "#pricing", onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScrollToSection(e, 'pricing') },
    { name: "About", href: "/about-team" },
    { name: "Contact", href: "/contact" }
  ];

  const plans = [
    {
      title: "Monthly",
      price: "$19.99",
      subtitle: "Try 3 days free, then $19.99/month",
      borderClass: "border-slate-700",
      features: [
        "Unlimited Generations",
        "Image to Post Wizard",
        "Quick Post Generator",
        "Smart Campaign Builder",
        "Upload image & get content ideas",
        "Tone Styler (auto-matches human, casual, or pro)",
        "Visibility Booster (adds optimal emojis & hashtags)",
        "AI Post Editor (Auto cleans grammar & flow instantly)",
        "Copy & export posts anytime",
        "Post history access",
        "Private Creator Community"
      ]
    },
    {
      title: "Yearly",
      price: "$197",
      subtitle: "Try 3 days free, then $197/year (~$16/mo)",
      badge: "BEST VALUE",
      badgeClass: "from-primary to-accent",
      borderClass: "border-primary ring-2 ring-primary/50",
      features: [
        "Unlimited Generations",
        "Image to Post Wizard",
        "Quick Post Generator",
        "Smart Campaign Builder",
        "Upload image & get content ideas",
        "Tone Styler (auto-matches human, casual, or pro)",
        "Visibility Booster (adds optimal emojis & hashtags)",
        "AI Post Editor (Auto cleans grammar & flow instantly)",
        "Copy & export posts anytime",
        "Post history access",
        "Private Creator Community"
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
      a: "Yes. You get 3 days of full access to explore all premium features with unlimited generations."
    },
    {
      q: "What are the pricing options?",
      a: "You can choose a Monthly Plan ($19.99/month) or Yearly Plan ($197/year). All plans include unlimited AI generations and full access to every feature."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        navLinks={navLinks}
        user={user}
      />
      <main className="flex-grow">
        <Hero />
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
