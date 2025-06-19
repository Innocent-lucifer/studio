
"use client";

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { researchTopic, type ResearchTopicInput, type ResearchTopicOutput } from '@/ai/flows/research-topic';
import type { SuggestContentAnglesInput, ContentAngle } from '@/ai/flows/suggest-content-angles';
import { suggestContentAngles } from '@/ai/flows/suggest-content-angles';
import type { GenerateCampaignSeriesInput } from '@/ai/flows/generate-campaign-series';
import { generateCampaignSeries } from '@/ai/flows/generate-campaign-series';
import type { SuggestRepurposingIdeasInput } from '@/ai/flows/suggest-repurposing-ideas';
import { suggestRepurposingIdeas } from '@/ai/flows/suggest-repurposing-ideas';
import { generateEditedPost, type GenerateEditedPostInput } from '@/ai/flows/generateEditedPost';
import { saveDraft } from '@/lib/firebaseUserActions';

type WizardStep = 'topic_research' | 'angles' | 'series' | 'repurpose' | 'complete' | 'initial_error';

const stepConfig: Record<WizardStep, { title: string; icon: keyof typeof Icons; progress: number; description?: string }> = {
  initial_error: { title: "Campaign Setup Needed", icon: "alertTriangle", progress: 0, description: "Please provide a topic to start or research one below." },
  topic_research: { title: "Research Campaign Topic", icon: "search", progress: 10, description: "Enter a topic to research for your campaign." },
  angles: { title: "Select Content Angle", icon: "lightbulb", progress: 25, description: "Choose a strategic angle for your campaign." },
  series: { title: "Generate & Refine Campaign Series", icon: "listChecks", progress: 50, description: "Crafting and editing your posts based on the selected angle." },
  repurpose: { title: "Get Repurposing Ideas", icon: "repeat", progress: 75, description: "Maximizing content value across platforms." },
  complete: { title: "Campaign Ready!", icon: "checkCircle", progress: 100, description: "Your smart campaign has been generated." },
};

const cardMotionProps = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i:number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.3,
      ease: "easeOut"
    },
  }),
};

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};


