"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState } from "react";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Icons } from "@/components/icons";
import { useToast } from "@/hooks/use-toast"; // Added for potential direct toasts

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [researchedContent, setResearchedContent] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Initialize toast

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      <motion.div 
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8 transition-colors duration-500"
      >
        <main className="container mx-auto w-full max-w-4xl">
          <header className="flex justify-between items-center mb-8 py-4">
            <div className="flex items-center space-x-3">
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-10 w-10 text-primary" // Updated to use primary color from theme
                fill="currentColor"
                initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 360, scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm8-82.83,26.39,26.4a8,8,0,0,1-11.32,11.31L128,143.31l-22.07,22.07a8,8,0,0,1-11.32-11.31L116.69,132,93.66,108.9a8,8,0,0,1,11.31-11.31L128,119.31l23.07-23.07a8,8,0,1,1,11.31,11.31Z" />
              </motion.svg>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'hsl(var(--primary))' }}>
                SagePostAI
              </h1>
            </div>
            <HamburgerMenu />
          </header>

          <motion.div variants={staggerChildren} initial="initial" animate="animate">
            <motion.div variants={cardVariants}>
              <Card className="mb-8 bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-center text-primary flex items-center justify-center">
                    <Icons.search className="mr-3 h-7 w-7" />
                    Research Your Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicResearch
                    setTopic={setTopic}
                    setResearchedContent={setResearchedContent}
                    setIsLoading={setIsLoading}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {isLoading && (
              <motion.div 
                className="flex flex-col justify-center items-center my-8 p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Icons.loader className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 mt-3 text-lg text-slate-300">Researching and Crafting Posts...</p>
                <p className="mt-1 text-sm text-slate-400">This may take a few moments.</p>
              </motion.div>
            )}

            {!isLoading && topic && researchedContent && (
              <motion.div 
                className="grid md:grid-cols-2 gap-8"
                variants={staggerChildren}
              >
                <motion.div variants={cardVariants}>
                  <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-center text-primary flex items-center justify-center">
                        <Icons.twitter className="mr-2 h-6 w-6" />
                        Twitter Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TwitterPostGenerator
                        topic={researchedContent || topic} // Prioritize researched content
                        setTwitterPosts={setTwitterPosts}
                        // setIsLoading is managed globally for the research phase. Generators handle their own button states.
                      />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-center text-primary flex items-center justify-center">
                        <Icons.linkedin className="mr-2 h-6 w-6" />
                        LinkedIn Posts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LinkedInPostGenerator
                        topic={researchedContent || topic} // Prioritize researched content
                        setLinkedinPosts={setLinkedinPosts}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {!isLoading && twitterPosts.length > 0 && linkedinPosts.length > 0 && (
              <motion.div variants={cardVariants} className="mt-8">
                <Card className="bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-primary flex items-center justify-center">
                      <Icons.edit className="mr-3 h-7 w-7" />
                      Review & Refine Your Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PostSelection
                      twitterPosts={twitterPosts}
                      linkedinPosts={linkedinPosts}
                      topic={topic} // Pass original topic for context if needed
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </main>
        <Toaster />
        <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
          Powered by Genkit and Next.js. Built with Firebase Studio.
        </footer>
      </motion.div>
    </>
  );
}
