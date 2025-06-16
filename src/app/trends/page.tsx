
"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // For horizontal scroll

type Platform = "Twitter" | "LinkedIn" | "Instagram" | "TikTok";
const platforms: Platform[] = ["Twitter", "LinkedIn", "Instagram", "TikTok"];

const categories = ["Tech", "Love", "Finance", "Startups", "Fashion", "Memes", "Gaming", "Travel", "Food", "Health", "AI"];

interface Trend {
  id: string;
  title: string;
  description: string;
  platform: Platform;
  category: string;
  hypeScore: number; // 0-100
  region: "Global" | "Local"; // Simplified
}

// Mock Data - Replace with actual API calls in a real app
const mockTrends: Trend[] = [
  { id: "t1", title: "AI Avatars Taking Over", description: "Everyone's creating their AI-generated profile pictures. What's next?", platform: "Instagram", category: "AI", hypeScore: 95, region: "Global" },
  { id: "t2", title: "The Future of Remote Work", description: "Debates continue: Is hybrid the new norm or are we heading back to offices?", platform: "LinkedIn", category: "Startups", hypeScore: 80, region: "Global" },
  { id: "t3", title: "#SustainableFashionChallenge", description: "Influencers showcase their thrifted and upcycled outfits.", platform: "TikTok", category: "Fashion", hypeScore: 88, region: "Local" },
  { id: "t4", title: "Web3 Gaming Boom", description: "Play-to-earn models are gaining traction. Is it a bubble or the future?", platform: "Twitter", category: "Gaming", hypeScore: 70, region: "Global" },
  { id: "t5", title: "Fintech Disruption in Asia", description: "New payment solutions and digital banks are emerging rapidly.", platform: "LinkedIn", category: "Finance", hypeScore: 75, region: "Global" },
  { id: "t6", title: "Viral Dance Craze", description: "The 'ShuffleBot' dance is everywhere!", platform: "TikTok", category: "Memes", hypeScore: 92, region: "Global" },
  { id: "t7", title: "Ethical AI Discussions", description: "Keynotes and panels on responsible AI development.", platform: "Twitter", category: "Tech", hypeScore: 85, region: "Global" },
  { id: "t8", title: "Quiet Quitting vs. Quiet Thriving", description: "A shift in workplace mindset.", platform: "LinkedIn", category: "Startups", hypeScore: 60, region: "Global" },
  { id: "t9", title: "Vintage Tech Nostalgia", description: "Retro gaming consoles and old gadgets are making a comeback.", platform: "Instagram", category: "Tech", hypeScore: 65, region: "Local" },
  { id: "t10", title: "Relationship Green Flags", description: "Positive traits people are looking for in partners.", platform: "Twitter", category: "Love", hypeScore: 78, region: "Global" },
];


