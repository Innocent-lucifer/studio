
"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Icons } from "@/components/icons";
import { AppLogo } from "@/components/AppLogo"; 
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Mock user ID for when auth is disabled
const MOCK_USER_ID = "sagepostai-guest-user";

type GenerationMode = 'quick' | 'campaign';

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [researchedContent, setResearchedContent] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);
  const [researchIsLoading, setResearchIsLoading] = useState(false); 
  const [generationMode, setGenerationMode] = useState<GenerationMode>('quick');

  const [displayTwitterInCard, setDisplayTwitterInCard] = useState(true);
  const [displayLinkedInInCard, setDisplayLinkedInInCard] = useState(true);

  const showPostSelectionCard = twitterPosts.length > 0 && linkedinPosts.length > 0 && generationMode === 'quick';
  
  const canGenerateOrEdit = true; // Auth stubbed out, always allow

  useEffect(() => {
    if (generationMode === 'campaign') {
      setDisplayTwitterInCard(false);
      setDisplayLinkedInInCard(false);
    } else {
      setDisplayTwitterInCard(!(showPostSelectionCard && twitterPosts.length > 0));
      setDisplayLinkedInInCard(!(showPostSelectionCard && linkedinPosts.length > 0));
    }

    if (topic && (!researchedContent || researchIsLoading)) {
        setDisplayTwitterInCard(true);
        setDisplayLinkedInInCard(true);
    }
  }, [showPostSelectionCard, twitterPosts, linkedinPosts, topic, researchedContent, researchIsLoading, generationMode]);


  const handlePostUpdate = (type: 'twitter' | 'linkedin', index: number, newText: string) => {
    if (type === 'twitter') {
      setTwitterPosts(prev => prev.map((post, i) => i === index ? newText : post));
    } else {
      setLinkedinPosts(prev => prev.map((post, i) => i === index ? newText : post));
    }
  };


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
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                whileHover={{
                  rotate: [0, -8, 8, -8, 8, 0], 
                  transition: { 
                    duration: 0.4, 
                    ease: "easeInOut" 
                  }
                }}
              >
                <AppLogo className="h-16 w-16 text-primary" />
              </motion.div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'hsl(var(--primary))' }}>
                SagePostAI
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right text-xs">
                <p className="font-semibold text-primary">Dev Mode</p>
                <p className="text-slate-400">Unlimited Access (Auth Disabled)</p>
              </div>
              <HamburgerMenu />
            </div>
          </header>

          <motion.div variants={staggerChildren} initial="initial" animate="animate">
            <motion.div variants={cardVariants}>
              <Card className="mb-8 bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-center text-primary flex items-center justify-center">
                    <Icons.search className="mr-3 h-7 w-7" />
                    1. Research Your Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicResearch
                    setTopic={setTopic}
                    setResearchedContent={setResearchedContent}
                    setIsLoading={setResearchIsLoading}
                    // Props related to auth/credits removed as auth is stubbed
                  />
                </CardContent>
              </Card>
            </motion.div>

            {researchIsLoading && ( 
              <motion.div 
                className="flex flex-col justify-center items-center my-8 p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Icons.loader className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 mt-3 text-lg text-slate-300">Researching...</p>
                <p className="mt-1 text-sm text-slate-400">This may take a few moments.</p>
              </motion.div>
            )}

            {!researchIsLoading && topic && researchedContent && (
              <motion.div variants={cardVariants} className="my-8">
                <Card className="bg-slate-800/50 border-slate-700 shadow-xl rounded-xl p-6">
                  <CardHeader className="p-0 pb-4 mb-4 border-b border-slate-700">
                    <CardTitle className="text-2xl font-semibold text-primary flex items-center">
                      <Icons.settings className="mr-3 h-7 w-7" />
                      2. Choose Your Generation Mode
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Select how you want to generate content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <Button
                        onClick={() => setGenerationMode('quick')}
                        variant={generationMode === 'quick' ? 'default' : 'outline'}
                        className={`flex-1 py-6 text-base shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${generationMode === 'quick' ? 'bg-primary text-primary-foreground border-primary' : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-primary/50'}`}
                      >
                        <Icons.edit className="mr-2 h-5 w-5" />
                        Quick Posts
                      </Button>
                      <Button
                        onClick={() => setGenerationMode('campaign')}
                        variant={generationMode === 'campaign' ? 'default' : 'outline'}
                         className={`flex-1 py-6 text-base shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 ${generationMode === 'campaign' ? 'bg-primary text-primary-foreground border-primary' : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-primary/50'}`}
                      >
                        <Icons.sparkles className="mr-2 h-5 w-5" />
                        Smart Campaign
                      </Button>
                    </div>

                    {generationMode === 'campaign' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <p className="text-slate-300 mb-4">
                          Build a full content campaign with strategy, angles, interconnected post series, and repurposing ideas.
                        </p>
                        <Link 
                          href={{
                            pathname: '/smart-campaign',
                            query: { topic: topic, researchedContent: researchedContent },
                          }}
                          passHref
                        >
                          <Button 
                            size="lg" 
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg transform hover:scale-105 transition-transform duration-200 py-3 px-8"
                            disabled={!topic || !researchedContent}
                          >
                            <Icons.arrowRight className="mr-2 h-5 w-5" />
                            Launch Smart Campaign Builder
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!researchIsLoading && topic && researchedContent && generationMode === 'quick' && (
              <>
                <motion.div 
                  className="grid md:grid-cols-2 gap-8 mt-8"
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
                          topic={researchedContent || topic}
                          userId={MOCK_USER_ID}
                          setTwitterPosts={setTwitterPosts}
                          displayGeneratedPostsInCard={displayTwitterInCard}
                          setParentPostsEmpty={() => setTwitterPosts([])}
                          // Credit related props are removed as auth is stubbed
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
                          topic={researchedContent || topic}
                          userId={MOCK_USER_ID}
                          setLinkedinPosts={setLinkedinPosts}
                          displayGeneratedPostsInCard={displayLinkedInInCard}
                          setParentPostsEmpty={() => setLinkedinPosts([])}
                           // Credit related props are removed as auth is stubbed
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </>
            )}

            {!researchIsLoading && showPostSelectionCard && (
              <motion.div variants={cardVariants} className="mt-8">
                <Card className="bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center text-primary flex items-center justify-center">
                      <Icons.edit className="mr-3 h-7 w-7" />
                      Review & Refine Your Quick Posts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PostSelection
                      twitterPosts={twitterPosts}
                      linkedinPosts={linkedinPosts}
                      topic={topic} 
                      onUpdatePost={handlePostUpdate}
                      userId={MOCK_USER_ID}
                       // Credit related props are removed as auth is stubbed
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </main>
        <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
          <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
            Built By EZ Teenagers.
            <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
          </span>
        </footer>
      </motion.div>
    </>
  );
}

