
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
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
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
    // Clear previous posts when topic changes to avoid showing stale content before new generation
    setGeneratedPostsInternal([]);
    setTwitterPosts([]);
  }, [topic, setTwitterPosts]);

  const callGenerateFlow = useCallback(async (isRegen: boolean) => {
    if (!topic || !userId || userId === "sagepostai-guest-user") {
      setGeneratedPostsInternal([]);
      setTwitterPosts([]); 
      return;
    }

    if (isRegen) {
      setIsRegenerating(true);
    } else {
      // This is an initial generation attempt for the current topic
      if (initialGenerationProcessedForTopic) {
        // console.log("[TwitterPostGenerator] Initial generation already processed for this topic. Skipping credit deduction call.");
        // Potentially, if we want to refresh posts without re-charging if user navigates away and back,
        // we might still call generateTwitterPosts but pass a flag to skip credit check in the flow,
        // or the flow itself should be idempotent if called with same params and no regen flag.
        // For now, we assume if already processed, the posts are there or will be fetched by LinkedIn independently.
        // OR, we can just let it fetch but the credit system should handle it via free post logic / idempotency.
        // The `deductCredits` 'QUICK_POST' part will use the free post only once. If called again, it will charge.
        // The `initialGenerationProcessedForTopic` ensures *this component* only *initiates* that charge once.
      }
      setIsLoading(true);
    }
    
    setGeneratedPostsInternal([]); 
    setTwitterPosts([]); 

    try {
      // For initial generation, set the flag before the async call
      // This specific component instance tries to trigger the "initial charge" only once.
      if (!isRegen && !initialGenerationProcessedForTopic) {
        setInitialGenerationProcessedForTopic(true); 
      }

      const result = await generateTwitterPosts({ 
        topic: topic, 
        topicDisplay: topic, 
        numPosts: 3, 
        userId,
        isRegeneration: isRegen // Pass the regeneration flag to the flow
      });

      if (result.error) {
         toast({ variant: "destructive", title: "Generation Error", description: result.error });
         setGeneratedPostsInternal([]);
         setTwitterPosts([]);
      } else {
        setGeneratedPostsInternal(result.posts || []);
        setTwitterPosts(result.posts || []);
        if (!isRegen) { // Only show credit messages for initial generation, not regen. Regen has its own cost.
          if (result.freePostUsedThisTime) {
            toast({ title: "Free Quick Post Used!", description: "Your first Quick Post generation was on us!" });
          } else if (result.creditsSpent && result.creditsSpent > 0) {
            toast({ title: "Credits Used", description: `${result.creditsSpent} credits were used for Quick Post.`});
          }
        } else if (isRegen && result.creditsSpent && result.creditsSpent > 0) {
            toast({ title: "Credits Used", description: `${result.creditsSpent} credits were used for regeneration.`});
        }
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
      if (!isRegen) {
        setInitialGenerationProcessedForTopic(false); // Reset if initial attempt failed catastrophically
      }
    } finally {
      if(isRegen) setIsRegenerating(false); else setIsLoading(false);
    }
  }, [topic, userId, toast, setTwitterPosts, initialGenerationProcessedForTopic]);

  useEffect(() => {
    const canGenerateInitial = topic && userId && userId !== "sagepostai-guest-user";
    
    if (canGenerateInitial && !initialGenerationProcessedForTopic && !isLoading) {
        // console.log(`[TwitterPostGenerator] useEffect triggering initial callGenerateFlow. Topic: "${topic}", UserID: "${userId}", InitialProcessed: ${initialGenerationProcessedForTopic}`);
        // console.log("[TwitterPostGenerator] Applying TEMPORARY 1s delay for auth sync debug...");
        // setTimeout(() => {
            // console.log("[TwitterPostGenerator] TEMPORARY 1s delay ended. Calling callGenerateFlow.");
            callGenerateFlow(false);
        // }, 1000);
    } else if (!canGenerateInitial) {
      setGeneratedPostsInternal([]);
      setTwitterPosts([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, userId, initialGenerationProcessedForTopic]); // callGenerateFlow is memoized, isLoading added to deps to re-evaluate if it becomes false

  const handleRegenerate = () => {
     setParentPostsEmpty(); // Clear posts in parent (PostSelection)
     callGenerateFlow(true); // Call with isRegen true
  };
  
  const showPostsInThisCard = displayGeneratedPostsInCard && generatedPostsInternal.length > 0;
  const showConfirmationMessage = !displayGeneratedPostsInCard && generatedPostsInternal.length > 0 && !isLoading && !isRegenerating;
  const canGenerateOrRegenerate = userId && userId !== "sagepostai-guest-user";

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {(isLoading || isRegenerating) && (
         <div className="flex items-center justify-center p-4 rounded-md bg-slate-700/50">
          <Icons.loader className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-slate-300">{isRegenerating ? "Regenerating..." : "Generating Twitter Posts..."}</span>
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
          Twitter posts generated. Review below.
        </div>
      )}

      {!isLoading && topic && ( 
        <motion.div {...buttonMotionProps} className="w-full">
          <Button 
              onClick={handleRegenerate} 
              disabled={isRegenerating || isLoading || !canGenerateOrRegenerate} 
              className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
              title={!canGenerateOrRegenerate ? "Please log in to regenerate posts." : "Regenerate Twitter Posts (costs 5 credits)"}
            >
            <Icons.refreshCw className="mr-2 h-4 w-4" /> 
            Regenerate Twitter Posts
          </Button>
        </motion.div>
      )}

      {!isLoading && !isRegenerating && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate Twitter posts.</p>
      )}
      {!canGenerateOrRegenerate && topic && !isLoading && !isRegenerating && (
         <p className="text-xs text-slate-400 text-center py-2">Log in to generate or regenerate posts.</p>
      )}
    </motion.div>
  );
};
