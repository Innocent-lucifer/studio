
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateTwitterPosts } from "@/ai/flows/generate-twitter-posts";

interface TwitterPostGeneratorProps {
  topic: string;
  setTwitterPosts: (posts: string[]) => void;
}

export const TwitterPostGenerator: React.FC<TwitterPostGeneratorProps> = ({ topic, setTwitterPosts }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const generatePosts = async () => {
      if (!topic) return;

      setIsLoading(true);
      try {
        const result = await generateTwitterPosts({ topic: topic, numPosts: 3 });
        setTwitterPosts(result.posts);
      } catch (error) {
        console.error("Error generating Twitter posts:", error);
        alert("Failed to generate Twitter posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePosts();
  }, [topic, setTwitterPosts]);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Twitter Post Generator</h2>
      <Button disabled={isLoading}>
        {isLoading ? "Generating Twitter Posts..." : "Generate Twitter Posts"}
      </Button>
    </div>
  );
};
