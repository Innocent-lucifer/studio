
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ScrollArea } from "@/components/ui/scroll-area";


import type { SuggestContentAnglesInput, ContentAngle } from '@/ai/flows/suggest-content-angles';
import { suggestContentAngles } from '@/ai/flows/suggest-content-angles';
import type { GenerateCampaignSeriesInput } from '@/ai/flows/generate-campaign-series';
import { generateCampaignSeries } from '@/ai/flows/generate-campaign-series';
import type { SuggestRepurposingIdeasInput } from '@/ai/flows/suggest-repurposing-ideas';
import { suggestRepurposingIdeas } from '@/ai/flows/suggest-repurposing-ideas';

const MOCK_USER_ID = "sagepostai-guest-user"; 

type WizardStep = 'initial' | 'angles' | 'series' | 'repurpose' | 'complete';

const stepConfig: Record<WizardStep, { title: string; icon: keyof typeof Icons; progress: number; description?: string }> = {
  initial: { title: "Smart Campaign Setup", icon: "settings", progress: 0, description: "Missing topic information." },
  angles: { title: "Select Content Angle", icon: "lightbulb", progress: 25, description: "Choose a strategic angle." },
  series: { title: "Generate Campaign Series", icon: "listChecks", progress: 50, description: "Crafting your posts." },
  repurpose: { title: "Get Repurposing Ideas", icon: "repeat", progress: 75, description: "Maximizing content value." },
  complete: { title: "Campaign Ready!", icon: "checkCircle", progress: 100, description: "Your campaign is generated." },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" } }
};

