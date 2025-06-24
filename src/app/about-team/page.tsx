
"use client";

import TeamSection from "@/components/sections/TeamSection";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { type User } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function AboutTeamPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [isRishabhStoryOpen, setIsRishabhStoryOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
    <div className="flex flex-col min-h-screen text-foreground">
      <Header
        scrolled={scrolled}
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen(!menuOpen)}
        navLinks={navLinks}
        user={user}
      />
      <main className="flex-grow pt-24 sm:pt-32">
        <TeamSection onReadRishabhStory={() => setIsRishabhStoryOpen(true)} />

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

    <Dialog open={isRishabhStoryOpen} onOpenChange={setIsRishabhStoryOpen}>
        <DialogContent className="sm:max-w-2xl bg-secondary border-border text-foreground">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary">My Story - Rishabh Nauhowar</DialogTitle>
                <DialogDescription>Founder & Product Strategist of SagePostAI</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh] pr-4 -mr-2">
                <div className="space-y-4 text-foreground/80 leading-relaxed py-2">
                    <h3 className="text-xl font-bold text-primary !mt-4">My Journey</h3>
                    <p>From a young age, I found myself deeply curious about space, technology, and how things work. I didn’t always have clear answers, but I always had questions — and I followed them. That early curiosity led me to explore everything from AI and robotics to business and design. As I grew older, that interest turned into something more focused: a desire to build meaningful things.</p>
                    <p>In my early teens, I was introduced to entrepreneurship and began experimenting — sometimes out of passion, sometimes just to see what was possible. I tried my hand at different things: small digital businesses, trading, content, building tools — not all of them worked, but every experience taught me something new. Slowly, I began to understand how much was possible with just an idea, some determination, and a willingness to learn.</p>
                    <p>Eventually, my co-founder and I started a project called NexusHive, where we poured everything we knew into building something valuable. We worked relentlessly — often without sleep — constantly iterating, improving, and figuring things out on the go. Though the outcome wasn’t what we’d hoped, it taught us more than any success could have.</p>
                    <p>That experience led to our next step: building SagePostAI. At the time, we were struggling with something simple — writing social content. Despite having ideas, turning them into polished, high-quality posts was slow and frustrating. We kept saying, “There has to be a better way.”</p>
                    <p>So instead of waiting, I built the first prototype in a single stretch — about 15 hours straight. From there, it became a daily cycle of refinement: listening, improving, testing. Within a couple of weeks, we had something that didn’t just solve our problem — it could help many others too.</p>

                    <Separator className="!my-8 bg-border" />

                    <h3 className="text-xl font-bold text-primary">What We Believe</h3>
                    <p>We believe in building quietly, consistently, and with care. We don’t chase attention. We focus on progress. If we find something worth solving, we try to solve it — not just for ourselves, but for others who might be facing the same thing.</p>
                    
                    <Separator className="!my-8 bg-border" />
                    
                    <h3 className="text-xl font-bold text-primary">Looking Ahead</h3>
                    <p>SagePostAI is just the beginning. In the future, we hope to return to some of the dreams that first inspired us — in AI, in space, in deep technology — and continue building products that make people’s lives easier and more meaningful.</p>
                    <p>This journey has come with its share of challenges: technical setbacks, rejections, and the everyday doubts that come with building anything new. But we’ve also grown — a lot. We’ve learned that failure is part of the process, that persistence matters more than motivation, and that you don’t need permission to start.</p>
                    <p>We’re still learning. Still growing. Still showing up. And we’re excited for what’s ahead.</p>

                    <Separator className="!my-8 bg-border" />

                    <h3 className="text-xl font-bold text-primary">And What Comes Next</h3>
                    <p>I’m genuinely excited about what lies ahead. This — all of this — is just the beginning. The path forward won’t be perfect. It’ll be messy, unpredictable, and filled with its share of challenges. There will be wins, and there will be losses. There will be late nights, restless thinking, breakthroughs, setbacks, and everything in between. But that’s what makes it real — and worth it.</p>
                    <p>What excites me the most is not just the idea of success, but the journey itself. The unknowns. The problems yet to be solved. The people we’ll meet. The things we’ll build. The stories we’ll tell later, looking back at how it all started.</p>
                    <p>It’s going to be adventurous — full of different emotions, unexpected turns, juggling ideas, experimenting, failing, learning, and growing. And that’s the kind of life I’ve always wanted to live — one where I’m building something that matters, no matter how uncertain or uphill it may be.</p>
                    <p className="font-semibold text-foreground">I’m here for the long run. Let’s see where this takes us.</p>
                </div>
            </ScrollArea>
            <CardFooter className="pt-6">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" className="w-full">Close</Button>
                </DialogClose>
            </CardFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
