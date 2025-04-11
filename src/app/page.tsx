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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Social Sage</h1>
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