export default function TrendsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("Twitter");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterByHype, setFilterByHype] = useState<boolean>(false);
  const [trendingRegion, setTrendingRegion] = useState<"Global" | "Local">("Global");

  const filteredTrends = useMemo(() => {
    return mockTrends
      .filter(trend => trend.platform === selectedPlatform)
      .filter(trend => !selectedCategory || trend.category === selectedCategory)
      .filter(trend => !filterByHype || trend.hypeScore > 80) // Example threshold
      .filter(trend => trendingRegion === "Global" ? true : trend.region === "Local");
  }, [selectedPlatform, selectedCategory, filterByHype, trendingRegion]);

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3 } }
  };
  
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Twitter": return <Icons.twitter className="h-4 w-4" />;
      case "LinkedIn": return <Icons.linkedin className="h-4 w-4" />;
      case "Instagram": return <Icons.instagram className="h-4 w-4" />;
      case "TikTok": return <Icons.tiktok className="h-4 w-4" />;
      default: return null;
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8"
    >
      <main className="container mx-auto w-full max-w-5xl">
        <header className="flex justify-between items-center w-full mb-8 py-4 px-4">
           <Link href="/" passHref>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
              <AppLogo className="h-12 w-12 sm:h-20 sm:w-20 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">SagePostAI</h1>
                <p className="text-sm text-slate-400 mt-1">Trending Topics Explorer</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
             <div className="text-right text-xs">
                <p className="font-semibold text-primary">Dev Mode</p>
                <p className="text-slate-400">Guest</p>
            </div>
            <HamburgerMenu />
          </div>
        </header>

        {/* Platform Tabs */}
        <Tabs defaultValue="Twitter" onValueChange={(value) => setSelectedPlatform(value as Platform)} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800/70 border border-slate-700 rounded-lg p-1">
            {platforms.map(platform => (
              <TabsTrigger 
                key={platform} 
                value={platform} 
                className="data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-slate-300 hover:bg-slate-700/50 transition-colors rounded-md py-2.5 sm:py-2"
              >
                {platform}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Category Chips */}
        <div className="mb-8">
          <ScrollArea className="w-full whitespace-nowrap pb-3">
            <div className="flex space-x-3">
              <Button
                variant={!selectedCategory ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md
                            ${!selectedCategory ? 'bg-primary/80 text-primary-foreground border-transparent' : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-600/80 hover:border-primary/50 hover:text-primary/90'}`}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 shadow-sm hover:shadow-md
                              ${selectedCategory === category ? 'bg-primary/80 text-primary-foreground border-transparent' : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-600/80 hover:border-primary/50 hover:text-primary/90'}`}
                >
                  {category}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2 [&>div]:bg-slate-600" />
          </ScrollArea>
        </div>

        {/* Floating Toggles */}
         <div className="fixed bottom-6 right-6 z-50 space-y-3 p-3 bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl">
          <div className="flex items-center space-x-2">
            <Switch id="filter-hype" checked={filterByHype} onCheckedChange={setFilterByHype} className="data-[state=checked]:bg-red-500"/>
            <Label htmlFor="filter-hype" className="text-sm text-slate-200 flex items-center"><Icons.flame className="mr-1.5 h-4 w-4 text-red-400"/>Filter by Hype</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="filter-region" 
              checked={trendingRegion === "Local"} 
              onCheckedChange={(checked) => setTrendingRegion(checked ? "Local" : "Global")}
              className="data-[state=checked]:bg-blue-500"
            />
            <Label htmlFor="filter-region" className="text-sm text-slate-200 flex items-center"><Icons.globe className="mr-1.5 h-4 w-4 text-blue-400"/>{trendingRegion}</Label>
          </div>
        </div>


        {/* Trends Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTrends.map(trend => (
            <motion.div key={trend.id} layout initial="initial" animate="animate" exit="exit" variants={cardVariants}>
              <Card className="h-full flex flex-col bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-lg hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-primary group-hover:text-purple-400 transition-colors">{trend.title}</CardTitle>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600 text-xs shrink-0 ml-2">
                      {getPlatformIcon(trend.platform)}
                      <span className="ml-1.5">{trend.category}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                    {trend.description}
                  </CardDescription>
                </CardContent>
                <div className="p-4 pt-0 mt-auto">
                    <Link href={`/?topic=${encodeURIComponent(trend.title)}`} passHref>
                        <Button 
                            variant="outline" 
                            className="w-full bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 hover:text-purple-300 hover:border-primary/70 transition-all duration-200 ease-in-out transform group-hover:scale-105 shadow-md group-hover:shadow-purple-500/20"
                        >
                            <Icons.edit className="mr-2 h-4 w-4" /> Generate Post on This
                        </Button>
                    </Link>
                     {/* Placeholder for "See Angles" - can be enabled later */}
                    {/* <Button variant="ghost" className="w-full mt-2 text-slate-400 hover:text-purple-400">
                        <Icons.layers className="mr-2 h-4 w-4" /> See Angles
                    </Button> */}
                </div>
              </Card>
            </motion.div>
          ))}
           {filteredTrends.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="md:col-span-2 lg:col-span-3 text-center py-16"
            >
              <Icons.search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-xl text-slate-400">No trends match your current filters.</p>
              <p className="text-sm text-slate-500">Try adjusting the platform, category, or filter toggles.</p>
            </motion.div>
          )}
        </motion.div>
      </main>
      <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
            Built By EZ Teenagers.
            <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </motion.div>
  );
}
    
