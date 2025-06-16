
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"; // Removed DialogClose as it's not explicitly used for manual close
import { useAuth } from "@/context/AuthContext";


import type { SuggestContentAnglesInput, ContentAngle } from '@/ai/flows/suggest-content-angles';
import { suggestContentAngles } from '@/ai/flows/suggest-content-angles';
import type { GenerateCampaignSeriesInput } from '@/ai/flows/generate-campaign-series';
import { generateCampaignSeries } from '@/ai/flows/generate-campaign-series';
import type { SuggestRepurposingIdeasInput } from '@/ai/flows/suggest-repurposing-ideas';
import { suggestRepurposingIdeas } from '@/ai/flows/suggest-repurposing-ideas';
import { generateEditedPost, type GenerateEditedPostInput } from '@/ai/flows/generateEditedPost';


// const MOCK_USER_ID = "sagepostai-guest-user"; // Will use user.uid from useAuth instead

type WizardStep = 'initial' | 'angles' | 'series' | 'repurpose' | 'complete';

const stepConfig: Record<WizardStep, { title: string; icon: keyof typeof Icons; progress: number; description?: string }> = {
  initial: { title: "Smart Campaign Setup", icon: "alertTriangle", progress: 0, description: "Missing topic information to start." },
  angles: { title: "Select Content Angle", icon: "lightbulb", progress: 25, description: "Choose a strategic angle for your campaign." },
  series: { title: "Generate Campaign Series", icon: "listChecks", progress: 50, description: "Crafting your posts based on the selected angle." },
  repurpose: { title: "Get Repurposing Ideas", icon: "repeat", progress: 75, description: "Maximizing content value across platforms." },
  complete: { title: "Campaign Ready!", icon: "checkCircle", progress: 100, description: "Your smart campaign has been generated." },
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
  const { user } = useAuth();
  const userIdToPass = user?.uid || "sagepostai-guest-user";

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
  const [isAiSeriesEditModalOpen, setIsAiSeriesEditModalOpen] = useState(false);
  const [aiSeriesEditInstruction, setAiSeriesEditInstruction] = useState("");
  const [isAiSeriesSubmitting, setIsAiSeriesSubmitting] = useState(false);
  
  const [twitterRepurposingIdeas, setTwitterRepurposingIdeas] = useState<string[]>([]);
  const [linkedinRepurposingIdeas, setLinkedinRepurposingIdeas] = useState<string[]>([]);

  const handleSuggestAngles = useCallback(async (currentTopic: string, currentResearchedContent: string) => {
    if (!currentTopic || !currentResearchedContent) {
      toast({ variant: "destructive", title: "Missing Data", description: "Topic or research content is missing for angle suggestion." });
      setIsLoading(false); 
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Brainstorming content angles...');
    try {
      const input: SuggestContentAnglesInput = { topic: currentTopic, researchedContext: currentResearchedContent, userId: userIdToPass, numAngles: 4 };
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
  }, [toast, userIdToPass]);


  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const researchedContentParam = searchParams.get('researchedContent');

    if (topicParam && researchedContentParam && researchedContentParam.trim() !== "") {
      setTopic(topicParam);
      setResearchedContent(researchedContentParam);
      setIsDataMissing(false);
      if (currentStep === 'initial') {
          setCurrentStep('angles');
      }
    } else {
      setTopic(topicParam || ''); 
      setResearchedContent(''); 
      setIsDataMissing(true);
      setCurrentStep('initial');
    }
  }, [searchParams, currentStep]); 

  useEffect(() => {
    if (currentStep === 'angles' && !isDataMissing && topic && researchedContent && angles.length === 0 && !isLoading) {
      handleSuggestAngles(topic, researchedContent);
    }
  }, [currentStep, isDataMissing, topic, researchedContent, angles.length, isLoading, handleSuggestAngles]);


  const handleGenerateSeries = async () => {
    if (!selectedAngle || !topic || isDataMissing || !researchedContent) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please select an angle and ensure topic research is complete." });
        return;
    }
    setIsLoading(true);
    setLoadingMessage('Crafting your campaign series (Twitter & LinkedIn)...');
    setCurrentStep('series');
    
    setTwitterSeries([]);
    setLinkedinSeries([]);

    try {
      const twitterInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'twitter', researchedContext: researchedContent, userId: userIdToPass, numPostsInSeries: 3 };
      const linkedinInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'linkedin', researchedContext: researchedContent, userId: userIdToPass, numPostsInSeries: 3 };
      
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
    setTwitterRepurposingIdeas([]);
    setLinkedinRepurposingIdeas([]);

    const promises = [];

    if (twitterSeries.length > 0) {
      const twitterInput: SuggestRepurposingIdeasInput = {
        topic,
        selectedAngle: selectedAngle.title,
        campaignSummary: twitterSeries.join('\n\n---\n\n'),
        userId: userIdToPass,
        numIdeas: 3
      };
      promises.push(suggestRepurposingIdeas(twitterInput));
    } else {
       promises.push(Promise.resolve({ ideas: [], error: undefined })); 
    }

    if (linkedinSeries.length > 0) {
      const linkedinInput: SuggestRepurposingIdeasInput = {
        topic,
        selectedAngle: selectedAngle.title,
        campaignSummary: linkedinSeries.join('\n\n---\n\n'),
        userId: userIdToPass,
        numIdeas: 3
      };
      promises.push(suggestRepurposingIdeas(linkedinInput));
    } else {
        promises.push(Promise.resolve({ ideas: [], error: undefined })); 
    }

    try {
      const [twitterResult, linkedinResult] = await Promise.all(promises);

      if (twitterSeries.length > 0 && twitterResult) {
        if (twitterResult.error) {
          toast({ variant: "destructive", title: "Twitter Repurposing Ideas Failed", description: twitterResult.error });
        } else {
          setTwitterRepurposingIdeas(twitterResult.ideas || []);
        }
      }
      
      if (linkedinSeries.length > 0 && linkedinResult) {
        if (linkedinResult.error) {
          toast({ variant: "destructive", title: "LinkedIn Repurposing Ideas Failed", description: linkedinResult.error });
        } else {
          setLinkedinRepurposingIdeas(linkedinResult.ideas || []);
        }
      }
      
      if ((twitterResult?.ideas || []).length === 0 && (linkedinResult?.ideas || []).length === 0) {
         toast({ variant: "default", title: "No Repurposing Ideas", description: "The AI couldn't find repurposing ideas for this campaign." });
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
  
  const handleAiSeriesEditSubmit = async () => {
    if (!editingSeries || !aiSeriesEditInstruction.trim() || !topic) {
      toast({
        title: "Missing Information",
        description: "Post context or AI instruction is missing.",
        variant: "destructive",
      });
      return;
    }
    setIsAiSeriesSubmitting(true);
    try {
      const input: GenerateEditedPostInput = {
        originalPost: editingSeries.text,
        editInstruction: aiSeriesEditInstruction,
        topic: topic, 
        platform: editingSeries.platform,
        userId: userIdToPass,
      };
      const result = await generateEditedPost(input);

      if (result.error) {
        toast({ variant: "destructive", title: "AI Edit Error", description: result.error});
      } else if (result.editedPost) {
        setEditingSeries(prev => prev ? { ...prev, text: result.editedPost! } : null);
        toast({
          title: "AI Edit Applied",
          description: "The AI has revised the post. Review and save your changes.",
        });
        setIsAiSeriesEditModalOpen(false);
        setAiSeriesEditInstruction("");
      } else {
         toast({ variant: "destructive", title: "AI Edit Failed", description: "AI did not return an edited post."});
      }
    } catch (error: any) {
      console.error("Error applying AI edit to series post:", error);
      toast({
        title: "AI Edit Exception",
        description: error.message || "Could not apply AI changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiSeriesSubmitting(false);
    }
  };


  const resetWizard = () => {
    setTopic('');
    setResearchedContent('');
    setIsDataMissing(true); 
    setCurrentStep('initial');
    setAngles([]);
    setSelectedAngle(null);
    setTwitterSeries([]);
    setLinkedinSeries([]);
    setTwitterRepurposingIdeas([]);
    setLinkedinRepurposingIdeas([]);
    setEditingSeries(null);
    setIsAiSeriesEditModalOpen(false);
    setAiSeriesEditInstruction("");
    router.push('/smart-campaign'); 
  };
  
  const handleCopyCampaign = () => {
    let contentToCopy = `Smart Campaign for Topic: ${topic}\nSelected Angle: ${selectedAngle?.title || 'N/A'}\n\n`;

    if (twitterSeries.length > 0) {
      contentToCopy += `=== Twitter Series ===\n`;
      contentToCopy += twitterSeries.map((post, i) => `Tweet ${i+1}:\n${post}`).join('\n\n---\n\n');
      contentToCopy += `\n\n`;
    } else {
      contentToCopy += `=== Twitter Series ===\nNo Twitter posts generated.\n\n`;
    }
    
    if (twitterRepurposingIdeas.length > 0) {
        contentToCopy += `--- Repurposing Ideas for Twitter ---\n`;
        contentToCopy += twitterRepurposingIdeas.map(idea => `- ${idea}`).join('\n');
        contentToCopy += `\n\n`;
    }


    if (linkedinSeries.length > 0) {
      contentToCopy += `=== LinkedIn Series ===\n`;
      contentToCopy += linkedinSeries.map((post, i) => `LinkedIn Post ${i+1}:\n${post}`).join('\n\n---\n\n');
      contentToCopy += `\n\n`;
    } else {
       contentToCopy += `=== LinkedIn Series ===\nNo LinkedIn posts generated.\n\n`;
    }

    if (linkedinRepurposingIdeas.length > 0) {
        contentToCopy += `--- Repurposing Ideas for LinkedIn ---\n`;
        contentToCopy += linkedinRepurposingIdeas.map(idea => `- ${idea}`).join('\n');
        contentToCopy += `\n\n`;
    }
    
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

  const renderStepContent = () => {    
    if (isLoading) {
      return renderLoadingState();
    }

    switch (currentStep) {
      case 'initial':
        if (isDataMissing) {
          return (
            <motion.div key="initial-missing-data" initial="hidden" animate="visible" exit="exit" variants={cardVariants} className="text-center space-y-4 py-8 min-h-[300px] flex flex-col justify-center items-center">
              <Icons.alertTriangle className="h-16 w-16 text-yellow-400 mx-auto" />
              <h3 className="text-2xl font-semibold text-slate-100">Topic Information Needed</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                To start building a Smart Campaign, please research a topic on the main page first.
                The Smart Campaign wizard uses this researched information to generate relevant content angles and posts.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                <Link href="/quick-post">
                  <Icons.arrowLeft className="mr-2 h-5 w-5" />
                  Back to Topic Research
                </Link>
              </Button>
            </motion.div>
          );
        }
        return <div className="min-h-[300px]" />; 

      case 'angles':
        if (!isDataMissing) {
          return (
            <motion.div key="angles" initial="hidden" animate="visible" exit="exit" variants={cardVariants} className="space-y-6 min-h-[350px]">
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
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <Icons.info className="w-12 h-12 text-slate-500 mb-4" />
                  <p className="text-slate-400 text-lg">No content angles available currently.</p>
                  <p className="text-slate-500 text-sm mt-1">
                    This might be due to the nature of the topic or a temporary issue.
                  </p>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSuggestAngles(topic, researchedContent)} 
                      className="mt-4 border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={isLoading || !topic || !researchedContent}
                    >
                      <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
              )}
              <Button 
                onClick={handleGenerateSeries} 
                disabled={!selectedAngle || isLoading || angles.length === 0}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              >
                <Icons.listChecks className="mr-2 h-5 w-5" />
                Generate Campaign Series
              </Button>
            </motion.div>
          );
        }
        return <div className="min-h-[350px]" />; 
      
      case 'series':
         if (!isDataMissing) {
          return (
            <motion.div key="series" initial="hidden" animate="visible" exit="exit" variants={cardVariants} className="space-y-6">
              <h3 className="text-xl font-medium text-slate-200">Your Campaign Series for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> Twitter Thread</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ScrollArea className="h-[300px] pr-2">
                      {twitterSeries.length > 0 ? twitterSeries.map((post, index) => (
                        <div key={`twitter-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2">
                          <p className="whitespace-pre-wrap">{post}</p>
                          <Button variant="link" size="sm" onClick={() => startEdit('twitter', index, post)} className="text-sky-400/80 hover:text-sky-400 p-0 h-auto mt-1">Edit</Button>
                        </div>
                      )) : <p className="text-slate-400 text-center py-4">No Twitter posts generated.</p>}
                    </ScrollArea>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> LinkedIn Series</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      <ScrollArea className="h-[300px] pr-2">
                        {linkedinSeries.length > 0 ? linkedinSeries.map((post, index) => (
                          <div key={`linkedin-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2">
                            <p className="whitespace-pre-wrap">{post}</p>
                            <Button variant="link" size="sm" onClick={() => startEdit('linkedin', index, post)} className="text-blue-400/80 hover:text-blue-400 p-0 h-auto mt-1">Edit</Button>
                          </div>
                        )) : <p className="text-slate-400 text-center py-4">No LinkedIn posts generated.</p>}
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
          );
        }
        return <div className="min-h-[350px]" />; 

      case 'repurpose':
        if (!isDataMissing) {
          return (
            <motion.div key="repurpose" initial="hidden" animate="visible" exit="exit" variants={cardVariants} className="space-y-6">
              <h3 className="text-xl font-medium text-slate-200 mb-1">Repurposing Ideas for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
              <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                          <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> For Your Twitter Series</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ScrollArea className="h-[250px] pr-2">
                              {twitterRepurposingIdeas.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                                      {twitterRepurposingIdeas.map((idea, index) => (
                                          <li key={`twitter-repurpose-${index}`} className="p-2 bg-slate-600/50 rounded-md">{idea}</li>
                                      ))}
                                  </ul>
                              ) : (
                                  <p className="text-slate-400 text-center py-4">
                                    {twitterSeries.length > 0 ? "No specific repurposing ideas generated for Twitter." : "No Twitter series available to generate ideas."}
                                  </p>
                              )}
                          </ScrollArea>
                      </CardContent>
                  </Card>
                  <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                          <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> For Your LinkedIn Series</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <ScrollArea className="h-[250px] pr-2">
                              {linkedinRepurposingIdeas.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                                      {linkedinRepurposingIdeas.map((idea, index) => (
                                          <li key={`linkedin-repurpose-${index}`} className="p-2 bg-slate-600/50 rounded-md">{idea}</li>
                                      ))}
                                  </ul>
                              ) : (
                                    <p className="text-slate-400 text-center py-4">
                                    {linkedinSeries.length > 0 ? "No specific repurposing ideas generated for LinkedIn." : "No LinkedIn series available to generate ideas."}
                                  </p>
                              )}
                          </ScrollArea>
                      </CardContent>
                  </Card>
              </div>
              {(twitterRepurposingIdeas.length === 0 && linkedinRepurposingIdeas.length === 0 && (twitterSeries.length > 0 || linkedinSeries.length > 0)) && (
                  <div className="flex flex-col items-center justify-center text-center mt-4">
                      <Icons.info className="w-10 h-10 text-slate-500 mb-2" />
                      <p className="text-slate-400 text-md">The AI couldn't find repurposing ideas for the generated content.</p>
                      <Button 
                          variant="outline" 
                          onClick={handleSuggestRepurposing} 
                          className="mt-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                          disabled={isLoading}
                      >
                          <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Generating Ideas Again
                      </Button>
                  </div>
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
          );
        }
        return <div className="min-h-[350px]" />; 
      
      case 'complete':
        if (!isDataMissing) {
          return (
            <motion.div key="complete" initial="hidden" animate="visible" exit="exit" variants={cardVariants} className="text-center space-y-6 py-8 min-h-[300px] flex flex-col justify-center items-center">
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
          );
        }
        return <div className="min-h-[300px]" />; 

      default:
        return <div className="min-h-[300px]" />; 
    }
  };

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
           {(isDataMissing || currentStep === 'initial') && stepConfig['initial']?.description && (
             <CardDescription className="text-slate-400 pt-2">
                {stepConfig['initial']?.description}
            </CardDescription>
           )}
        </CardHeader>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Main Edit Modal for Series Posts */}
      <Dialog open={!!editingSeries} onOpenChange={(isOpen) => !isOpen && setEditingSeries(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit {editingSeries?.platform === 'twitter' ? 'Tweet' : 'LinkedIn Post'}</DialogTitle>
             <DialogDescription className="text-slate-400">
                  Refine your post. Use "Make AI Change" for AI assistance or edit manually.
              </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingSeries?.text || ''}
            onChange={(e) => setEditingSeries(prev => prev ? { ...prev, text: e.target.value } : null)}
            rows={10}
            className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
            placeholder={`Enter your revised ${editingSeries?.platform === 'twitter' ? 'tweet' : 'LinkedIn post'}...`}
          />
          <DialogFooter className="mt-4 sm:justify-between">
            <Button variant="outline" onClick={() => setEditingSeries(null)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button onClick={() => setIsAiSeriesEditModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Icons.sparkles className="mr-2 h-4 w-4" /> Make AI Change
              </Button>
              <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Icons.save className="mr-2 h-4 w-4"/>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Nested AI Edit Instruction Modal for Series Posts */}
      <Dialog open={isAiSeriesEditModalOpen} onOpenChange={setIsAiSeriesEditModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">AI-Powered Editing</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tell the AI how you want to change the current post.
              E.g., "Make it more concise", "Add a question at the end".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Make it more professional and add relevant hashtags"
            value={aiSeriesEditInstruction}
            onChange={(e) => setAiSeriesEditInstruction(e.target.value)}
            rows={3}
            className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAiSeriesEditModalOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
            <Button onClick={handleAiSeriesEditSubmit} disabled={isAiSeriesSubmitting || !aiSeriesEditInstruction.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isAiSeriesSubmitting ? <Icons.loader className="animate-spin mr-2 h-4 w-4" /> : <Icons.wand className="mr-2 h-4 w-4" />}
              Apply AI Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export const SmartCampaignWizard: React.FC = () => {
  const searchParamsString = typeof window !== 'undefined' ? window.location.search : 'stableInitialKey';
  
  return (
    <Suspense key={searchParamsString} fallback={
      <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 rounded-xl shadow-xl min-h-[300px]">
        <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-slate-300">Loading Campaign Wizard...</p>
      </div>
    }>
      <SmartCampaignWizardInternal />
    </Suspense>
  );
};
