
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { researchTopic } from "@/ai/flows/research-topic";
import { useToast } from "@/hooks/use-toast";
import { motion } from 'framer-motion';
import { Icons } from "./icons";

const MOCK_USER_ID = "sagepostai-guest-user";

interface TopicResearchProps {
  setTopic: (topic: string) => void;
  setResearchedContent: (content: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const TopicResearch: React.FC<TopicResearchProps> = ({ setTopic, setResearchedContent, setIsLoading }) => {
  const [topicInput, setTopicInput] = useState<string>("");
  const { toast } = useToast();

  const handleResearchTopic = async () => {
    if (!topicInput.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Topic",
        description: "Please enter a topic to research.",
      });
      return;
    }
    setIsLoading(true);
    setResearchedContent(""); // Clear previous research
    try {
      const result = await researchTopic({ topic: topicInput, userId: MOCK_USER_ID });
      if (result.error) {
        toast({ variant: "destructive", title: "Research Failed", description: result.error });
        setTopic(topicInput); // Still set topic so user knows what failed
        setResearchedContent(`Error researching "${topicInput}": ${result.error}`);
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
      });
      setTopic(topicInput);
      setResearchedContent(`Failed to research "${topicInput}". Please try again.`);
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
          placeholder="e.g., 'I love someone maybe its you, '"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
          className="w-full sm:flex-grow bg-slate-700 border-slate-600 placeholder-slate-400 text-white focus:ring-primary focus:border-primary"
          aria-label="Topic for research"
          onKeyDown={(e) => { if (e.key === 'Enter') handleResearchTopic(); }}
        />
        <Button 
          onClick={handleResearchTopic} 
          disabled={!topicInput.trim()}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-transform transform hover:scale-105"
        >
          <Icons.search className="mr-2 h-5 w-5" />
          Research
        </Button>
      </div>
       <p className="mt-2 text-xs text-slate-400">
        Enter a topic and let SagePostAI gather insights and information for your posts.
      </p>
    </motion.div>
  );
};
