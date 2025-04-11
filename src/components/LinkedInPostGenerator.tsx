
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateLinkedInPosts } from "@/ai/flows/generate-linkedin-posts";

interface LinkedInPostGeneratorProps {
  topic: string;
  setLinkedinPosts: (posts: string[]) => void;
}

export const LinkedInPostGenerator: React.FC<LinkedInPostGeneratorProps> = ({ topic, setLinkedinPosts }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const generatePosts = async () => {
      if (!topic) return;

      setIsLoading(true);
      try {
        const result = await generateLinkedInPosts({ topic: topic, numPosts: 3 });
        setLinkedinPosts(result.posts);
      } catch (error) {
        console.error("Error generating LinkedIn posts:", error);
        alert("Failed to generate LinkedIn posts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePosts();
  }, [topic, setLinkedinPosts]);

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">LinkedIn Post Generator</h2>
      <Button disabled={isLoading}>
        {isLoading ? "Generating LinkedIn Posts..." : "Generate LinkedIn Posts"}
      </Button>
    </div>
  );
};
