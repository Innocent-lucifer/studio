"use client";

import { TopicResearch } from "@/components/TopicResearch";
import { TwitterPostGenerator } from "@/components/TwitterPostGenerator";
import { LinkedInPostGenerator } from "@/components/LinkedInPostGenerator";
import { PostSelection } from "@/components/PostSelection";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Icons } from "@/components/icons";

export default function Home() {
  const [topic, setTopic] = useState<string>("");
  const [researchedContent, setResearchedContent] = useState<string>("");
  const [twitterPosts, setTwitterPosts] = useState<string[]>([]);
  const [linkedinPosts, setLinkedinPosts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8 transition-colors duration-500">
        <main className="container mx-auto w-full max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="h-10 w-10 text-primary"
                fill="currentColor"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm8-82.83,26.39,26.4a8,8,0,0,1-11.32,11.31L128,143.31l-22.07,22.07a8,8,0,0,1-11.32-11.31L116.69,132,93.66,108.9a8,8,0,0,1,11.31-11.31L128,119.31l23.07-23.07a8,8,0,1,1,11.31,11.31Z" />
              </svg>
              <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'hsl(var(--primary))' }}>
                SagePostAI
              </h1>
            </div>
            <HamburgerMenu />
          </header>

          <Card className="mb-8 bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center text-primary">
                <Icons.search className="inline-block mr-2 h-6 w-6" />
                Research Your Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopicResearch
                setTopic={setTopic}
                setResearchedContent={setResearchedContent}
                setIsLoading={setIsLoading}
              />
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex justify-center items-center my-8">
              <Icons.loader className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-4 text-lg">Researching and Crafting Posts...</p>
            </div>
          )}

          {!isLoading && topic && researchedContent && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-center text-primary">
                    <Icons.twitter className="inline-block mr-2 h-5 w-5" />
                    Twitter Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TwitterPostGenerator
                    topic={researchedContent || topic}
                    setTwitterPosts={setTwitterPosts}
                    setIsLoading={setIsLoading}
                  />
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 shadow-xl hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-center text-primary">
                    <Icons.linkedin className="inline-block mr-2 h-5 w-5" />
                    LinkedIn Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LinkedInPostGenerator
                    topic={researchedContent || topic}
                    setLinkedinPosts={setLinkedinPosts}
                    setIsLoading={setIsLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoading && twitterPosts.length > 0 && linkedinPosts.length > 0 && (
            <Card className="mt-8 bg-slate-800/50 border-slate-700 shadow-2xl hover:shadow-primary/30 transition-shadow duration-300 rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center text-primary">
                  <Icons.edit className="inline-block mr-2 h-6 w-6" />
                  Review & Refine Your Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PostSelection
                  twitterPosts={twitterPosts}
                  linkedinPosts={linkedinPosts}
                  topic={topic}
                />
              </CardContent>
            </Card>
          )}
        </main>
        <Toaster />
        <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
          Powered by Genkit and Next.js.
        </footer>
      </div>
    </>
  );
}
