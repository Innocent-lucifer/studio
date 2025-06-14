
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

import type { SuggestContentAnglesInput, SuggestContentAnglesOutput, ContentAngle } from '@/ai/flows/suggest-content-angles';
import { suggestContentAngles } from '@/ai/flows/suggest-content-angles';
import type { GenerateCampaignSeriesInput, GenerateCampaignSeriesOutput } from '@/ai/flows/generate-campaign-series';
import { generateCampaignSeries } from '@/ai/flows/generate-campaign-series';
import type { SuggestRepurposingIdeasInput, SuggestRepurposingIdeasOutput } from '@/ai/flows/suggest-repurposing-ideas';
import { suggestRepurposingIdeas } from '@/ai/flows/suggest-repurposing-ideas';

const MOCK_USER_ID = "sagepostai-guest-user"; // For stubbed auth

type WizardStep = 'angles' | 'series' | 'repurpose' | 'complete';

const stepConfig: Record<WizardStep, { title: string; icon: keyof typeof Icons; progress: number }> = {
  angles: { title: "Select Content Angle", icon: "lightbulb", progress: 25 },
  series: { title: "Generate Campaign Series", icon: "listChecks", progress: 50 },
  repurpose: { title: "Get Repurposing Ideas", icon: "repeat", progress: 75 },
  complete: { title: "Campaign Ready!", icon: "checkCircle", progress: 100 },
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
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('angles');
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
    if (topicParam) setTopic(topicParam);
    if (researchedContentParam) setResearchedContent(researchedContentParam);

    if (topicParam && researchedContentParam && currentStep === 'angles' && angles.length === 0) {
      handleSuggestAngles(topicParam, researchedContentParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSuggestAngles = async (currentTopic: string, currentResearchedContent: string) => {
    if (!currentTopic || !currentResearchedContent) {
      toast({ variant: "destructive", title: "Missing Topic", description: "Topic and research content are required." });
      router.push('/'); // Redirect if essential data is missing
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Brainstorming content angles...');
    try {
      const input: SuggestContentAnglesInput = { topic: currentTopic, researchedContext: currentResearchedContent, userId: MOCK_USER_ID };
      const result = await suggestContentAngles(input);
      if (result.error) {
        toast({ variant: "destructive", title: "Angle Suggestion Failed", description: result.error });
        setAngles([]);
      } else {
        setAngles(result.angles || []);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to suggest angles." });
      setAngles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSeries = async () => {
    if (!selectedAngle || !topic) return;
    setIsLoading(true);
    setLoadingMessage('Crafting your campaign series...');
    setCurrentStep('series');
    try {
      const twitterInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'twitter', researchedContext: researchedContent, userId: MOCK_USER_ID };
      const linkedinInput: GenerateCampaignSeriesInput = { topic, selectedAngle: selectedAngle.title, platform: 'linkedin', researchedContext: researchedContent, userId: MOCK_USER_ID };
      
      const [twitterResult, linkedinResult] = await Promise.all([
        generateCampaignSeries(twitterInput),
        generateCampaignSeries(linkedinInput)
      ]);

      if (twitterResult.error) toast({ variant: "destructive", title: "Twitter Series Failed", description: twitterResult.error });
      setTwitterSeries(twitterResult.series || []);
      
      if (linkedinResult.error) toast({ variant: "destructive", title: "LinkedIn Series Failed", description: linkedinResult.error });
      setLinkedinSeries(linkedinResult.series || []);

    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate series." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestRepurposing = async () => {
    if (!topic || !selectedAngle || (twitterSeries.length === 0 && linkedinSeries.length === 0)) return;
    setIsLoading(true);
    setLoadingMessage('Finding repurposing opportunities...');
    setCurrentStep('repurpose');
    try {
      const campaignSummary = `Twitter Series: ${twitterSeries.join(' ')}\nLinkedIn Series: ${linkedinSeries.join(' ')}`;
      const input: SuggestRepurposingIdeasInput = { topic, selectedAngle: selectedAngle.title, campaignSummary, userId: MOCK_USER_ID };
      const result = await suggestRepurposingIdeas(input);

      if (result.error) {
        toast({ variant: "destructive", title: "Repurposing Failed", description: result.error });
      } else {
        setRepurposingIdeas(result.ideas || []);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to suggest repurposing ideas." });
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
    router.push('/');
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800/50 rounded-xl shadow-xl">
      <Icons.loader className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-slate-300">{loadingMessage || "Loading..."}</p>
    </div>
  );

  const CurrentIcon = Icons[stepConfig[currentStep]?.icon || 'help'] || Icons.help;

  return (
    <div className="w-full space-y-8">
      <Card className="bg-slate-800/70 border-slate-700 shadow-2xl rounded-xl">
        <CardHeader className="border-b border-slate-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <CurrentIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl font-semibold text-primary">
                {stepConfig[currentStep]?.title || "Smart Campaign"}
              </CardTitle>
            </div>
            <Progress value={stepConfig[currentStep]?.progress || 0} className="w-1/3 h-2 bg-slate-700 [&>div]:bg-primary" />
          </div>
          {topic && (
            <CardDescription className="text-slate-400 pt-2">
              Campaign Topic: <span className="font-semibold text-slate-300">{topic}</span>
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

            {!isLoading && currentStep === 'angles' && (
              <motion.div key="angles" {...cardVariants} className="space-y-6">
                <h3 className="text-xl font-medium text-slate-200">Select a Content Angle</h3>
                <p className="text-slate-400">Choose the strategic angle you'd like to focus on for this campaign. The AI will generate interconnected content based on your selection.</p>
                {angles.length > 0 ? (
                  <RadioGroup 
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
                ) : (
                  <p className="text-slate-500">No angles suggested yet, or an error occurred.</p>
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

            {!isLoading && currentStep === 'series' && (
              <motion.div key="series" {...cardVariants} className="space-y-6">
                 <h3 className="text-xl font-medium text-slate-200">Your Campaign Series for: <span className="text-purple-400">{selectedAngle?.title}</span></h3>
                
                {/* Twitter Series */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-sky-400"><Icons.twitter className="mr-2 h-5 w-5" /> Twitter Thread</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {twitterSeries.map((post, index) => (
                      <div key={`twitter-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm">
                        <p className="whitespace-pre-wrap">{post}</p>
                        <Button variant="link" size="sm" onClick={() => startEdit('twitter', index, post)} className="text-sky-400/80 hover:text-sky-400 p-0 h-auto mt-1">Edit</Button>
                      </div>
                    ))}
                    {twitterSeries.length === 0 && <p className="text-slate-400">No Twitter posts generated for this angle.</p>}
                  </CardContent>
                </Card>

                {/* LinkedIn Series */}
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-blue-400"><Icons.linkedin className="mr-2 h-5 w-5" /> LinkedIn Series</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {linkedinSeries.map((post, index) => (
                      <div key={`linkedin-${index}`} className="p-3 bg-slate-600/70 rounded-md text-slate-200 text-sm">
                        <p className="whitespace-pre-wrap">{post}</p>
                        <Button variant="link" size="sm" onClick={() => startEdit('linkedin', index, post)} className="text-blue-400/80 hover:text-blue-400 p-0 h-auto mt-1">Edit</Button>
                      </div>
                    ))}
                    {linkedinSeries.length === 0 && <p className="text-slate-400">No LinkedIn posts generated for this angle.</p>}
                  </CardContent>
                </Card>

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

            {!isLoading && currentStep === 'repurpose' && (
              <motion.div key="repurpose" {...cardVariants} className="space-y-6">
                <h3 className="text-xl font-medium text-slate-200">Repurposing Ideas for: <span className="text-purple-400">{selectedAngle?.title}</span></h3>
                {repurposingIdeas.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 pl-4 text-slate-300">
                    {repurposingIdeas.map((idea, index) => (
                      <li key={index} className="p-2 bg-slate-700/50 rounded-md">{idea}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No repurposing ideas generated yet, or an error occurred.</p>
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
             {!isLoading && currentStep === 'complete' && (
              <motion.div key="complete" {...cardVariants} className="text-center space-y-6 py-8">
                <Icons.checkCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-100">Your Smart Campaign is Ready!</h2>
                <p className="text-slate-300 max-w-md mx-auto">
                  You've successfully generated content angles, a campaign series, and repurposing ideas for your topic: <span className="font-semibold text-purple-400">{topic}</span>.
                </p>
                <p className="text-slate-400">What would you like to do next?</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    onClick={() => {
                       const contentToCopy = `Topic: ${topic}\nSelected Angle: ${selectedAngle?.title}\n\nTwitter Series:\n${twitterSeries.join('\n\n---\n\n')}\n\nLinkedIn Series:\n${linkedinSeries.join('\n\n---\n\n')}\n\nRepurposing Ideas:\n${repurposingIdeas.join('\n- ')}`;
                       navigator.clipboard.writeText(contentToCopy);
                       toast({ title: "Campaign Copied!", description: "Full campaign content copied to clipboard." });
                    }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Editing Modal */}
      {editingSeries && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700"
          >
            <h3 className="text-xl font-semibold text-primary mb-4">Edit {editingSeries.platform} Post</h3>
            <Textarea
              value={editingSeries.text}
              onChange={(e) => setEditingSeries({ ...editingSeries, text: e.target.value })}
              rows={10}
              className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm"
            />
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={() => setEditingSeries(null)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
              <Button onClick={saveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// This wrapper component is necessary because useSearchParams can only be used in Client Components
// that are descendants of a <Suspense> boundary.
export const SmartCampaignWizard: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Icons.loader className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SmartCampaignWizardInternal />
    </Suspense>
  );
};

