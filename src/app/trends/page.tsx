
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { fetchPlatformTrends, type Trend } from '@/ai/flows/fetch-platform-trends';
import { useToast } from "@/hooks/use-toast";

type Platform = "Twitter" | "LinkedIn";
const platforms: Platform[] = ["Twitter", "LinkedIn"];

const categories = ["All", "Tech", "Love", "Finance", "Startups", "Fashion", "Memes", "Gaming", "Travel", "Food", "Health", "AI"];

const getPlatformIcon = (platform: Platform) => {
  switch (platform) {
    case "Twitter": return <Icons.twitter className="h-4 w-4" />;
    case "LinkedIn": return <Icons.linkedin className="h-4 w-4" />;
    default: return null;
  }
};

interface TrendCardItemProps {
  trend: Trend;
}

const TrendCardItemComponent: React.FC<TrendCardItemProps> = ({ trend }) => {
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <motion.div layout initial="initial" animate="animate" exit="exit" variants={cardVariants}>
      <Card className="h-full flex flex-col bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-lg hover:shadow-primary/25 hover:border-primary/40 transition-all duration-300 rounded-xl overflow-hidden group">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-primary group-hover:text-purple-400 transition-colors">{trend.title}</CardTitle>
            <div className="flex flex-col items-end shrink-0 ml-2 space-y-1">
              <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600 text-xs">
                {getPlatformIcon(trend.platform)}
                <span className="ml-1.5">{trend.category}</span>
              </Badge>
               <Badge variant={trend.hypeScore > 75 ? "destructive" : "secondary"} className={`${trend.hypeScore > 75 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-slate-600/80 text-slate-400 border-slate-500/50'} text-xs`}>
                <Icons.flame className="mr-1 h-3 w-3" /> {trend.hypeScore}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardDescription className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {trend.description}
          </CardDescription>
        </CardContent>
        <div className="p-4 pt-0 mt-auto">
            <Link href={`/quick-post?topic=${encodeURIComponent(trend.title)}&researchedContent=${encodeURIComponent(trend.description)}`} passHref>
                <Button
                    variant="outline"
                    className="w-full bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 hover:text-purple-300 hover:border-primary/70 transition-all duration-200 ease-in-out transform group-hover:scale-105 shadow-md group-hover:shadow-purple-500/20"
                >
                    <Icons.edit className="mr-2 h-4 w-4" /> Generate Post
                </Button>
            </Link>
        </div>
      </Card>
    </motion.div>
  );
};
const TrendCardItem = React.memo(TrendCardItemComponent);


