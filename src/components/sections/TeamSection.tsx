"use client";

import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const founders = [
  {
    name: "Rishabh Nauhwar",
    title: "Founder & Product Strategist",
    desc: "Leads product vision, development, and AI systems. Focused on building experiences that scale.",
    image: "/ceo.png",
    linkedin: "https://linkedin.com/in/rishabh-kumarr/",
    twitter: "https://x.com/ChilledCeo?s=09",
  },
  {
    name: "Siddharth Gaur",
    title: "Co-founder & Growth Strategist",
    desc: "Handles outreach, customer acquisition, and market-fit strategy. Ensures we solve real problems.",
    image: "/coo.png",
    linkedin: "https://linkedin.com/in/siddharthgaur01/",
    twitter: "https://x.com/siddharthg17481?t=8fofWw3WkJaus7_wXm_Z9A&s=09",
  },
];

interface TeamSectionProps {
  onReadRishabhStory: () => void;
}

const TeamSectionComponent: React.FC<TeamSectionProps> = ({ onReadRishabhStory }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section id="team" className="px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-4 text-foreground"
        >
          Meet the Makers
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-foreground/70 text-lg">
          We’re a duo of founders building fast, solving real
          problems, and shipping tools that matter.
        </motion.p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {founders.map((member, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-background text-center h-full flex flex-col">
              <CardHeader className="items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardTitle>{member.name}</CardTitle>
                <p className="text-sm text-primary font-medium">
                  {member.title}
                </p>
                <p className="text-xs text-accent font-semibold mt-1">(15-year-old)</p>
              </CardHeader>
              <CardContent className="flex-grow pt-2">
                <p className="text-foreground/70 text-base">{member.desc}</p>
              </CardContent>
              <CardFooter className="flex-col pt-6">
                <div className="flex gap-4 justify-center">
                    {member.linkedin && (
                        <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                            <Linkedin className="h-5 w-5 text-foreground/60 hover:text-primary" />
                        </Button>
                        </Link>
                    )}
                    {member.twitter && (
                        <Link href={member.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                            <Twitter className="h-5 w-5 text-foreground/60 hover:text-primary" />
                        </Button>
                        </Link>
                    )}
                </div>
                {member.name === "Rishabh Nauhwar" && (
                    <Button onClick={onReadRishabhStory} variant="link" className="text-primary mt-4">
                        Read My Story
                    </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default React.memo(TeamSectionComponent);