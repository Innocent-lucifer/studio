
"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Icons } from "@/components/icons";
import { AppLogo } from "@/components/AppLogo"; 
// import { useAuth } from "@/context/AuthContext";
// import { LoginSignUpForm } from "@/components/LoginSignUpForm";
// import type { UserData } from "@/types/user";

// Mock user ID for when auth is disabled
const MOCK_USER_ID = "sagepostai-guest-user";

export default function Home() {
  // const { user, userData, loading: authLoading, refreshUserData } = useAuth();
  const authLoading = false; // Stubbed out
  const user = null; // Stubbed out
  const userData = null; // Stubbed out
  const refreshUserData = async () => {}; // Stubbed out

  const [topic, setTopic] = useState<string>("");
  const [researchedContent, setResearchedContent] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);
  const [researchIsLoading, setResearchIsLoading] = useState(false); 

  const [displayTwitterInCard, setDisplayTwitterInCard] = useState(true);
  const [displayLinkedInInCard, setDisplayLinkedInInCard] = useState(true);

  const showPostSelectionCard = twitterPosts.length > 0 && linkedinPosts.length > 0;

  // Determine current user ID (mock or real)
  const currentUserId = user?.uid || MOCK_USER_ID;
  
  // Determine if generation/editing is allowed (always true if auth is stubbed)
  const canGenerateOrEdit = true;
  // const canGenerateOrEdit = userData ? userData.plan === 'infinity' || (userData.credits || 0) > 0 : true;


  useEffect(() => {
    setDisplayTwitterInCard(!(showPostSelectionCard && twitterPosts.length > 0));
    setDisplayLinkedInInCard(!(showPostSelectionCard && linkedinPosts.length > 0));

    if (topic && (!researchedContent || researchIsLoading)) {
        setDisplayTwitterInCard(true);
        setDisplayLinkedInInCard(true);
    }
  }, [showPostSelectionCard, twitterPosts, linkedinPosts, topic, researchedContent, researchIsLoading]);


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

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading SagePostAI...</p>
      </div>
    );
  }

  // Auth gate removed for now
  // if (!user && !authLoading) {
  //   return <LoginSignUpForm />;
  // }

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
                 {/* Simplified display for stubbed auth */}
                <p className="font-semibold text-primary">Dev Mode</p>
                <p className="text-slate-400">Unlimited Access</p>
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
                    Research Your Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicResearch
                    setTopic={setTopic}
                    setResearchedContent={setResearchedContent}
                    setIsLoading={setResearchIsLoading} 
                    userId={currentUserId} // Use mock or real user ID
                    canGenerate={canGenerateOrEdit}
                    onGenerationAttempt={() => true} // Stubbed: always allow
                    onGenerationSuccess={refreshUserData}
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
                <p className="ml-4 mt-3 text-lg text-slate-300">Researching and Crafting Posts...</p>
                <p className="mt-1 text-sm text-slate-400">This may take a few moments.</p>
              </motion.div>
            )}

            {!researchIsLoading && topic && researchedContent && (
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
                        topic={researchedContent || topic}
                        setTwitterPosts={setTwitterPosts}
                        displayGeneratedPostsInCard={displayTwitterInCard}
                        setParentPostsEmpty={() => setTwitterPosts([])}
                        userId={currentUserId}
                        canGenerate={canGenerateOrEdit}
                        onGenerationAttempt={() => true} // Stubbed
                        onGenerationSuccess={refreshUserData}
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
                        setLinkedinPosts={setLinkedinPosts}
                        displayGeneratedPostsInCard={displayLinkedInInCard}
                        setParentPostsEmpty={() => setLinkedinPosts([])}
                        userId={currentUserId}
                        canGenerate={canGenerateOrEdit}
                        onGenerationAttempt={() => true} // Stubbed
                        onGenerationSuccess={refreshUserData}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {!researchIsLoading && showPostSelectionCard && (
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
                      topic={topic} 
                      onUpdatePost={handlePostUpdate}
                      userId={currentUserId}
                      canEdit={canGenerateOrEdit} // Using same flag for simplicity
                      onEditAttempt={() => true} // Stubbed
                      onEditSuccess={refreshUserData}
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
