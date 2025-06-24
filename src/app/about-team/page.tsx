"use client";

import TeamSection from "@/components/sections/TeamSection";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { type User } from "firebase/auth";

export default function AboutTeamPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen(!menuOpen)}
        navLinks={navLinks}
        user={user}
      />
      <main className="flex-grow pt-24 sm:pt-32">
        <TeamSection />

        <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Card className="bg-secondary border-border shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-primary">Our Story</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 space-y-6 text-lg leading-relaxed">
                        <p>
                            We didn’t set out to build just another AI tool — we built SagePostAI because we needed it.
                        </p>
                        <p>
                            Like many young builders and founders, we were moving fast — launching projects, validating ideas, and sharing our journey online. But consistently creating great content? That became a real pain.
                        </p>
                        <p>
                            We didn’t even have time to think of what to post. And even when we did have an idea, writing something thoughtful and well-crafted around it was frustrating and time-consuming — unless it was super short and rushed.
                        </p>
                        <p>
                            That’s when I realized:
                        </p>
                        <blockquote className="border-l-4 border-primary pl-6 italic text-foreground/90 my-6">
                            What if we could build something that solves every part of this problem — in one go? Something ultra fast, human-like, super clean in design, premium in experience, and ridiculously easy to use. A tool that gets straight to the point, while still sounding like you.
                        </blockquote>
                        <p>
                            It wouldn’t be easy, I knew that. But with clarity, consistency, and the will to ship — it was absolutely possible.
                        </p>
                        <p>
                            We built the first version of SagePostAI in under 20 hours. What started as a quick MVP became a product people love — and now use daily to show up online without friction.
                        </p>
                        <p>
                            Since then, we’ve added features like:
                        </p>
                        <ul className="list-disc list-inside pl-2 space-y-2">
                            <li>Tone styling,</li>
                            <li>Image-to-post wizard,</li>
                            <li>Smart campaign generation,</li>
                            <li>And emoji + hashtag enrichment — all built to make your content feel alive.</li>
                        </ul>
                        
                        <Separator className="bg-border !my-10" />

                        <h3 className="text-2xl font-bold text-primary !mb-4 !mt-8">Our Mission</h3>
                        <p>
                            Content shouldn’t feel like a chore.
                        </p>
                        <p>
                            We’re building SagePostAI to empower:
                        </p>
                         <ul className="list-disc list-inside pl-2 space-y-2">
                            <li>Founders,</li>
                            <li>Students,</li>
                            <li>Side-hustlers,</li>
                            <li>And creators like you…</li>
                        </ul>
                        <p>
                            To post faster, better, and more authentically — without hiring a team or wasting hours.
                        </p>
                        <p className="font-semibold text-foreground/90">
                           We believe AI should amplify your voice, not replace it.
                        </p>
                        <p>
                            This is just the beginning.
                        </p>
                        <p className="!mt-8 text-foreground">
                            — Rishabh <br />
                            <span className="text-sm text-foreground/70">Founders of SagePostAI</span>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
