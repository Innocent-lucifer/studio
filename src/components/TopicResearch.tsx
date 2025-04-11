"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { researchTopic } from "@/ai/flows/research-topic";

interface TopicResearchProps {
  setTopic: (topic: string) => void;
}

export const TopicResearch: React.FC<TopicResearchProps> = ({ setTopic }) => {
  const [topicInput, setTopicInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleResearchTopic = async () => {
    setIsLoading(true);
    try {
      const result = await researchTopic({ topic: topicInput });
      setTopic(result.summary);
    } catch (error) {
      console.error("Error researching topic:", error);
      alert("Failed to research topic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 fade-in">
      <h2 className="text-lg font-semibold mb-2">Topic Research</h2>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter topic for research"
          value={topicInput}
          onChange={(e) => setTopicInput(e.target.value)}
        />
        <Button onClick={handleResearchTopic} disabled={isLoading}>
          {isLoading ? "Researching..." : "Research Topic"}
        </Button>
      </div>
    </div>
  );
};