const SmartCampaignWizardInternal: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [topic, setTopic] = useState<string>('');
  const [researchedContent, setResearchedContent] = useState<string>('');
  const [isDataMissing, setIsDataMissing] = useState<boolean>(true);
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('initial');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null);
  
  const [twitterSeries, setTwitterSeries] = useState<string[]>([]);
  const [linkedinSeries, setLinkedinSeries] = useState<string[]>([]);
  
  const [editingSeries, setEditingSeries] = useState<{ platform: 'twitter' | 'linkedin'; index: number; text: string } | null>(null);
  
  const [repurposingIdeas, setRepurposingIdeas] = useState<string[]>([]);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const researchedContentParam = searchParams.get('researchedContent');

    if (topicParam && researchedContentParam) {
      setTopic(topicParam);
      setResearchedContent(researchedContentParam);
      setIsDataMissing(false);
      // Only set to 'angles' and fetch if not already past 'initial' or if data was previously missing
      if (currentStep === 'initial' || angles.length === 0) {
        setCurrentStep('angles');
        handleSuggestAngles(topicParam, researchedContentParam);
      }
    } else {
      setIsDataMissing(true);
      setCurrentStep('initial');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Dependencies ensure this runs when params change. Avoid adding state setters that would cause loops.

  const handleSuggestAngles = async (currentTopic: string, currentResearchedContent: string) => {
    if (!currentTopic || !currentResearchedContent) return; // Prevent call if data is somehow still missing
    setIsLoading(true);
    setLoadingMessage('Brainstorming content angles...');
    try {
      const input: SuggestContentAnglesInput = { topic: currentTopic, researchedContext: currentResearchedContent, userId: MOCK_USER_ID, numAngles: 4 };
      const result = await suggestContentAngles(input);
      if (result.error) {
        toast({ variant: "destructive", title: "Angle Suggestion Failed", description: result.error });
        setAngles([]);
      } else {
        setAngles(result.angles || []);
        if ((result.angles || []).length === 0) {
          toast({ variant: "default", title: "No Angles Suggested", description: "The AI couldn't find specific angles. Try rephrasing your topic or proceed with general content generation."})
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Suggesting Angles", description: error.message || "Failed to suggest angles." });
      setAngles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSeries = async () => {
    if (!selectedAngle || !topic || isDataMissing || !researchedContent) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please select an angle and ensure topic research is complete." });
        return;
    }
    setIsLoading(true);
    setLoadingMessage('Crafting your campaign series...');
    setCurrentStep('series');
    
    // Clear previous series
    setTwitterSeries([]);
    setLinkedinSeries([]);

    try {
      const twitterInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'twitter', researchedContext: researchedContent, userId: MOCK_USER_ID, numPostsInSeries: 3 };
      const linkedinInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'linkedin', researchedContext: researchedContent, userId: MOCK_USER_ID, numPostsInSeries: 3 };
      
      const [twitterResult, linkedinResult] = await Promise.all([
        generateCampaignSeries(twitterInput),
        generateCampaignSeries(linkedinInput)
      ]);

      if (twitterResult.error) {
        toast({ variant: "destructive", title: "Twitter Series Failed", description: twitterResult.error });
      } else {
        setTwitterSeries(twitterResult.series || []);
      }
      
      if (linkedinResult.error) {
        toast({ variant: "destructive", title: "LinkedIn Series Failed", description: linkedinResult.error });
      } else {
        setLinkedinSeries(linkedinResult.series || []);
      }

      if ((twitterResult.series || []).length === 0 && (linkedinResult.series || []).length === 0) {
         toast({ variant: "default", title: "No Series Generated", description: "The AI couldn't generate series for this angle. You can try a different angle or topic." });
      }

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Generating Series", description: error.message || "Failed to generate series." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestRepurposing = async () => {
    if (!topic || !selectedAngle || (twitterSeries.length === 0 && linkedinSeries.length === 0) || isDataMissing) {
      toast({ variant: "destructive", title: "Missing Information", description: "Campaign series must be generated first." });
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Finding repurposing opportunities...');
    setCurrentStep('repurpose');
    setRepurposingIdeas([]); // Clear previous ideas
    try {
      const campaignSummary = `Topic: ${topic}\nAngle: ${selectedAngle.title}\nTwitter Series: ${twitterSeries.join(' ')}\nLinkedIn Series: ${linkedinSeries.join(' ')}`;
      const input: SuggestRepurposingIdeasInput = { topic, selectedAngle: selectedAngle.title, campaignSummary, userId: MOCK_USER_ID, numIdeas: 4 };
      const result = await suggestRepurposingIdeas(input);

      if (result.error) {
        toast({ variant: "destructive", title: "Repurposing Ideas Failed", description: result.error });
      } else {
        setRepurposingIdeas(result.ideas || []);
        if ((result.ideas || []).length === 0) {
          toast({ variant: "default", title: "No Repurposing Ideas", description: "The AI couldn't find repurposing ideas for this campaign." });
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Suggesting Repurposing", description: error.message || "Failed to suggest repurposing ideas." });
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (platform: 'twitter' | 'linkedin', index: number, text: string) => {
    setEditingSeries({ platform, index, text });
  };

  const saveEdit = () => {
    if (!editingSeries) return;
    const { platform, index, text } = editingSeries;
    if (platform === 'twitter') {
      setTwitterSeries(prev => prev.map((item, i) => i === index ? text : item));
    } else {
      setLinkedinSeries(prev => prev.map((item, i) => i === index ? text : item));
    }
    setEditingSeries(null);
    toast({ title: "Post Updated", description: "Your changes have been saved to this campaign." });
  };

  const resetWizard = () => {
    // Reset state for a new campaign on the same page, or navigate
    setTopic('');
    setResearchedContent('');
    setIsDataMissing(true);
    setCurrentStep('initial');
    setAngles([]);
    setSelectedAngle(null);
    setTwitterSeries([]);
    setLinkedinSeries([]);
    setRepurposingIdeas([]);
    setEditingSeries(null);
    // Navigate to home to force re-fetch of query params or clear them
    router.push('/'); 
  };
  
  const handleCopyCampaign = () => {
    const contentToCopy = `
Topic: ${topic}
Selected Angle: ${selectedAngle?.title || 'N/A'}

Twitter Series:
${twitterSeries.map((post, i) => `Tweet ${i+1}:\n${post}`).join('\n\n---\n\n') || 'No Twitter posts generated.'}

LinkedIn Series:
${linkedinSeries.map((post, i) => `LinkedIn Post ${i+1}:\n${post}`).join('\n\n---\n\n') || 'No LinkedIn posts generated.'}

Repurposing Ideas:
${repurposingIdeas.map(idea => `- ${idea}`).join('\n') || 'No repurposing ideas generated.'}
    `;
    navigator.clipboard.writeText(contentToCopy.trim());
    toast({ title: "Campaign Copied!", description: "Full campaign content copied to clipboard." });
  };


  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 rounded-xl shadow-xl min-h-[300px]">
      <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-slate-300">{loadingMessage || "Loading..."}</p>
    </div>
  );

  const CurrentIcon = Icons[stepConfig[currentStep]?.icon || 'help'] || Icons.help;

  return (
    <div className="w-full space-y-8">
      <Card className="bg-slate-800/70 border-slate-700 shadow-2xl rounded-xl">
        <CardHeader className="border-b border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-3">
              <CurrentIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-semibold text-primary">
                {stepConfig[currentStep]?.title || "Smart Campaign"}
              </CardTitle>
            </div>
            <Progress value={stepConfig[currentStep]?.progress || 0} className="w-full sm:w-1/3 h-2 bg-slate-700 [&>div]:bg-primary" />
          </div>
          {topic && !isDataMissing && currentStep !== 'initial' && (
            <CardDescription className="text-slate-400 pt-2">
              Campaign Topic: <span className="font-semibold text-slate-300">{topic}</span>
            </CardDescription>
          )}
           {(isDataMissing || currentStep === 'initial') && (
             <CardDescription className="text-slate-400 pt-2">
                {stepConfig['initial']?.description}
            </CardDescription>
           )}
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div key="loading" {...cardVariants}>
                {renderLoadingState()}
              </motion.div>
            )}

            {!isLoading && currentStep === 'initial' && isDataMissing && (
              <motion.div key="initial-missing-data" {...cardVariants} className="text-center space-y-4 py-8 min-h-[300px] flex flex-col justify-center items-center">
                <Icons.alertTriangle className="h-16 w-16 text-yellow-400 mx-auto" />
                <h3 className="text-2xl font-semibold text-slate-100">Topic Information Needed</h3>
                <p className="text-slate-300 max-w-md mx-auto">
                  To start building a Smart Campaign, please research a topic on the main page first.
                  The Smart Campaign wizard uses this researched information to generate relevant content angles and posts.
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                  <Link href="/">
                    <Icons.arrowLeft className="mr-2 h-5 w-5" />
                    Back to Topic Research
                  </Link>
                </Button>
              </motion.div>
            )}

            {!isLoading && currentStep === 'angles' && !isDataMissing && (
              <motion.div key="angles" {...cardVariants} className="space-y-6">
                <h3 className="text-xl font-medium text-slate-200">{stepConfig.angles.description}</h3>
                <p className="text-slate-400">The AI will generate interconnected content based on your selection.</p>
                {angles.length > 0 ? (
                  <ScrollArea className="h-[300px] pr-3">
                    <RadioGroup 
                      value={selectedAngle?.title}
                      onValueChange={(value) => setSelectedAngle(angles.find(a => a.title === value) || null)}
                      className="space-y-3"
                    >
                      {angles.map((angle, index) => (
                        <Label 
                          key={index} 
                          htmlFor={`angle-${index}`}
                          className="flex flex-col p-4 rounded-lg border border-slate-600 hover:border-primary/70 has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={angle.title} id={`angle-${index}`} className="border-slate-500 text-primary focus:ring-primary" />
                            <span className="font-semibold text-slate-100 text-lg">{angle.title}</span>
                          </div>
                          <p className="ml-8 mt-1 text-sm text-slate-400">{angle.explanation}</p>
                        </Label>
                      ))}
                    </RadioGroup>
                  </ScrollArea>
                ) : (
                  <p className="text-slate-500 py-10 text-center">No content angles available. Try researching a different topic.</p>
                )}
                <Button 
                  onClick={handleGenerateSeries} 
                  disabled={!selectedAngle || isLoading}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                >
                  <Icons.listChecks className="mr-2 h-5 w-5" />
                  Generate Campaign Series
                </Button>
              </motion.div>
            )}

            {!isLoading && currentStep === 'series' && !isDataMissing && (
              <motion.div key="series" {...cardVariants} className="space-y-6">
                 <h3 className="text-xl font-medium text-slate-200">Your Campaign Series for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> Twitter Thread</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ScrollArea className="h-[250px] pr-2">
                        {twitterSeries.map((post, index) => (
                          <div key={`twitter-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2">
                            <p className="whitespace-pre-wrap">{post}</p>
                            <Button variant="link" size="sm" onClick={() => startEdit('twitter', index, post)} className="text-sky-400/80 hover:text-sky-400 p-0 h-auto mt-1">Edit</Button>
                          </div>
                        ))}
                        {twitterSeries.length === 0 && <p className="text-slate-400 text-center py-4">No Twitter posts generated.</p>}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-700/50 border-slate-600">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> LinkedIn Series</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <ScrollArea className="h-[250px] pr-2">
                          {linkedinSeries.map((post, index) => (
                            <div key={`linkedin-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2">
                              <p className="whitespace-pre-wrap">{post}</p>
                              <Button variant="link" size="sm" onClick={() => startEdit('linkedin', index, post)} className="text-blue-400/80 hover:text-blue-400 p-0 h-auto mt-1">Edit</Button>
                            </div>
                          ))}
                          {linkedinSeries.length === 0 && <p className="text-slate-400 text-center py-4">No LinkedIn posts generated.</p>}
                       </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <Button 
                  onClick={handleSuggestRepurposing} 
                  disabled={isLoading || (twitterSeries.length === 0 && linkedinSeries.length === 0)}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                >
                   <Icons.repeat className="mr-2 h-5 w-5" />
                  Suggest Repurposing Ideas
                </Button>
                 <Button variant="outline" onClick={() => setCurrentStep('angles')} className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Icons.arrowLeft className="mr-2 h-5 w-5" /> Back to Angles
                </Button>
              </motion.div>
            )}

            {!isLoading && currentStep === 'repurpose' && !isDataMissing && (
              <motion.div key="repurpose" {...cardVariants} className="space-y-6">
                <h3 className="text-xl font-medium text-slate-200">Repurposing Ideas for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
                {repurposingIdeas.length > 0 ? (
                  <ScrollArea className="h-[300px] pr-3">
                    <ul className="list-disc list-inside space-y-2 pl-4 text-slate-300">
                      {repurposingIdeas.map((idea, index) => (
                        <li key={index} className="p-3 bg-slate-700/50 rounded-md border border-slate-600">{idea}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-slate-400 py-10 text-center">No repurposing ideas generated. You can still finalize your campaign.</p>
                )}
                <Separator className="my-6 bg-slate-700" />
                 <Button 
                  onClick={() => setCurrentStep('complete')}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                >
                  <Icons.checkCircle className="mr-2 h-5 w-5" />
                  Finalize Campaign
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep('series')} className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Icons.arrowLeft className="mr-2 h-5 w-5" /> Back to Series
                </Button>
              </motion.div>
            )}
             {!isLoading && currentStep === 'complete' && !isDataMissing && (
              <motion.div key="complete" {...cardVariants} className="text-center space-y-6 py-8 min-h-[300px] flex flex-col justify-center items-center">
                <Icons.checkCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-100">Your Smart Campaign is Ready!</h2>
                <p className="text-slate-300 max-w-md mx-auto">
                  You've successfully generated content angles, a campaign series, and repurposing ideas for your topic: <span className="font-semibold text-purple-400">{topic}</span>.
                </p>
                <p className="text-slate-400">What would you like to do next?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    onClick={handleCopyCampaign}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Icons.copy className="mr-2 h-5 w-5" /> Copy Full Campaign
                  </Button>
                  <Button 
                    onClick={resetWizard}
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icons.refreshCw className="mr-2 h-5 w-5" /> Start New Campaign
                  </Button>
                </div>
                 <Button 
                    variant="link"
                    onClick={() => setCurrentStep('repurpose')} 
                    className="mt-4 text-slate-400 hover:text-primary">
                     <Icons.arrowLeft className="mr-1 h-4 w-4" /> Back to Repurposing Ideas
                 </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {editingSeries && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-primary">Edit {editingSeries.platform === 'twitter' ? 'Tweet' : 'LinkedIn Post'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingSeries(null)} className="text-slate-400 hover:text-slate-200">
                <Icons.close className="h-5 w-5"/>
              </Button>
            </div>
            <Textarea
              value={editingSeries.text}
              onChange={(e) => setEditingSeries(prev => prev ? { ...prev, text: e.target.value } : null)}
              rows={10}
              className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm"
              placeholder={`Enter your revised ${editingSeries.platform === 'twitter' ? 'tweet' : 'LinkedIn post'}...`}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setEditingSeries(null)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
              <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Icons.save className="mr-2 h-4 w-4"/>
                Save Changes
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export const SmartCampaignWizard: React.FC = () => {
  return (
    // Suspense key ensures re-evaluation if query params change, e.g. navigating to same page with new params
    <Suspense key={typeof window !== 'undefined' ? window.location.search : 'loading'} fallback={
      <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 rounded-xl shadow-xl min-h-[300px]">
        <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-slate-300">Loading Campaign Wizard...</p>
      </div>
    }>
      <SmartCampaignWizardInternal />
    </Suspense>
  );
};

