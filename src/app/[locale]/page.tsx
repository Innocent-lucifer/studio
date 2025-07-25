
"use client";

import React, { useEffect, useState, lazy, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/sections/Footer";
import { useAuth } from "@/context/AuthContext";
import { Icons } from "@/components/icons";
import { useTranslations } from 'next-intl';

// Lazy-loaded components
const BuiltWith = lazy(() => import("@/components/sections/BuiltWith"));
const ProblemSolution = lazy(() => import("@/components/sections/ProblemSolution"));
const Features = lazy(() => import("@/components/sections/Features"));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks"));
const Comparison = lazy(() => import("@/components/sections/Comparison"));
const Testimonials = lazy(() => import("@/components/sections/Testimonials"));
const Pricing = lazy(() => import("@/components/sections/Pricing"));
const FAQ = lazy(() => import("@/components/sections/FAQ"));
const CTA = lazy(() => import("@/components/sections/CTA"));

const SectionLoader = () => (
  <div className="flex justify-center items-center py-20">
    <Icons.loader className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations('LandingPage');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const toggleFAQ = useCallback((index: number) => {
    setOpenFAQIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);
  
  const handleScrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen((prev) => {
      if(prev) return false;
      return prev;
    });
  }, []);

  const navLinks = [
    { name: t('navLinks.why'), href: "#comparison", onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScrollToSection(e, 'comparison') },
    { name: t('navLinks.pricing'), href: "#pricing", onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScrollToSection(e, 'pricing') },
    { name: t('navLinks.about'), href: "/about-team" },
    { name: t('navLinks.contact'), href: "/contact" }
  ];

  const plans = [
    {
      title: t('pricing.monthly.title'),
      price: "$19.99",
      subtitle: t('pricing.monthly.subtitle'),
      borderClass: "border-border",
      features: [
        t('pricing.features.unlimited'),
        t('pricing.features.imageWizard'),
        t('pricing.features.quickPost'),
        t('pricing.features.campaignBuilder'),
        t('pricing.features.uploadImage'),
        t('pricing.features.toneStyler'),
        t('pricing.features.visibilityBooster'),
        t('pricing.features.aiEditor'),
        t('pricing.features.copyExport'),
        t('pricing.features.savedHistory'),
      ],
      priceId: process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID?.trim() || ""
    },
    {
      title: t('pricing.yearly.title'),
      price: "$197",
      subtitle: t('pricing.yearly.subtitle'),
      badge: t('pricing.yearly.badge'),
      badgeClass: "from-primary to-accent",
      discountBadge: t('pricing.yearly.discountBadge'),
      borderClass: "border-primary ring-2 ring-primary/50",
      features: [
        t('pricing.features.unlimited'),
        t('pricing.features.imageWizard'),
        t('pricing.features.quickPost'),
        t('pricing.features.campaignBuilder'),
        t('pricing.features.uploadImage'),
        t('pricing.features.toneStyler'),
        t('pricing.features.visibilityBooster'),
        t('pricing.features.aiEditor'),
        t('pricing.features.copyExport'),
        t('pricing.features.savedHistory'),
      ],
      priceId: process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID?.trim() || ""
    }
  ];

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
    { q: t('faq.q6'), a: t('faq.a6') },
    { q: t('faq.q7'), a: t('faq.a7') },
    { q: t('faq.q8'), a: t('faq.a8') },
    { q: t('faq.q9'), a: t('faq.a9') },
    { q: t('faq.q10'), a: t('faq.a10') },
  ];

  return (
    <div className="flex flex-col min-h-screen text-foreground">
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        navLinks={navLinks}
        user={user}
        tryForFreeText={t('header.tryForFree')}
        goToAppText={t('header.goToApp')}
      />
      <main className="flex-grow">
        <Hero 
          title1={t('hero.title1')}
          title2={t('hero.title2')}
          subtitle={t('hero.subtitle')}
          buttonText={t('hero.buttonText')}
          trialInfo={t('hero.trialInfo')}
        />
        <Suspense fallback={<SectionLoader />}>
          <BuiltWith />
          <ProblemSolution />
          <Features />
          <HowItWorks />
          <Comparison />
          <Testimonials />
          <Pricing plans={plans} />
          <FAQ faqs={faqs} openFAQIndex={openFAQIndex} toggleFAQ={toggleFAQ} />
          <CTA />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
