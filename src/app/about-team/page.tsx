
"use client";

import TeamSection from "@/components/sections/TeamSection";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutTeamPage() {
  // Dummy state for header - can be enhanced later if needed
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
        />
        <main className="flex-grow pt-20">
            <TeamSection />
            <div className="text-center py-16">
                <Link href="/contact" passHref>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Work With Us</Button>
                </Link>
            </div>
        </main>
        <Footer />
    </div>
  );
}