export default function TrendsPage() {
  const { user } = useAuth();
  const userIdToPass = user?.uid || "sagepostai-guest-user";
  const { toast } = useToast();

  const [trends, setTrends] = useState<Trend[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("Twitter");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filterByHype, setFilterByHype] = useState<boolean>(false);
  const [trendingRegion, setTrendingRegion] = useState<"Global" | "Local">("Global");

  const debouncedFetchTrends = useCallback(
    debounce(async (platform: Platform, category: string, userId: string) => {
      setIsLoading(true);
      setError(null);
      setTrends([]);
      try {
        const result = await fetchPlatformTrends({ platform, category, userId, numTrendsToGenerate: 6 });
        if (result.error) {
          setError(result.error);
          setTrends([]);
          toast({ variant: "destructive", title: "Failed to Fetch Trends", description: result.error });
        } else {
          setTrends(result.trends || []);
          if ((result.trends || []).length === 0) {
            // No specific toast here; the empty state message will cover this.
          }
        }
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred while fetching trends.");
        setTrends([]);
        toast({ variant: "destructive", title: "Error Fetching Trends", description: e.message || "An unexpected error occurred." });
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [toast] 
  );

  useEffect(() => {
    debouncedFetchTrends(selectedPlatform, selectedCategory, userIdToPass);
  }, [selectedPlatform, selectedCategory, userIdToPass, debouncedFetchTrends]);


  const filteredTrends = useMemo(() => {
    return trends
      .filter(trend => !filterByHype || trend.hypeScore > 75)
      .filter(trend => trendingRegion === "Global" ? trend.region === "Global" : trend.region === "Local");
  }, [trends, filterByHype, trendingRegion]);
  
  function debounce<F extends (...args: any[]) => any>(func: F, delay: number) {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8"
    >
      <main className="container mx-auto w-full max-w-5xl">
         <header className="flex justify-between items-center w-full mb-6 sm:mb-8 py-3 sm:py-4 px-4">
           <div className="flex items-center space-x-2 sm:space-x-3">
             <HamburgerMenu />
            <Link href="/dashboard" passHref>
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
                <AppLogo className="h-12 w-12 sm:h-16 sm:w-16 text-primary group-hover:scale-110 transition-transform" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">SagePostAI</h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Trending Topics Explorer</p>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User display removed as per previous request */}
          </div>
        </header>

        <Tabs defaultValue={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as Platform)} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 border border-slate-700 rounded-lg p-1">
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

        <div className="mb-8">
          <ScrollArea className="w-full whitespace-nowrap pb-3">
            <div className="flex space-x-3">
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
        
        <motion.div
            key="filter-controls"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-8 p-4 bg-slate-800/40 border border-slate-700 rounded-xl shadow-lg"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-around gap-x-8 gap-y-4">
                <div className="flex items-center space-x-3">
                    <Switch 
                        id="filter-hype" 
                        checked={filterByHype} 
                        onCheckedChange={setFilterByHype} 
                        className="data-[state=checked]:bg-red-500"
                    />
                    <Label htmlFor="filter-hype" className="text-sm text-slate-200 flex items-center cursor-pointer">
                        <Icons.flame className="mr-2 h-4 w-4 text-red-400"/>Filter by High Hype ({">"}75)
                    </Label>
                </div>
                <div className="flex items-center space-x-3">
                    <Switch
                        id="filter-region"
                        checked={trendingRegion === "Local"}
                        onCheckedChange={(checked) => setTrendingRegion(checked ? "Local" : "Global")}
                        className="data-[state=checked]:bg-blue-500"
                        disabled // Local trends are not fully supported by the flow yet
                    />
                    <Label htmlFor="filter-region" className={`text-sm text-slate-200 flex items-center cursor-pointer ${true ? 'opacity-50' : ''}`}>
                        <Icons.globe className="mr-2 h-4 w-4 text-blue-400"/>Show {trendingRegion} Trends
                    </Label>
                </div>
            </div>
        </motion.div>


        <AnimatePresence>
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center"
            >
              <Icons.loader className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-xl text-slate-300">Searching for the latest buzz...</p>
              <p className="text-sm text-slate-400">This might take a moment.</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center text-red-400 p-6 bg-red-900/20 border border-red-700 rounded-xl"
            >
              <Icons.alertTriangle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-xl font-semibold">Oops! Something went wrong.</p>
              <p className="text-sm mt-1">{error}</p>
              <Button onClick={() => debouncedFetchTrends(selectedPlatform, selectedCategory, userIdToPass)} variant="outline" className="mt-4 border-red-500 text-red-400 hover:bg-red-500/10">
                <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </motion.div>
          ) : filteredTrends.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTrends.map(trend => (
                <TrendCardItem key={trend.id} trend={trend} />
              ))}
            </motion.div>
          ) : (
             <motion.div
              key="no-trends"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-slate-800/40 border border-slate-700 rounded-xl"
            >
              <Icons.search className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-slate-300">No Trends Found</h4>
              <p className="text-slate-400 mt-2 max-w-md">
                We couldn't find any trending topics for <span className="font-semibold text-primary">{selectedPlatform}</span> in the <span className="font-semibold text-primary">{selectedCategory}</span> category that match your filters.
              </p>
              <p className="text-sm text-slate-500 mt-1">Try a different category, adjust the filters, or check back later!</p>
               <Button onClick={() => debouncedFetchTrends(selectedPlatform, selectedCategory, userIdToPass)} variant="outline" className="mt-6 border-primary text-primary hover:bg-primary/10">
                <Icons.refreshCw className="mr-2 h-4 w-4" /> Refresh Trends
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
            Built By EZ Teenagers
            <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </motion.div>
  );
}
