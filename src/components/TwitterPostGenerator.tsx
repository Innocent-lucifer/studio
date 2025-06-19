
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
  const { toast } = useToast();

  const buttonMotionProps = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } },
  };

  const callGenerateFlow = useCallback(async (isRegen: boolean) => {
    if (!topic) {
      setGeneratedPostsInternal([]);
      setTwitterPosts([]); 
      return;
    }

    if(isRegen) setIsRegenerating(true); else setIsLoading(true);
    setGeneratedPostsInternal([]); 
    setTwitterPosts([]); 

    try {
      const result = await generateTwitterPosts({ 
        topic: topic, 
        topicDisplay: topic, // Pass topic as topicDisplay for consistency
        numPosts: 3, 
        userId,
        isRegeneration: isRegen 
      });

      if (result.error) {
         toast({ variant: "destructive", title: "Generation Error", description: result.error });
         setGeneratedPostsInternal([]);
         setTwitterPosts([]);
      } else {
        setGeneratedPostsInternal(result.posts || []);
        setTwitterPosts(result.posts || []);
        if (result.freePostUsedThisTime) {
          toast({ title: "Free Post Used!", description: "Your first Quick Post generation was on us!" });
        } else if (result.creditsSpent && result.creditsSpent > 0) {
          toast({ title: "Credits Used", description: `${result.creditsSpent} credits were used for this generation.`});
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
    } finally {
      if(isRegen) setIsRegenerating(false); else setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, userId, toast, setTwitterPosts]);

  useEffect(() => {
    // Initial generation when topic changes
    if (topic && userId) {
       callGenerateFlow(false);
    } else {
      // Clear posts if topic is removed or user logs out
      setGeneratedPostsInternal([]);
      setTwitterPosts([]);
    }
  }, [topic, userId, callGenerateFlow]); 

  const handleRegenerate = () => {
     setParentPostsEmpty(); 
     callGenerateFlow(true);
  };
  
  const showPostsInThisCard = displayGeneratedPostsInCard && generatedPostsInternal.length > 0;
  const showConfirmationMessage = !displayGeneratedPostsInCard && generatedPostsInternal.length > 0 && !isLoading && !isRegenerating;

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

      {!isLoading && topic && ( // Show regenerate button only if not initial loading and topic exists
        <motion.div {...buttonMotionProps} className="w-full">
          <Button 
              onClick={handleRegenerate} 
              disabled={isRegenerating || isLoading || !userId} // Disable if any loading is active or no user
              className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
            >
            <Icons.refreshCw className="mr-2 h-4 w-4" /> 
            Regenerate Twitter Posts
          </Button>
        </motion.div>
      )}

      {!isLoading && !isRegenerating && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate Twitter posts.</p>
      )}
    </motion.div>
  );
};
