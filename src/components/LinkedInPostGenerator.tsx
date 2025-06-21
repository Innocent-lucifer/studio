
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { generateLinkedInPosts } from "@/ai/flows/generate-linkedin-posts";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./icons";
import { FEATURE_DESCRIPTIONS, CREDIT_COSTS } from "@/lib/firebaseUserActions";

interface LinkedInPostGeneratorProps {
  topic: string;
  userId: string;
  setLinkedinPosts: (posts: string[]) => void;
  displayGeneratedPostsInCard: boolean;
  setParentPostsEmpty: () => void;
}

export const LinkedInPostGenerator: React.FC<LinkedInPostGeneratorProps> = ({ 
  topic, 
  userId,
  setLinkedinPosts, 
  displayGeneratedPostsInCard,
  setParentPostsEmpty
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [generatedPostsInternal, setGeneratedPostsInternal] = useState<string[]>([]);
  const [initialGenerationProcessedForTopic, setInitialGenerationProcessedForTopic] = useState<boolean>(false);
  const { toast } = useToast();

  const buttonMotionProps = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } },
  };

  useEffect(() => {
    setInitialGenerationProcessedForTopic(false);
    setGeneratedPostsInternal([]);
    setLinkedinPosts([]);
  }, [topic, setLinkedinPosts]);

  const callGenerateFlow = useCallback(async (isRegen: boolean) => {
    if (!topic || !userId || userId === "sagepostai-guest-user") {
      setGeneratedPostsInternal([]);
      setLinkedinPosts([]);
      return;
    }

    if (isRegen) {
      setIsRegenerating(true);
    } else {
      if (initialGenerationProcessedForTopic) return;
      setIsLoading(true);
    }

    setGeneratedPostsInternal([]);
    setLinkedinPosts([]); 

    try {
      if (!isRegen && !initialGenerationProcessedForTopic) {
        setInitialGenerationProcessedForTopic(true);
      }

      const result = await generateLinkedInPosts({ topic: topic, numPosts: 3, userId, isRegeneration: isRegen }); 
      if (result.error) {
         toast({ variant: "destructive", title: "Generation Error", description: result.error });
         setGeneratedPostsInternal([]);
         setLinkedinPosts([]);
      } else {
        setGeneratedPostsInternal(result.posts || []);
        setLinkedinPosts(result.posts || []);
        
        const featureKey: keyof typeof CREDIT_COSTS = isRegen ? 'QUICK_POST_REGENERATE' : 'QUICK_POST';
        if (result.freePostUsed) {
          toast({ title: "Free Action Used", description: `Your free ${FEATURE_DESCRIPTIONS[featureKey].toLowerCase()} was successful!` });
        } else if (result.creditsSpent && result.creditsSpent > 0) {
          toast({ title: "Credits Used", description: `${result.creditsSpent} credits used for ${FEATURE_DESCRIPTIONS[featureKey]}.`});
        }
      }
    } catch (error: any) {
      console.error("Error generating LinkedIn posts:", error);
      toast({
        variant: "destructive",
        title: "LinkedIn Post Generation Failed",
        description: error.message || "Failed to generate LinkedIn posts. Please try again.",
      });
      setGeneratedPostsInternal([]);
      setLinkedinPosts([]);
      if (!isRegen) {
        setInitialGenerationProcessedForTopic(false);
      }
    } finally {
      if(isRegen) setIsRegenerating(false); else setIsLoading(false);
    }
  }, [topic, userId, toast, setLinkedinPosts, initialGenerationProcessedForTopic]);

  useEffect(() => {
    const canGenerateInitial = topic && userId && userId !== "sagepostai-guest-user";
    
    if (canGenerateInitial && !initialGenerationProcessedForTopic && !isLoading) {
        callGenerateFlow(false);
    } else if (!canGenerateInitial) {
      setGeneratedPostsInternal([]);
      setLinkedinPosts([]);
    }
  }, [topic, userId, initialGenerationProcessedForTopic, isLoading, callGenerateFlow]);


  const handleRegenerate = async () => {
    setParentPostsEmpty(); 
    callGenerateFlow(true);
  };

  const showPostsInThisCard = displayGeneratedPostsInCard && generatedPostsInternal.length > 0;
  const showConfirmationMessage = !displayGeneratedPostsInCard && generatedPostsInternal.length > 0 && !isLoading && !isRegenerating;
  const canGenerate = userId && userId !== "sagepostai-guest-user";


  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {(isLoading || isRegenerating) && (
        <div className="flex items-center justify-center p-4 rounded-md bg-slate-700/50">
          <Icons.loader className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-slate-300">{isRegenerating ? "Regenerating..." : "Generating LinkedIn Posts..."}</span>
        </div>
      )}

      {!isLoading && !isRegenerating && showPostsInThisCard && (
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

      {!isLoading && !isRegenerating && showConfirmationMessage && (
        <div className="flex items-center justify-center p-3 rounded-md bg-slate-700/50 text-slate-300 text-sm">
          <Icons.checkCircle className="h-5 w-5 text-green-400 mr-2" />
          LinkedIn posts generated. Review below.
        </div>
      )}
      
      {!isLoading && topic && (
        <motion.div {...buttonMotionProps} className="w-full">
         <Button 
            onClick={handleRegenerate} 
            disabled={isLoading || isRegenerating || !canGenerate} 
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
            title={!canGenerate ? "Please log in to regenerate posts." : `Regenerate LinkedIn Posts (${CREDIT_COSTS.QUICK_POST_REGENERATE} credits)`}
          >
          <Icons.refreshCw className="mr-2 h-4 w-4" /> 
          {generatedPostsInternal.length > 0 ? "Regenerate LinkedIn Posts" : "Generate LinkedIn Posts"}
        </Button>
       </motion.div>
      )}

      {!isLoading && !isRegenerating && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate LinkedIn posts.</p>
      )}
       {!canGenerate && topic && !isLoading && !isRegenerating && (
         <p className="text-xs text-slate-400 text-center py-2">Log in to generate or regenerate posts.</p>
      )}
    </motion.div>
  );
};
