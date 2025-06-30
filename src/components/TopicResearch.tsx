
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { researchTopic } from "@/ai/flows/research-topic";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { Icons } from "./icons";

interface TopicResearchProps {
  initialTopic?: string;
  setTopic: (topic: string) => void;
  setResearchedContent: (content: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  userId: string;
  isLoading: boolean;
  onTrialExpired: () => void;
}

export const TopicResearch: React.FC<TopicResearchProps> = ({ 
  initialTopic,
  setTopic, 
  setResearchedContent, 
  setIsLoading, 
  userId,
  isLoading,
  onTrialExpired,
}) => {
  const [topicInput, setTopicInput] = useState<string>(initialTopic || "");
  const { toast } = useToast();

  useEffect(() => {
    if (initialTopic !== undefined) {
      setTopicInput(initialTopic);
    }
  }, [initialTopic]);

  const buttonMotionProps = {
    whileHover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } },
  };

  const handleResearchTopic = async () => {
    if (!topicInput.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Topic",
        description: "Please enter a topic to research.",
        iconType: "alertTriangle"
      });
      return;
    }

    if (!userId || userId === "sagepostai-guest-user") {
        toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to use the Quick Post Generator.",
        iconType: "lock"
        });
        return;
    }

    setIsLoading(true);
    setResearchedContent(""); 
    setTopic("");

    try {
      const result = await researchTopic({ topic: topicInput, userId: userId }); 
      
      if (result.error) {
        if (result.error === 'TRIAL_EXPIRED') {
          onTrialExpired();
        } else {
          toast({ variant: "destructive", title: "Research Failed", description: result.error, iconType: "alertTriangle" });
        }
        setResearchedContent("");
        setTopic("");
      } else {
        setTopic(topicInput);
        setResearchedContent(result.summary);
      }
    } catch (error: any) {
      console.error("Error researching topic:", error);
      toast({
        variant: "destructive",
        title: "Research Failed",
        description: error.message || "Failed to research topic. Please try again.",
        iconType: "alertTriangle"
      });
      setResearchedContent("");
      setTopic("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-stretch sm:items-center">
        <Input
          type="text"
          placeholder="e.g., 'Latest AI advancements'"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          className="w-full sm:flex-grow bg-slate-700 border-slate-600 placeholder-slate-400 text-white focus:ring-primary focus:border-primary"
          aria-label="Topic for research"
          onKeyDown={(e) => { if (e.key === 'Enter') handleResearchTopic(); }}
          disabled={isLoading}
        />
        <motion.div {...buttonMotionProps} className="w-full sm:w-auto">
          <Button
            onClick={handleResearchTopic}
            disabled={!topicInput.trim() || isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md disabled:opacity-60" 
          >
            {isLoading ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : <Icons.search />} 
            {isLoading ? "Researching..." : "Research"}
          </Button>
        </motion.div>
      </div>
       <p className="mt-2 text-xs text-slate-400">
        Enter a topic and let SagePostAI gather insights and information for your posts.
      </p>
    </motion.div>
  );
};
