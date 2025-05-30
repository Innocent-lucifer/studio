"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateTwitterPosts } from "@/ai/flows/generate-twitter-posts";
import { motion } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./icons";

interface TwitterPostGeneratorProps {
  topic: string;
  setTwitterPosts: (posts: string[]) => void;
}

export const TwitterPostGenerator: React.FC<TwitterPostGeneratorProps> = ({ topic, setTwitterPosts }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const generate = async () => {
      if (!topic) {
        setGeneratedPosts([]);
        setTwitterPosts([]);
        return;
      }

      setIsLoading(true);
      setGeneratedPosts([]); // Clear previous posts
      try {
        const result = await generateTwitterPosts({ topic: topic, numPosts: 3 });
        setGeneratedPosts(result.posts);
        setTwitterPosts(result.posts);
      } catch (error: any) {
        console.error("Error generating Twitter posts:", error);
        toast({
          variant: "destructive",
          title: "Twitter Post Generation Failed",
          description: error.message || "Failed to generate Twitter posts. Please try again.",
        });
        setGeneratedPosts([]);
        setTwitterPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [topic, setTwitterPosts, toast]);

  const handleRegenerate = async () => {
     setIsLoading(true);
     setGeneratedPosts([]);
     try {
        const result = await generateTwitterPosts({ topic: topic, numPosts: 3 });
        setGeneratedPosts(result.posts);
        setTwitterPosts(result.posts);
      } catch (error: any) {
        console.error("Error re-generating Twitter posts:", error);
        toast({
          variant: "destructive",
          title: "Twitter Post Re-generation Failed",
          description: error.message || "Failed to re-generate Twitter posts. Please try again.",
        });
        setGeneratedPosts([]);
        setTwitterPosts([]);
      } finally {
        setIsLoading(false);
      }
  };

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

      {!isLoading && generatedPosts.length > 0 && (
        <div className="space-y-3">
          {generatedPosts.map((post, index) => (
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

      {!isLoading && topic && (
         <Button 
            onClick={handleRegenerate} 
            disabled={isLoading} 
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground transition-colors duration-200 flex items-center justify-center py-2.5"
          >
          <Icons.refreshCw className="mr-2 h-4 w-4" /> 
          {generatedPosts.length > 0 ? "Regenerate Twitter Posts" : "Generate Twitter Posts"}
        </Button>
      )}

      {!isLoading && !topic && (
        <p className="text-sm text-slate-400 text-center py-4">Research a topic to generate Twitter posts.</p>
      )}
    </motion.div>
  );
};