const SmartCampaignWizardInternal: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const userIdToPass = user?.uid;

  const [campaignTopic, setCampaignTopic] = useState<string>('');
  const [currentResearchedContent, setCurrentResearchedContent] = useState<string>('');
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('topic_research');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isSavingDraft, setIsSavingDraft] = useState<{ platform: 'twitter' | 'linkedin', index: number } | null>(null);

  const [angles, setAngles] = useState<ContentAngle[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<ContentAngle | null>(null);
  
  const [twitterSeries, setTwitterSeries] = useState<string[]>([]);
  const [linkedinSeries, setLinkedinSeries] = useState<string[]>([]);
  
  const [editingPost, setEditingPost] = useState<{ platform: 'twitter' | 'linkedin'; index: number; originalText: string; currentText: string } | null>(null);
  const [isAiEditModalOpen, setIsAiEditModalOpen] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  
  const [twitterRepurposingIdeas, setTwitterRepurposingIdeas] = useState<string[]>([]);
  const [linkedinRepurposingIdeas, setLinkedinRepurposingIdeas] = useState<string[]>([]);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const researchedContentParam = searchParams.get('researchedContent');

    if (topicParam && researchedContentParam && researchedContentParam.trim() !== "") {
      setCampaignTopic(topicParam);
      setCurrentResearchedContent(researchedContentParam);
      setCurrentStep('angles'); 
    } else {
      setCurrentStep('topic_research');
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentStep === 'angles' && campaignTopic && currentResearchedContent && angles.length === 0 && !isLoading && userIdToPass) {
      handleSuggestAngles(campaignTopic, currentResearchedContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, campaignTopic, currentResearchedContent, angles.length, isLoading, userIdToPass]);


  const handleInternalTopicResearch = async () => {
    if (!campaignTopic.trim()) {
      toast({ variant: "destructive", title: "Topic Required", description: "Please enter a topic to research." });
      return;
    }
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to research topics." });
      return;
    }
    setIsLoading(true);
    setLoadingMessage(`Researching "${campaignTopic}"... This may take a moment.`);
    setCurrentResearchedContent(''); 
    setAngles([]); 
    setSelectedAngle(null); 

    try {
      const result = await researchTopic({ topic: campaignTopic, userId: userIdToPass });
      if (result.error || !result.summary) {
        toast({ variant: "destructive", title: "Research Failed", description: result.error || "Could not retrieve research summary." });
        setCurrentResearchedContent(''); 
      } else {
        setCurrentResearchedContent(result.summary);
        toast({ title: "Research Complete!", description: `Now select a content angle for "${campaignTopic}".` });
        setCurrentStep('angles'); 
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Research Error", description: error.message || "An unexpected error occurred." });
      setCurrentResearchedContent('');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };


  const handleSuggestAngles = useCallback(async (currentTopic: string, currentResearch: string) => {
    if (!currentTopic || !currentResearch) {
      toast({ variant: "destructive", title: "Missing Data", description: "Topic or research content is missing for angle suggestion." });
      return;
    }
     if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to suggest angles." });
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Brainstorming content angles... Please wait.');
    try {
      const input: SuggestContentAnglesInput = { topic: currentTopic, researchedContext: currentResearch, userId: userIdToPass, numAngles: 4 };
      const result = await suggestContentAngles(input);
      if (result.error) {
        toast({ variant: "destructive", title: "Angle Suggestion Failed", description: result.error });
        setAngles([]);
      } else {
        setAngles(result.angles || []);
        if ((result.angles || []).length === 0) {
          // Handled by empty state in render
        }
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Suggesting Angles", description: error.message || "Failed to suggest angles." });
      setAngles([]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [toast, userIdToPass]);


  const handleGenerateSeries = async () => {
    if (!selectedAngle || !campaignTopic || !currentResearchedContent) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please select an angle and ensure topic research is complete." });
        return;
    }
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to generate series." });
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Crafting your campaign series (Twitter & LinkedIn)... This can take a bit.');
    
    setTwitterSeries([]);
    setLinkedinSeries([]);

    try {
      const twitterInput: GenerateCampaignSeriesInput = { topic: campaignTopic, selectedAngle: selectedAngle.title, platform: 'twitter', researchedContext: currentResearchedContent, userId: userIdToPass, numPostsInSeries: 3 };
      const linkedinInput: GenerateCampaignSeriesInput = { topic: campaignTopic, selectedAngle: selectedAngle.title, platform: 'linkedin', researchedContext: currentResearchedContent, userId: userIdToPass, numPostsInSeries: 3 };
      
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
         // Handled by empty state in render
      }
      setCurrentStep('series'); 

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Generating Series", description: error.message || "Failed to generate series." });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  
 const handleSuggestRepurposing = async () => {
    if (!campaignTopic || !selectedAngle || (twitterSeries.length === 0 && linkedinSeries.length === 0) ) {
      toast({ variant: "destructive", title: "Missing Information", description: "Campaign series must be generated first." });
      return;
    }
     if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to suggest repurposing ideas." });
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Finding repurposing opportunities... One moment.');
    
    setTwitterRepurposingIdeas([]);
    setLinkedinRepurposingIdeas([]);

    const promises = [];

    if (twitterSeries.length > 0) {
      const twitterInput: SuggestRepurposingIdeasInput = {
        topic: campaignTopic,
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
        topic: campaignTopic,
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
         // Handled by empty state in render
      }
      setCurrentStep('repurpose'); 

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error Suggesting Repurposing", description: error.message || "Failed to suggest repurposing ideas." });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleOpenEditModal = (platform: 'twitter' | 'linkedin', index: number, text: string) => {
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to edit posts." });
      return;
    }
    setEditingPost({ platform, index, originalText: text, currentText: text });
  };

  const handleSaveEditedPost = () => {
    if (!editingPost) return;
    const { platform, index, currentText } = editingPost;
    if (platform === 'twitter') {
      setTwitterSeries(prev => prev.map((item, i) => (i === index ? currentText : item)));
    } else {
      setLinkedinSeries(prev => prev.map((item, i) => (i === index ? currentText : item)));
    }
    setEditingPost(null);
    toast({ title: "Post Updated", description: "Your changes have been saved to this campaign." });
  };
  
  const handleAiEditForSeriesPost = async () => {
    if (!editingPost || !aiEditInstruction.trim() || !campaignTopic) {
      toast({ title: "Missing Information", description: "Post context or AI instruction is missing.", variant: "destructive" });
      return;
    }
     if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in for AI editing." });
      return;
    }
    setIsAiSubmitting(true);
    try {
      const input: GenerateEditedPostInput = {
        originalPost: editingPost.currentText, 
        editInstruction: aiEditInstruction,
        topic: campaignTopic, 
        platform: editingPost.platform,
        userId: userIdToPass,
      };
      const result = await generateEditedPost(input);

      if (result.error) {
        toast({ variant: "destructive", title: "AI Edit Error", description: result.error });
      } else if (result.editedPost) {
        setEditingPost(prev => prev ? { ...prev, currentText: result.editedPost! } : null); 
        toast({ title: "AI Edit Applied", description: "The AI has revised the post in the editor. Review and save." });
        setIsAiEditModalOpen(false); 
        setAiEditInstruction("");
      } else {
         toast({ variant: "destructive", title: "AI Edit Failed", description: "AI did not return an edited post." });
      }
    } catch (error: any) {
      toast({ title: "AI Edit Exception", description: error.message || "Could not apply AI changes.", variant: "destructive" });
    } finally {
      setIsAiSubmitting(false);
    }
  };

  const handleSaveCampaignPostAsDraft = async (platform: 'twitter' | 'linkedin', index: number, content: string) => {
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to save drafts." });
      return;
    }
    setIsSavingDraft({ platform, index });
    const draftData = {
      content,
      platform,
      topic: `${campaignTopic} (${selectedAngle?.title || 'General Angle'})`,
    };
    const savedDraft = await saveDraft(userIdToPass, draftData);
    if (savedDraft) {
      toast({ title: "Draft Saved!", description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} post from campaign saved.` });
    } else {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save the draft." });
    }
    setIsSavingDraft(null);
  };


  const resetWizard = () => {
    setCampaignTopic('');
    setCurrentResearchedContent('');
    setCurrentStep('topic_research');
    setAngles([]);
    setSelectedAngle(null);
    setTwitterSeries([]);
    setLinkedinSeries([]);
    setTwitterRepurposingIdeas([]);
    setLinkedinRepurposingIdeas([]);
    setEditingPost(null);
    setIsAiEditModalOpen(false);
    setAiEditInstruction("");
    router.push('/smart-campaign'); 
  };
  
  const handleCopyCampaign = () => {
    let contentToCopy = `Smart Campaign for Topic: ${campaignTopic}\nSelected Angle: ${selectedAngle?.title || 'N/A'}\n\n`;

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

  const renderLoadingState = (message?: string) => (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 rounded-xl shadow-xl min-h-[300px]">
      <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-slate-300">{message || loadingMessage || "Loading..."}</p>
    </div>
  );

  const CurrentIcon = Icons[stepConfig[currentStep]?.icon || 'help'] || Icons.help;

  const renderStepContent = () => {    
    if (isLoading && !['topic_research'].includes(currentStep)) { // Keep topic_research step visible while its specific loading happens
      return renderLoadingState();
    }
     if (!authLoading && !userIdToPass && currentStep !== 'initial_error' && currentStep !== 'topic_research') {
        return (
            <motion.div key="login-prompt" {...cardMotionProps} className="text-center space-y-4 py-8 min-h-[300px] flex flex-col justify-center items-center">
                <Icons.lock className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-2xl font-semibold text-slate-100">Login Required</h3>
                <p className="text-slate-300 max-w-md mx-auto">
                    Please log in to build your smart campaign.
                </p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                    <Link href="/login?redirect=/smart-campaign">
                        <Icons.logIn className="mr-2 h-5 w-5" /> Login to Continue
                    </Link>
                </Button>
            </motion.div>
        );
    }


    switch (currentStep) {
      case 'initial_error':
          return (
            <motion.div key="initial-error" {...cardMotionProps} className="text-center space-y-4 py-8 min-h-[300px] flex flex-col justify-center items-center">
              <Icons.alertTriangle className="h-16 w-16 text-yellow-400 mx-auto" />
              <h3 className="text-2xl font-semibold text-slate-100">{stepConfig.initial_error.title}</h3>
              <p className="text-slate-300 max-w-md mx-auto">
                {stepConfig.initial_error.description}
              </p>
              <Button onClick={() => setCurrentStep('topic_research')} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4">
                <Icons.edit className="mr-2 h-5 w-5" />
                Enter Topic Manually
              </Button>
               <p className="text-sm text-slate-400">Or</p>
               <Button asChild variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Link href="/quick-post">
                  <Icons.arrowLeft className="mr-2 h-4 w-4" /> Go to Quick Post Research
                </Link>
              </Button>
            </motion.div>
          );
      
      case 'topic_research':
        return (
          <motion.div key="topic-research" {...cardMotionProps} className="space-y-6 min-h-[300px]">
            <h3 className="text-xl font-medium text-slate-200">{stepConfig.topic_research.description}</h3>
             <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="e.g., 'Future of AI in Marketing'"
                value={campaignTopic}
                onChange={(e) => setCampaignTopic(e.target.value)}
                className="flex-grow bg-slate-700 border-slate-600 placeholder-slate-400 text-white focus:ring-primary focus:border-primary"
                disabled={isLoading}
              />
              <Button
                onClick={handleInternalTopicResearch}
                disabled={!campaignTopic.trim() || isLoading || !userIdToPass}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground sm:w-auto w-full disabled:opacity-60"
                 title={!userIdToPass ? "Please log in to research" : ""}
              >
                {isLoading && loadingMessage.includes("Researching") ? <Icons.loader className="mr-2 h-5 w-5 animate-spin" /> : <Icons.search className="mr-2 h-5 w-5" />}
                Research Topic
              </Button>
            </div>
            {isLoading && loadingMessage.includes("Researching") && <p className="text-sm text-slate-400 text-center">{loadingMessage}</p>}
            {!userIdToPass && <p className="text-xs text-slate-400 text-center mt-2">Log in to research topics and build campaigns.</p>}
            <p className="text-xs text-slate-400">
              Alternatively, you can start from the <Link href="/quick-post" className="underline hover:text-primary">Quick Post</Link> page to pre-fill topic and research.
            </p>
          </motion.div>
        );

      case 'angles':
          return (
            <motion.div key="angles" {...cardMotionProps} className="space-y-6 min-h-[350px]">
              <h3 className="text-xl font-medium text-slate-200">{stepConfig.angles.description}</h3>
              <p className="text-slate-400">The AI will generate interconnected content based on your selection for: <span className="font-semibold text-purple-300">{campaignTopic}</span></p>
              {isLoading && loadingMessage.includes("Brainstorming") ? (
                 renderLoadingState(loadingMessage)
              ) : angles.length > 0 ? (
                <ScrollArea className="h-[300px] pr-3">
                  <motion.div variants={listContainerVariants} initial="hidden" animate="visible">
                    <RadioGroup 
                      value={selectedAngle?.title}
                      onValueChange={(value) => setSelectedAngle(angles.find(a => a.title === value) || null)}
                      className="space-y-3"
                    >
                      {angles.map((angle, index) => (
                        <motion.div key={index} custom={index} variants={listItemVariants}>
                          <Label 
                            htmlFor={`angle-${index}`}
                            className="flex flex-col p-4 rounded-lg border border-slate-600 hover:border-primary/70 has-[:checked]:border-primary has-[:checked]:bg-primary/10 transition-all cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value={angle.title} id={`angle-${index}`} className="border-slate-500 text-primary focus:ring-primary" />
                              <span className="font-semibold text-slate-100 text-lg">{angle.title}</span>
                            </div>
                            <p className="ml-8 mt-1 text-sm text-slate-400">{angle.explanation}</p>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </motion.div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center p-6 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <Icons.lightbulb className="w-12 h-12 text-slate-500 mb-4" />
                  <p className="text-slate-300 text-lg font-medium">No Content Angles Suggested</p>
                  <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                    The AI couldn't find specific angles for "{campaignTopic}". Try rephrasing your topic or researching again.
                  </p>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSuggestAngles(campaignTopic, currentResearchedContent)} 
                      className="mt-6 border-primary text-primary hover:bg-primary/10"
                      disabled={isLoading || !campaignTopic || !currentResearchedContent || !userIdToPass}
                    >
                      <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Generating Angles Again
                    </Button>
                </div>
              )}
              <Button 
                onClick={handleGenerateSeries} 
                disabled={!selectedAngle || isLoading || (angles.length === 0 && !isLoading) || !userIdToPass}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 disabled:opacity-60"
              >
                {isLoading && loadingMessage.includes("Crafting") ? <Icons.loader className="mr-2 h-5 w-5 animate-spin" /> : <Icons.listChecks className="mr-2 h-5 w-5" />}
                Generate Campaign Series
              </Button>
               <Button variant="outline" onClick={() => setCurrentStep('topic_research')} className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                <Icons.arrowLeft className="mr-2 h-5 w-5" /> Back to Topic Research
              </Button>
            </motion.div>
          );
      
      case 'series':
          return (
            <motion.div key="series" {...cardMotionProps} className="space-y-6">
              <h3 className="text-xl font-medium text-slate-200">Your Campaign Series for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
              {isLoading && loadingMessage.includes("Crafting") ? (
                 renderLoadingState(loadingMessage)
              ) : (
                <>
                {(twitterSeries.length === 0 && linkedinSeries.length === 0 && !isLoading) && (
                   <div className="flex flex-col items-center justify-center h-[250px] text-center p-6 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <Icons.file className="w-12 h-12 text-slate-500 mb-4" />
                      <p className="text-slate-300 text-lg font-medium">No Campaign Series Generated</p>
                      <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">
                        The AI couldn't generate posts for this angle. You might want to try a different angle or topic.
                      </p>
                       <Button 
                          variant="outline" 
                          onClick={handleGenerateSeries} 
                          className="mt-6 border-primary text-primary hover:bg-primary/10"
                          disabled={isLoading || !selectedAngle}
                        >
                          <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Generating Series Again
                        </Button>
                    </div>
                )}
                <motion.div 
                  className="grid md:grid-cols-2 gap-6"
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  { (twitterSeries.length > 0 || linkedinSeries.length > 0) && (
                    <>
                    <motion.div variants={listItemVariants}>
                        <Card className="bg-slate-700/50 border-slate-600 h-full hover:shadow-primary/10 transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> Twitter Thread</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ScrollArea className="h-[300px] pr-2">
                            {twitterSeries.length > 0 ? twitterSeries.map((post, index) => (
                                <motion.div 
                                key={`twitter-${index}`} 
                                custom={index}
                                variants={listItemVariants}
                                className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2 group"
                                >
                                <p className="whitespace-pre-wrap">{post}</p>
                                <div className="mt-2 flex space-x-2">
                                    <Button variant="link" size="sm" onClick={() => handleOpenEditModal('twitter', index, post)} className="text-sky-400/80 hover:text-sky-400 p-0 h-auto text-xs disabled:opacity-50" disabled={!userIdToPass || (isSavingDraft?.platform === 'twitter' && isSavingDraft?.index === index)}>
                                    <Icons.edit className="mr-1 h-3 w-3"/>Edit
                                    </Button>
                                    <Button variant="link" size="sm" onClick={() => handleSaveCampaignPostAsDraft('twitter', index, post)} className="text-green-400/80 hover:text-green-400 p-0 h-auto text-xs disabled:opacity-50" disabled={!userIdToPass || (isSavingDraft?.platform === 'twitter' && isSavingDraft?.index === index)}>
                                    {isSavingDraft?.platform === 'twitter' && isSavingDraft?.index === index ? <Icons.loader className="h-3 w-3 animate-spin"/> : <Icons.save className="mr-1 h-3 w-3"/>}Save Draft
                                    </Button>
                                </div>
                                </motion.div>
                            )) : <p className="text-slate-400 text-center py-4">No Twitter posts generated for this angle.</p>}
                            </ScrollArea>
                        </CardContent>
                        </Card>
                    </motion.div>
                    <motion.div variants={listItemVariants}>
                        <Card className="bg-slate-700/50 border-slate-600 h-full hover:shadow-primary/10 transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> LinkedIn Series</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ScrollArea className="h-[300px] pr-2">
                                {linkedinSeries.length > 0 ? linkedinSeries.map((post, index) => (
                                <motion.div 
                                    key={`linkedin-${index}`} 
                                    custom={index}
                                    variants={listItemVariants}
                                    className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm mb-2 group"
                                >
                                    <p className="whitespace-pre-wrap">{post}</p>
                                    <div className="mt-2 flex space-x-2">
                                    <Button variant="link" size="sm" onClick={() => handleOpenEditModal('linkedin', index, post)} className="text-blue-400/80 hover:text-blue-400 p-0 h-auto text-xs disabled:opacity-50" disabled={!userIdToPass || (isSavingDraft?.platform === 'linkedin' && isSavingDraft?.index === index)}>
                                        <Icons.edit className="mr-1 h-3 w-3"/>Edit
                                    </Button>
                                    <Button variant="link" size="sm" onClick={() => handleSaveCampaignPostAsDraft('linkedin', index, post)} className="text-green-400/80 hover:text-green-400 p-0 h-auto text-xs disabled:opacity-50" disabled={!userIdToPass || (isSavingDraft?.platform === 'linkedin' && isSavingDraft?.index === index)}>
                                        {isSavingDraft?.platform === 'linkedin' && isSavingDraft?.index === index ? <Icons.loader className="h-3 w-3 animate-spin"/> : <Icons.save className="mr-1 h-3 w-3"/>}Save Draft
                                    </Button>
                                    </div>
                                </motion.div>
                                )) : <p className="text-slate-400 text-center py-4">No LinkedIn posts generated for this angle.</p>}
                            </ScrollArea>
                        </CardContent>
                        </Card>
                    </motion.div>
                    </>
                  )}
                </motion.div>
                </>
              )}
               {!userIdToPass && (twitterSeries.length > 0 || linkedinSeries.length > 0) &&
                <p className="text-xs text-slate-400 text-center mt-2">Log in to edit or save drafts.</p>
              }
              <Button 
                onClick={handleSuggestRepurposing} 
                disabled={isLoading || (twitterSeries.length === 0 && linkedinSeries.length === 0 && !isLoading) || !userIdToPass}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4 disabled:opacity-60"
                 title={!userIdToPass ? "Log in to suggest repurposing ideas" : ""}
              >
                  {isLoading && loadingMessage.includes("Finding repurposing") ? <Icons.loader className="mr-2 h-5 w-5 animate-spin" /> : <Icons.repeat className="mr-2 h-5 w-5" />}
                Suggest Repurposing Ideas
              </Button>
                <Button variant="outline" onClick={() => setCurrentStep('angles')} className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                <Icons.arrowLeft className="mr-2 h-5 w-5" /> Back to Angles
              </Button>
            </motion.div>
          );

      case 'repurpose':
          return (
            <motion.div key="repurpose" {...cardMotionProps} className="space-y-6">
              <h3 className="text-xl font-medium text-slate-200 mb-1">Repurposing Ideas for: <span className="text-purple-400">{selectedAngle?.title || 'Selected Angle'}</span></h3>
               {isLoading && loadingMessage.includes("Finding repurposing") ? (
                 renderLoadingState(loadingMessage)
              ) : (
              <>
              {(twitterRepurposingIdeas.length === 0 && linkedinRepurposingIdeas.length === 0 && (twitterSeries.length > 0 || linkedinSeries.length > 0) && !isLoading) && (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-700/30 rounded-lg border border-slate-600/50 min-h-[200px]">
                      <Icons.info className="w-10 h-10 text-slate-500 mb-3" />
                      <p className="text-slate-300 text-md font-medium">No Repurposing Ideas Found</p>
                      <p className="text-slate-400 text-sm mt-1">The AI couldn't find specific repurposing ideas for the generated content.</p>
                      <Button 
                          variant="outline" 
                          onClick={handleSuggestRepurposing} 
                          className="mt-4 border-primary text-primary hover:bg-primary/10"
                          disabled={isLoading || !userIdToPass}
                      >
                          <Icons.refreshCw className="mr-2 h-4 w-4" /> Try Generating Ideas Again
                      </Button>
                  </div>
              )}
              <motion.div 
                className="grid md:grid-cols-2 gap-6"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {(twitterRepurposingIdeas.length > 0 || linkedinRepurposingIdeas.length > 0) && (
                  <>
                  <motion.div variants={listItemVariants}>
                    <Card className="bg-slate-700/50 border-slate-600 h-full hover:shadow-primary/10 transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> For Your Twitter Series</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[250px] pr-2">
                                {twitterRepurposingIdeas.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                                        {twitterRepurposingIdeas.map((idea, index) => (
                                            <motion.li 
                                              key={`twitter-repurpose-${index}`} 
                                              custom={index}
                                              variants={listItemVariants}
                                              className="p-2 bg-slate-600/50 rounded-md"
                                            >{idea}</motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-400 text-center py-4">
                                      {twitterSeries.length > 0 ? "No repurposing ideas generated for Twitter this time." : "No Twitter series was generated to create ideas from."}
                                    </p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div variants={listItemVariants}>
                    <Card className="bg-slate-700/50 border-slate-600 h-full hover:shadow-primary/10 transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> For Your LinkedIn Series</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[250px] pr-2">
                                {linkedinRepurposingIdeas.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                                        {linkedinRepurposingIdeas.map((idea, index) => (
                                            <motion.li 
                                              key={`linkedin-repurpose-${index}`} 
                                              custom={index}
                                              variants={listItemVariants}
                                              className="p-2 bg-slate-600/50 rounded-md"
                                            >{idea}</motion.li>
                                        ))}
                                    </ul>
                                ) : (
                                      <p className="text-slate-400 text-center py-4">
                                      {linkedinSeries.length > 0 ? "No repurposing ideas generated for LinkedIn this time." : "No LinkedIn series was generated to create ideas from."}
                                    </p>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                  </motion.div>
                  </>
                )}
              </motion.div>
              </>
              )}
              
              <Separator className="my-6 bg-slate-700" />
                <Button 
                onClick={() => setCurrentStep('complete')}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-4 disabled:opacity-60"
                disabled={!userIdToPass}
                title={!userIdToPass ? "Log in to finalize campaign" : ""}
              >
                <Icons.checkCircle className="mr-2 h-5 w-5" />
                Finalize Campaign
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep('series')} className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700">
                <Icons.arrowLeft className="mr-2 h-5 w-5" /> Back to Series
              </Button>
            </motion.div>
          );
      
      case 'complete':
          return (
            <motion.div key="complete" {...cardMotionProps} className="text-center space-y-6 py-8 min-h-[300px] flex flex-col justify-center items-center">
              <motion.div initial={{scale:0, rotate: -180}} animate={{scale:1, rotate:0}} transition={{type: "spring", stiffness: 150, damping:15, delay:0.2}}>
                <Icons.checkCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-100">Your Smart Campaign is Ready!</h2>
              <p className="text-slate-300 max-w-md mx-auto">
                You've successfully generated content angles, a campaign series, and repurposing ideas for your topic: <span className="font-semibold text-purple-400">{campaignTopic}</span>.
              </p>
              <p className="text-slate-400">What would you like to do next?</p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={listItemVariants}>
                  <Button 
                    onClick={handleCopyCampaign}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Icons.copy className="mr-2 h-5 w-5" /> Copy Full Campaign
                  </Button>
                </motion.div>
                <motion.div variants={listItemVariants}>
                  <Button 
                    onClick={resetWizard}
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icons.refreshCw className="mr-2 h-5 w-5" /> Start New Campaign
                  </Button>
                </motion.div>
              </motion.div>
                <Button 
                  variant="link"
                  onClick={() => setCurrentStep('repurpose')} 
                  className="mt-4 text-slate-400 hover:text-primary">
                    <Icons.arrowLeft className="mr-1 h-4 w-4" /> Back to Repurposing Ideas
                </Button>
            </motion.div>
          );

      default:
        return <div className="min-h-[300px]" >Unknown step: {currentStep}</div>; 
    }
  };

  return (
    <div className="w-full space-y-8">
      <motion.div {...cardMotionProps} 
        whileHover={{ scale: 1.01, boxShadow: "0px 10px 30px -5px hsl(var(--primary)/0.2)", transition: { type: "spring", stiffness: 300, damping: 10 } }}
      >
        <Card className="bg-slate-800/70 border-slate-700 shadow-2xl rounded-xl overflow-hidden transition-shadow duration-300">
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
            {campaignTopic && currentStep !== 'topic_research' && currentStep !== 'initial_error' && (
              <CardDescription className="text-slate-400 pt-2">
                Campaign Topic: <span className="font-semibold text-slate-300">{campaignTopic}</span>
              </CardDescription>
            )}
            {(currentStep === 'initial_error') && stepConfig['initial_error']?.description && (
              <CardDescription className="text-slate-400 pt-2">
                  {stepConfig['initial_error']?.description}
              </CardDescription>
            )}
            {authLoading && <p className="text-xs text-slate-500 pt-1">Checking authentication...</p>}
          </CardHeader>
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {authLoading ? renderLoadingState("Initializing...") : renderStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Edit Modal for Series Posts */}
      <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit {editingPost?.platform === 'twitter' ? 'Tweet' : 'LinkedIn Post'}</DialogTitle>
             <DialogDescription className="text-slate-400">
                  Refine your post. Use "Make AI Change" for AI assistance or edit manually.
              </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editingPost?.currentText || ''}
            onChange={(e) => setEditingPost(prev => prev ? { ...prev, currentText: e.target.value } : null)}
            rows={10}
            className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
            placeholder={`Enter your revised ${editingPost?.platform === 'twitter' ? 'tweet' : 'LinkedIn post'}...`}
          />
          <DialogFooter className="mt-4 sm:justify-between">
            <Button variant="outline" onClick={() => setEditingPost(null)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button onClick={() => setIsAiEditModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Icons.sparkles className="mr-2 h-4 w-4" /> Make AI Change
              </Button>
              <Button onClick={handleSaveEditedPost} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Icons.save className="mr-2 h-4 w-4"/>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Nested AI Edit Instruction Modal for Series Posts */}
      <Dialog open={isAiEditModalOpen} onOpenChange={setIsAiEditModalOpen}>
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
            value={aiEditInstruction}
            onChange={(e) => setAiEditInstruction(e.target.value)}
            rows={3}
            className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAiEditModalOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
            <Button onClick={handleAiEditForSeriesPost} disabled={isAiSubmitting || !aiEditInstruction.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isAiSubmitting ? <Icons.loader className="animate-spin mr-2 h-4 w-4" /> : <Icons.wand className="mr-2 h-4 w-4" />}
              Apply AI Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export const SmartCampaignWizard: React.FC = () => {
  const searchParamsString = typeof window !== 'undefined' ? window.location.search : 'initialKey';
  
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
