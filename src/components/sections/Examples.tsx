
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Twitter, Linkedin, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const twitterExamples = [
  {
    user: "AI Innovator",
    handle: "@ai_explorer",
    content: "Feeling disconnected in a hyper-connected world? You're not alone. The loneliness epidemic is real, but so is the power of genuine connection. A simple 'how are you?' can change someone's day. Let's be the change. ❤️ #MentalHealth #Connection #Loneliness"
  },
  {
    user: "Gamer Girl",
    handle: "@game_dev_diaries",
    content: "NPCs that actually *learn* from your playstyle? Procedural worlds that feel truly infinite? AI is about to revolutionize gaming in ways we can't even imagine. What AI-powered feature are you most hyped for? 🎮🤖 #AIinGaming #NextGen #GameDev"
  }
];

const linkedinExamples = [
  {
    user: "Alex Chen",
    handle: "Head of People & Culture",
    content: "The shift to remote work wasn't just a logistical challenge; it was a cultural one. Companies that thrive are those intentionally building connection through virtual channels, prioritizing asynchronous communication, and redefining what 'team cohesion' means.\n\nIt's no longer about proximity, but about shared purpose and trust. How has your company adapted?\n\n#RemoteWork #CompanyCulture #FutureOfWork #Leadership"
  },
  {
    user: "Dr. Evelyn Reed",
    handle: "Portfolio Manager & ESG Analyst",
    content: "Environmental, Social, and Governance (ESG) investing is moving from a niche strategy to a core component of modern portfolio management. It's clear that long-term value creation is intrinsically linked to sustainable and ethical practices.\n\nInvestors are no longer asking *if* they should incorporate ESG, but *how* to do so effectively to manage risk and drive positive impact.\n\n#ESG #SustainableFinance #Investing #ImpactInvesting"
  }
];

const ExamplePost = React.memo(({ user, handle, content }: { user: string; handle: string; content: string; }) => (
    <Card className="bg-background border border-border p-6 text-left hover:shadow-primary/10 transition-shadow duration-300">
        <CardContent className="p-0">
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground">{user}</span>
                        <span className="text-sm text-foreground/60">{handle}</span>
                    </div>
                    <p className="mt-2 text-foreground/80 whitespace-pre-wrap">{content}</p>
                </div>
            </div>
        </CardContent>
    </Card>
));
ExamplePost.displayName = 'ExamplePost';


const ExamplesComponent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section id="examples" className="py-20 sm:py-28 px-4 sm:px-6 bg-secondary/50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
          From Our AI, To Your Feed
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-foreground/70 max-w-2xl mx-auto mb-12">
          See the quality and variety of content SagePostAI can generate.
        </motion.p>

        <Tabs defaultValue="twitter" className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md mx-auto grid-cols-2 bg-background border-border">
            <TabsTrigger value="twitter" className="py-2.5">
              <Twitter className="mr-2 h-5 w-5" /> Twitter
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="py-2.5">
              <Linkedin className="mr-2 h-5 w-5" /> LinkedIn
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="twitter">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {twitterExamples.map((post, i) => (
                <motion.div key={`twitter-${i}`} variants={itemVariants}>
                    <ExamplePost {...post} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="linkedin">
            <motion.div 
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {linkedinExamples.map((post, i) => (
                <motion.div key={`linkedin-${i}`} variants={itemVariants}>
                  <ExamplePost {...post} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default React.memo(ExamplesComponent);
