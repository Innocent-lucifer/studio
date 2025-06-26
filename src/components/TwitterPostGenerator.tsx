
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { generateTwitterPosts } from "@/ai/flows/generate-twitter-posts";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./icons";

interface TwitterPostGeneratorProps {
  topic: string;
  userId: string;
  setTwitterPosts: (posts: string[]) => void;
  displayGeneratedPostsInCard: boolean;
  setParentPostsEmpty: () => void;
}

export const TwitterPostGenerator: React.FC<TwitterPostGeneratorProps> = ({ 
  topic, 
  userId,
  setTwitterPosts, 
  displayGeneratedPostsInCard,
  setParentPostsEmpty 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPostsInternal, setGeneratedPostsInternal] = useState<string[]>([]);
  const [initialGenerationProcessedForTopic, setInitialGenerationProcessedForTopic] = useState<boolean>(false);
  const { toast } = useToast();

  const buttonMotionProps = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } },
  };

  // Reset flag when topic changes
  useEffect(() => {
    setInitialGenerationProcessedForTopic(false);
    setGeneratedPostsInternal([]);
    setTwitterPosts([]);
  }, [topic, setTwitterPosts]);

  const callGenerateFlow = useCallback(async () => {
    if (!topic || !userId || userId === "sagepostai-guest-user") {
      setGeneratedPostsInternal([]);
      setTwitterPosts([]); 
      return;
    }
    
    setIsLoading(true);
    setGeneratedPostsInternal([]); 
    setTwitterPosts([]); 

    try {
      const result = await generateTwitterPosts({ 
        topic: topic, 
        topicDisplay: topic, 
        numPosts: 3, 
        userId,
      });

      if (result.error) {
         toast({ variant: "destructive", title: "Generation Error", description: result.error });
         setGeneratedPostsInternal([]);
         setTwitterPosts([]);
      } else {
        setGeneratedPostsInternal(result.posts || []);
        setTwitterPosts(result.posts || []);
      }
    } catch (error: any) {
      console.error("Error generating Twitter posts:", error);
      toast({
        variant: "destructive",
        title: "Twitter Post Generation Failed",
        description: error.message || "Failed to generate Twitter posts. Please try again.",
      });
      setGeneratedPostsInternal([]);
      setTwitterPosts([]); 
    } finally {
      setIsLoading(false);
    }
  }, [topic, userId, toast, setTwitterPosts]);

  useEffect(() => {
    const canGenerateInitial = topic && userId && userId !== "sagepostai-guest-user";
    
    if (canGenerateInitial && !initialGenerationProcessedForTopic && !isLoading) {
        setInitialGenerationProcessedForTopic(true); 
        callGenerateFlow();
    } else if (!canGenerateInitial) {
      setGeneratedPostsInternal([]);
      setTwitterPosts([]);
    }
  }, [topic, userId, initialGenerationProcessedForTopic, isLoading, callGenerateFlow]);

  const handleRegenerate = () => {
     setParentPostsEmpty(); 
     callGenerateFlow(); 
  };
  
  const showPostsInThisCard = displayGeneratedPostsInCard && generatedPostsInternal.length > 0;
  const showConfirmationMessage = !displayGeneratedPostsInCard && generatedPostsInternal.length > 0 && !isLoading;
  const canGenerateOrRegenerate = userId && userId !== "sagepostai-guest-user";

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {isLoading && (
         <div className="flex items-center justify-center p-4 rounded-md bg-slate-700/50">
          <Icons.loader className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-slate-300">Generating Twitter Posts...</span>
        </div>
      )}

      {!isLoading && showPostsInThisCard && (
        <div className="space-y-3">
          {generatedPostsInternal.map((post, index) => (
            <motion.div 
              key={index} 
              className="p-4 bg-slate-700/70 rounded-lg shadow text-slate-200 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <p className="whitespace-pre-wrap">{post}</p>
            </motion.div>
          ))}
        </div>
      )}
      
      {!isLoading && showConfirmationMessage && (
        <div className="flex items-center justify-center p-3 rounded-md bg-slate-700/50 text-slate-300 text-sm">
          <Icons.checkCircle className="h-5 w-5 text-green-400 mr-2" />
          Twitter posts generated. Review below.
        </div>
      )}

      {!isLoading && topic && ( 
        <motion.div {...buttonMotionProps} className="w-full">
          <Button 
              onClick={handleRegenerate} 
              disabled={isLoading || !canGenerateOrRegenerate} 
              className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
              title={!canGenerateOrRegenerate ? "Please log in to regenerate posts." : "Regenerate Twitter Posts"}
            >
            <Icons.refreshCw className="mr-2 h-4 w-4" /> 
            Regenerate Twitter Posts
          </Button>
        </motion.div>
      )}

      {!isLoading && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate Twitter posts.</p>
      )}
      {!canGenerateOrRegenerate && topic && !isLoading && (
         <p className="text-xs text-slate-400 text-center py-2">Log in to generate or regenerate posts.</p>
      )}
    </motion.div>
  );
};
