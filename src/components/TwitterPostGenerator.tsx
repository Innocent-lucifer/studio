
"use client";

import { useState, useEffect } from "react";
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
  const { toast } = useToast();

  useEffect(() => {
    const generate = async () => {
      if (!topic) {
        setGeneratedPostsInternal([]);
        setTwitterPosts([]); 
        return;
      }

      setIsLoading(true);
      setGeneratedPostsInternal([]); 
      setTwitterPosts([]); 
      try {
        const result = await generateTwitterPosts({ topic: topic, numPosts: 3, userId });
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
    };

    generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, userId]); 

  const handleRegenerate = async () => {
     setIsLoading(true);
     setGeneratedPostsInternal([]);
     setParentPostsEmpty(); 
     try {
        const result = await generateTwitterPosts({ topic: topic, numPosts: 3, userId });
        if (result.error) {
           toast({ variant: "destructive", title: "Generation Error", description: result.error });
           setGeneratedPostsInternal([]);
           setTwitterPosts([]);
        } else {
          setGeneratedPostsInternal(result.posts || []);
          setTwitterPosts(result.posts || []);
        }
      } catch (error: any) {
        console.error("Error re-generating Twitter posts:", error);
        toast({
          variant: "destructive",
          title: "Twitter Post Re-generation Failed",
          description: error.message || "Failed to re-generate Twitter posts. Please try again.",
        });
        setGeneratedPostsInternal([]);
        setTwitterPosts([]);
      } finally {
        setIsLoading(false);
      }
  };
  
  const showPostsInThisCard = displayGeneratedPostsInCard && generatedPostsInternal.length > 0;
  const showConfirmationMessage = !displayGeneratedPostsInCard && generatedPostsInternal.length > 0 && !isLoading;

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
         <Button 
            onClick={handleRegenerate} 
            disabled={isLoading} 
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
          >
          <Icons.refreshCw className="mr-2 h-4 w-4" /> 
          {generatedPostsInternal.length > 0 ? "Regenerate Twitter Posts" : "Generate Twitter Posts"}
        </Button>
      )}

      {!isLoading && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate Twitter posts.</p>
      )}
    </motion.div>
  );
};
