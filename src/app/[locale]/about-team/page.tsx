
"use client";

import React, { useState, useEffect } from "react";
import TeamSection from "@/components/sections/TeamSection";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/navigation";


export default function AboutTeamPage() {
  const t = useTranslations('AboutTeamPage');
  const landingT = useTranslations('LandingPage');

  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRishabhStoryOpen, setIsRishabhStoryOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    if (pathname === '/about-team' || pathname === '/sobre-nosotros') {
        // If we are on the about page, just navigate to the homepage with hash
        window.location.href = `/#${sectionId}`;
    } else {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { name: t('nav.home'), href: "/" },
    { name: landingT('navLinks.pricing'), href: "/#pricing", onClick: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => handleScrollToSection(e, 'pricing') },
    { name: landingT('navLinks.contact'), href: "/contact" },
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
        tryForFreeText={landingT('header.tryForFree')}
        goToAppText={landingT('header.goToApp')}
      />
      <main className="flex-grow pt-24 sm:pt-32">
        <div className="text-center mb-16 px-4">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl font-bold text-primary mb-4"
            >
              {t('title')}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-foreground/70 max-w-2xl mx-auto"
            >
              {t('subtitle')}
            </motion.p>
        </div>

        <TeamSection 
          onReadRishabhStory={() => setIsRishabhStoryOpen(true)}
          title={t('teamSection.title')}
          subtitle={t('teamSection.subtitle')}
        />

        <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <Card className="bg-background border-border shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-primary">{t('ourStory.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 space-y-6 text-lg leading-relaxed">
                        <p>{t('ourStory.p1')}</p>
                        <p>{t('ourStory.p2')}</p>
                        <p>{t('ourStory.p3')}</p>
                        <p>{t('ourStory.p4')}</p>
                        <blockquote className="border-l-4 border-primary pl-6 italic text-foreground/90 my-6">
                           {t('ourStory.quote')}
                        </blockquote>
                        <p>{t('ourStory.p5')}</p>
                        <p>{t('ourStory.p6')}</p>
                        <p>{t('ourStory.p7')}</p>
                        <ul className="list-disc list-inside pl-2 space-y-2">
                            <li>{t('ourStory.feature1')}</li>
                            <li>{t('ourStory.feature2')}</li>
                            <li>{t('ourStory.feature3')}</li>
                            <li>{t('ourStory.feature4')}</li>
                        </ul>
                        
                        <Separator className="bg-border !my-10" />

                        <h3 className="text-2xl font-bold text-primary !mb-4 !mt-8">{t('ourMission.title')}</h3>
                        <p>{t('ourMission.p1')}</p>
                        <p>{t('ourMission.p2')}</p>
                         <ul className="list-disc list-inside pl-2 space-y-2">
                            <li>{t('ourMission.empower1')}</li>
                            <li>{t('ourMission.empower2')}</li>
                            <li>{t('ourMission.empower3')}</li>
                            <li>{t('ourMission.empower4')}</li>
                        </ul>
                        <p>{t('ourMission.p3')}</p>
                        <p className="font-semibold text-foreground/90">{t('ourMission.quote')}</p>
                        <p>{t('ourMission.p4')}</p>
                        <p className="!mt-8 text-foreground">
                            — Rishabh <br />
                            <span className="text-sm text-foreground/70">{t('ourMission.signature')}</span>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
      </main>
      <Footer />
    </div>

    <Dialog open={isRishabhStoryOpen} onOpenChange={setIsRishabhStoryOpen}>
        <DialogContent className="sm:max-w-2xl bg-background border-border text-foreground">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary">{t('rishabhStory.title')}</DialogTitle>
                <DialogDescription>{t('rishabhStory.subtitle')}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[70vh] pr-4 -mr-2">
                <div className="space-y-4 text-foreground/80 leading-relaxed py-2">
                    <h3 className="text-xl font-bold text-primary !mt-4">{t('rishabhStory.journey.title')}</h3>
                    <p>{t('rishabhStory.journey.p1')}</p>
                    <p>{t('rishabhStory.journey.p2')}</p>
                    <p>{t('rishabhStory.journey.p3')}</p>
                    <p>{t('rishabhStory.journey.p4')}</p>
                    <p>{t('rishabhStory.journey.p5')}</p>

                    <Separator className="!my-8 bg-border" />

                    <h3 className="text-xl font-bold text-primary">{t('rishabhStory.whatWeBelieve.title')}</h3>
                    <p>{t('rishabhStory.whatWeBelieve.p1')}</p>
                    
                    <Separator className="!my-8 bg-border" />
                    
                    <h3 className="text-xl font-bold text-primary">{t('rishabhStory.lookingAhead.title')}</h3>
                    <p>{t('rishabhStory.lookingAhead.p1')}</p>
                    <p>{t('rishabhStory.lookingAhead.p2')}</p>
                    <p>{t('rishabhStory.lookingAhead.p3')}</p>

                    <Separator className="!my-8 bg-border" />

                    <h3 className="text-xl font-bold text-primary">{t('rishabhStory.whatComesNext.title')}</h3>
                    <p>{t('rishabhStory.whatComesNext.p1')}</p>
                    <p>{t('rishabhStory.whatComesNext.p2')}</p>
                    <p>{t('rishabhStory.whatComesNext.p3')}</p>
                    <p className="font-semibold text-foreground">{t('rishabhStory.whatComesNext.quote')}</p>
                </div>
            </ScrollArea>
            <CardFooter className="pt-6">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" className="w-full">{t('rishabhStory.closeButton')}</Button>
                </DialogClose>
            </CardFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
