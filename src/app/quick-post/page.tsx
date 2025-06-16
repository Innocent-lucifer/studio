
"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState, useEffect, useCallback } from "react";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Icons } from "@/components/icons";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// const MOCK_USER_ID = "sagepostai-guest-user"; // Will use user.uid from useAuth instead

export default function QuickPostPage() {
  const { user } = useAuth();
  const userIdToPass = user?.uid || "sagepostai-guest-user"; // Fallback for safety, though user should be mock guest

  const [topic, setTopic] = useState<string>("");
  const [researchedContent, setResearchedContent] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);
  const [researchIsLoading, setResearchIsLoading] = useState(false);

  const [displayTwitterInCard, setDisplayTwitterInCard] = useState(true);
  const [displayLinkedInInCard, setDisplayLinkedInInCard] = useState(true);

  useEffect(() => {
    if (researchIsLoading || !researchedContent || !topic) {
      setDisplayTwitterInCard(true);
      setDisplayLinkedInInCard(true);
    } else {
      const shouldShowInCombinedCard = twitterPosts.length > 0 && linkedinPosts.length > 0;
      setDisplayTwitterInCard(!shouldShowInCombinedCard);
      setDisplayLinkedInInCard(!shouldShowInCombinedCard);
    }
  }, [topic, researchedContent, researchIsLoading, twitterPosts, linkedinPosts]);


  const handlePostUpdate = (type: 'twitter' | 'linkedin', index: number, newText: string) => {
    if (type === 'twitter') {
      setTwitterPosts(prev => prev.map((post, i) => i === index ? newText : post));
    } else {
      setLinkedinPosts(prev => prev.map((post, i) => i === index ? newText : post));
    }
  };

  const showPostSelectionCard = twitterPosts.length > 0 && linkedinPosts.length > 0;

  const clearTwitterPosts = useCallback(() => {
    setTwitterPosts([]);
  }, []);

  const clearLinkedinPosts = useCallback(() => {
    setLinkedinPosts([]);
  }, []);

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

  const canProceedToSmartCampaign = !researchIsLoading && !!topic.trim() && !!researchedContent.trim();

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
          <header className="flex justify-between items-center w-full mb-8 py-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="hidden md:block">
                <HamburgerMenu />
              </div>
              <Link href="/" passHref>
                <div className="flex items-center space-x-3 sm:space-x-4 cursor-pointer group">
                  <AppLogo className="h-12 w-12 sm:h-16 sm:w-16 text-primary group-hover:scale-110 transition-transform" />
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                      SagePostAI
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Quick Post Generator</p>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex">
                <Link
                  href={{
                    pathname: '/smart-campaign',
                    query: { topic: topic, researchedContent: researchedContent },
                  }}
                  passHref
                  legacyBehavior={false}
                  aria-disabled={!canProceedToSmartCampaign}
                  onClick={(e) => !canProceedToSmartCampaign && e.preventDefault()}
                >
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                    disabled={!canProceedToSmartCampaign}
                    title={!canProceedToSmartCampaign ? "Please research a topic first" : "Go to Smart Campaign"}
                  >
                    <Icons.sparkles className="mr-1 h-4 w-4" />
                    Smart Campaign
                  </Button>
                </Link>
              </div>
              
              <div className="text-right text-xs">
                {user?.email ? (
                    <p className="font-semibold text-primary truncate max-w-[100px] sm:max-w-[150px]" title={user.email}>{user.email}</p>
                ) : (
                    <p className="font-semibold text-primary">Guest</p>
                )}
                <p className="text-slate-400">Mode</p>
              </div>
              <div className="md:hidden">
                <HamburgerMenu />
              </div>
            </div>
          </header>
          
          <div className="sm:hidden w-full mb-6 px-4">
             <Link
                href={{
                  pathname: '/smart-campaign',
                  query: { topic: topic, researchedContent: researchedContent },
                }}
                passHref
                legacyBehavior={false}
                aria-disabled={!canProceedToSmartCampaign}
                onClick={(e) => !canProceedToSmartCampaign && e.preventDefault()}
              >
                <Button
                  variant="outline"
                  className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canProceedToSmartCampaign}
                  title={!canProceedToSmartCampaign ? "Please research a topic first" : "Go to Smart Campaign"}
                >
                  <Icons.sparkles className="mr-2 h-5 w-5" />
                  Smart Campaign
                </Button>
              </Link>
          </div>

          <motion.div variants={staggerChildren} initial="initial" animate="animate" className="px-4 sm:px-0">
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
                    setIsLoading={setResearchIsLoading}
                    userId={userIdToPass} 
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
                          userId={userIdToPass}
                          setTwitterPosts={setTwitterPosts}
                          displayGeneratedPostsInCard={displayTwitterInCard}
                          setParentPostsEmpty={clearTwitterPosts}
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
                          userId={userIdToPass}
                          setLinkedinPosts={setLinkedinPosts}
                          displayGeneratedPostsInCard={displayLinkedInInCard}
                          setParentPostsEmpty={clearLinkedinPosts}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </>
            )}

            {!researchIsLoading && topic && researchedContent && showPostSelectionCard && (
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
                      userId={userIdToPass}
                      onUpdatePost={handlePostUpdate}
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
