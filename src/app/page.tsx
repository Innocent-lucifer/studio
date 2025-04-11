"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);

  return (
    <div className="container mx-auto p-8 rounded-lg shadow-md bg-white dark:bg-gray-800 transition-colors duration-500">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Social Sage</h1>
      <TopicResearch setTopic={setTopic} />

      {topic && (
        <>
          <TwitterPostGenerator topic={topic} setTwitterPosts={setTwitterPosts} />
          <LinkedInPostGenerator topic={topic} setLinkedinPosts={setLinkedinPosts} />
        </>
      )}

      {twitterPosts.length > 0 && linkedinPosts.length > 0 && (
        <PostSelection twitterPosts={twitterPosts} linkedinPosts={linkedinPosts} />
      )}
    </div>
  );
}
