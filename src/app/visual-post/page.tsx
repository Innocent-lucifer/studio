
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import Link from 'next/link';
import { generatePostFromImage, GeneratePostFromImageInput } from '@/ai/flows/generate-post-from-image';
import { generateEditedPost, GenerateEditedPostInput } from '@/ai/flows/generateEditedPost';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useAuth } from "@/context/AuthContext";
import { saveDraft, deductCredits, CREDIT_COSTS, FEATURE_DESCRIPTIONS } from '@/lib/firebaseUserActions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type Tone = 'default' | 'romantic' | 'funny' | 'professional' | 'mysterious';

export default function VisualPostPage() {
  const { user } = useAuth();
  const userIdToPass = user?.uid; 

  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [userText, setUserText] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<Tone>('default');
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRefVisual = useRef<HTMLInputElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [initialStorageCheckDone, setInitialStorageCheckDone] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(''); 
  const [originalContentBeforeEdit, setOriginalContentBeforeEdit] = useState('');
  const [isAiEditModalOpen, setIsAiEditModalOpen] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState('');
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);

  const [creditProcessedForCurrentImage, setCreditProcessedForCurrentImage] = useState<boolean>(false);
  const [isProcessingCredits, setIsProcessingCredits] = useState<boolean>(false);

  // Debounced states for triggering generation
  const [debouncedUserText, setDebouncedUserText] = useState<string>(userText);
  const [debouncedSelectedTone, setDebouncedSelectedTone] = useState<Tone>(selectedTone);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debounce userText
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserText(userText);
    }, 1000); 

    return () => {
      clearTimeout(handler);
    };
  }, [userText]);

  // Debounce selectedTone
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSelectedTone(selectedTone);
    }, 300); 
    return () => {
      clearTimeout(handler);
    };
  }, [selectedTone]);


  useEffect(() => {
    if (isClient && !initialStorageCheckDone) {
      const storedImage = localStorage.getItem('sagepostai_visual_post_image');
      if (storedImage) {
        setImageDataUri(storedImage); 
        setCreditProcessedForCurrentImage(false); 
        localStorage.removeItem('sagepostai_visual_post_image');
      }
      setInitialStorageCheckDone(true); 
    }
  }, [isClient, initialStorageCheckDone]);

  // Effect for AI Generation & Credit Deduction
  useEffect(() => {
    const processImageAndGenerate = async () => {
      if (!imageDataUri || !isClient || !initialStorageCheckDone) {
        return;
      }
      if (isLoading || isProcessingCredits) {
        return;
      }
      setError(null);

      let shouldCallAi = false;
      let creditFeatureKey: keyof typeof CREDIT_COSTS | null = null;
      let costForThisAction = 0;
      let isRegenerationForCosting = false;

      if (!userIdToPass) { 
        if (generatedPost) setGeneratedPost(''); 
        toast({
          title: "Login Required",
          description: "Please log in to generate posts from images.",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true); 

      if (!creditProcessedForCurrentImage) { // Initial processing for this image
        creditFeatureKey = 'IMAGE_TO_POST';
        costForThisAction = CREDIT_COSTS.IMAGE_TO_POST;
      } else { // Image already processed, check for regeneration
         // Only charge for regeneration if the TONE changed. Text changes are free for the same image.
        if (debouncedSelectedTone !== selectedToneRef.current) { // Tone changed
            creditFeatureKey = 'IMAGE_TO_POST_REGENERATE';
            costForThisAction = CREDIT_COSTS.IMAGE_TO_POST_REGENERATE;
            isRegenerationForCosting = true;
        } else { // Only text changed (free regen) or no relevant change for costing
             shouldCallAi = true; // No credit key, no cost for this specific path
        }
      }
      
      if (userIdToPass && creditFeatureKey) {
        setIsProcessingCredits(true);
        const creditCheckResult = await deductCredits(userIdToPass, creditFeatureKey, isRegenerationForCosting); // Pass isRegeneration context
        setIsProcessingCredits(false);

        if (!creditCheckResult.success) {
          toast({ variant: "destructive", title: "Credit Error", description: creditCheckResult.error || `Could not process credits.` });
          setIsLoading(false);
          return; 
        }

        if (creditCheckResult.freePostUsedThisTime) {
          toast({ title: "Free Action Used", description: `Your free ${FEATURE_DESCRIPTIONS[creditFeatureKey].toLowerCase()} was successful!`});
        } else if (costForThisAction > 0) {
          toast({ title: "Credits Used", description: `${costForThisAction} credits used for ${FEATURE_DESCRIPTIONS[creditFeatureKey]}.` });
        }
        
        if (creditFeatureKey === 'IMAGE_TO_POST') {
          setCreditProcessedForCurrentImage(true);
        }
        shouldCallAi = true; 
      }


      if (shouldCallAi) {
        const generationInput: GeneratePostFromImageInput = {
          imageDataUri,
          userContext: debouncedUserText || undefined,
          tone: debouncedSelectedTone,
          userId: userIdToPass,
        };
        try {
          const result = await generatePostFromImage(generationInput);
          if (result.error) {
            setError(result.error);
            toast({ variant: "destructive", title: "Post Generation Failed", description: result.error });
          } else {
            setGeneratedPost(result.generatedPost || '');
          }
        } catch (e: any) {
          setError(e.message || "An unexpected error occurred during post generation.");
          toast({ variant: "destructive", title: "Error", description: e.message || "Failed to generate post." });
        }
      }
      
      selectedToneRef.current = debouncedSelectedTone; // Update ref after processing
      setIsLoading(false);
    };

    processImageAndGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDataUri, debouncedUserText, debouncedSelectedTone, isClient, userIdToPass, initialStorageCheckDone]);

  const selectedToneRef = useRef(debouncedSelectedTone);

  useEffect(() => {
    selectedToneRef.current = debouncedSelectedTone;
  }, [debouncedSelectedTone]);


  const handleDirectImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRefVisual.current) {
      fileInputRefVisual.current.value = ''; 
    }

    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, GIF).",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) { 
         toast({
          variant: "destructive",
          title: "File Too Large",
          description: "Please upload an image smaller than 10MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          setGeneratedPost(''); 
          setError(null);
          setImageDataUri(result); 
          setCreditProcessedForCurrentImage(false); 
          setUserText(''); 
          setDebouncedUserText('');
          setSelectedTone('default');
          setDebouncedSelectedTone('default');
          selectedToneRef.current = 'default';
        } else {
          toast({
            variant: "destructive",
            title: "Image Read Error",
            description: "Could not read image data as a string.",
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Image Read Error",
          description: "Could not read the selected image file.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditModal = () => {
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to edit posts." });
      return;
    }
    if (!generatedPost) {
      toast({ variant: "destructive", title: "No Post", description: "No post content to edit." });
      return;
    }
    setOriginalContentBeforeEdit(generatedPost);
    setEditingContent(generatedPost);
    setIsEditModalOpen(true);
  };

  const handleSaveManualEdit = () => {
    setGeneratedPost(editingContent);
    setIsEditModalOpen(false);
    toast({ title: "Post Updated", description: "Your changes have been applied." });
  };

  const handleOpenAiEditInstructionModal = () => {
    setIsAiEditModalOpen(true);
  };

  const handleAiEditSubmit = async () => {
    if (!aiEditInstruction.trim() || !userIdToPass) {
      toast({ title: "Missing Information", description: "Please provide instructions for the AI and ensure you are logged in.", variant: "destructive" });
      return;
    }
    
    setIsAiSubmitting(true);
    const creditFeatureKey: keyof typeof CREDIT_COSTS = 'AI_EDIT';
    const creditCheckResult = await deductCredits(userIdToPass, creditFeatureKey); 
    if (!creditCheckResult.success) {
        toast({ variant: "destructive", title: "Credit Error", description: creditCheckResult.error || `Could not process credits for ${FEATURE_DESCRIPTIONS[creditFeatureKey]}.` });
        setIsAiSubmitting(false);
        return;
    }
     if (CREDIT_COSTS.AI_EDIT > 0 && !creditCheckResult.freePostUsedThisTime) { 
       toast({ title: "Credits Used", description: `${CREDIT_COSTS.AI_EDIT} credits used for ${FEATURE_DESCRIPTIONS[creditFeatureKey]}.` });
    } else if (creditCheckResult.freePostUsedThisTime) {
        toast({ title: "Free Action Used", description: `Your free ${FEATURE_DESCRIPTIONS[creditFeatureKey].toLowerCase()} was successful!`});
    }


    try {
      const result = await generateEditedPost({
        originalPost: editingContent, 
        editInstruction: aiEditInstruction,
        topic: userText || "Post from image",
        platform: 'twitter', 
        userId: userIdToPass,
      });

      if (result.error) {
        toast({ variant: "destructive", title: "AI Edit Error", description: result.error });
      } else if (result.editedPost) {
        setEditingContent(result.editedPost); 
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


  const handleCopyPost = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost);
      toast({ title: "Post Copied!", description: "The generated post has been copied to your clipboard." });
    }
  };

  const handleSharePost = () => {
     toast({ title: "Feature Coming Soon", description: "Direct sharing will be available in a future update." });
  };
  
  const handleSaveDraft = async () => {
    if (!userIdToPass) {
      toast({ variant: "destructive", title: "Login Required", description: "Please log in to save drafts." });
      return;
    }
    if (!generatedPost.trim()) {
      toast({ variant: "destructive", title: "No Content", description: "Cannot save an empty post as a draft." });
      return;
    }
    setIsSavingDraft(true);
    try {
      const draftData = {
        content: generatedPost,
        platform: 'visual' as 'twitter' | 'linkedin' | 'visual', 
        topic: userText.trim() || "Image Post", 
      };
      const savedDraft = await saveDraft(userIdToPass, draftData);
      if (savedDraft) {
        toast({ title: "Draft Saved!", description: "Your image-inspired post has been saved." });
      } else {
        toast({ variant: "destructive", title: "Save Failed", description: "Could not save the draft. Please try again." });
      }
    } catch (error) {
       toast({ variant: "destructive", title: "Save Error", description: "An unexpected error occurred while saving." });
    } finally {
      setIsSavingDraft(false);
    }
  };


  const toneOptions: { label: string; value: Tone, icon?: keyof typeof Icons }[] = [
    { label: 'Default', value: 'default', icon: 'sparkles' },
    { label: 'Romantic', value: 'romantic', icon: 'heart' },
    { label: 'Funny', value: 'funny', icon: 'smile' },
    { label: 'Professional', value: 'professional', icon: 'briefcase' },
    { label: 'Mysterious', value: 'mysterious', icon: 'help' },
  ];

  const commonHeader = (
     <header className="flex justify-between items-center w-full mb-6 sm:mb-8 py-3 sm:py-4 px-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div> 
            <HamburgerMenu />
          </div>
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
              <AppLogo className="h-12 w-12 sm:h-14 sm:w-14 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">SagePostAI</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Visual Post Generator</p>
              </div>
            </div>
          </Link>
        </div>
      </header>
  );

  const commonFooter = (
      <footer className="text-center p-4 mt-12 text-slate-500 text-sm">
         <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
            Built By EZ Teenagers.
            <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
          </span>
      </footer>
  );
  
  const HiddenFileInput = () => (
    <input
      type="file"
      ref={fileInputRefVisual}
      onChange={handleDirectImageUpload}
      accept="image/*"
      className="hidden"
    />
  );


  if (!isClient || (isClient && !initialStorageCheckDone && !imageDataUri)) {
     return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4"
      >
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading Visual Post Tool...</p>
        <HiddenFileInput />
      </motion.div>
    );
  }

  if (isClient && initialStorageCheckDone && !imageDataUri) {
    return (
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8"
      >
        <main className="container mx-auto w-full max-w-xl">
          {commonHeader}
          <Card 
            className="bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-8 sm:p-12 text-center hover:shadow-primary/20 transition-shadow duration-300"
          >
            <CardHeader className="p-0 mb-8">
              <Icons.image className="h-20 w-20 sm:h-24 sm:w-24 text-primary mx-auto mb-6" />
              <CardTitle className="text-3xl sm:text-4xl font-semibold text-primary">Create Post from Image</CardTitle>
              <CardDescription className="text-slate-300 mt-3 text-lg sm:text-xl">
                Upload an image to get started. SagePostAI will craft a unique post for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Button
                onClick={() => fileInputRefVisual.current?.click()}
                size="lg"
                className="w-full max-w-xs mx-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Icons.upload className="mr-2.5 h-6 w-6" /> Upload Image
              </Button>
              <HiddenFileInput />
            </CardContent>
          </Card>
        </main>
        {commonFooter}
      </motion.div>
    );
  }

  if (isClient && imageDataUri) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-8"
      >
        <main className="container mx-auto w-full max-w-3xl">
          {commonHeader}
          <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-2xl hover:shadow-primary/20 transition-shadow duration-300 rounded-2xl p-6 sm:p-8">
            <motion.div 
              className="mb-6 flex flex-col sm:flex-row sm:justify-between gap-3 [&>button]:w-full sm:[&>button]:w-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button
                variant="outline"
                onClick={() => fileInputRefVisual.current?.click()}
                className="border-primary text-primary hover:bg-primary/10 hover:border-purple-400 hover:text-purple-300 rounded-lg px-5 py-2.5 text-sm"
                title="Upload a different image"
              >
                <Icons.refreshCw className="mr-2 h-4 w-4" /> Change Image
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImageDataUri(null); 
                }}
                className="border-primary text-primary hover:bg-primary/10 hover:border-purple-400 hover:text-purple-300 rounded-lg px-5 py-2.5 text-sm"
                title="Clear current image and start over"
              >
                <Icons.trash className="mr-2 h-4 w-4" /> Start Over & Upload New
              </Button>
            </motion.div>
            <HiddenFileInput />

            <CardContent className="space-y-8 p-0">
              {imageDataUri && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 relative w-full aspect-[16/10] overflow-hidden rounded-xl shadow-lg border border-slate-600"
                >
                  <Image
                    src={imageDataUri}
                    alt="Uploaded preview"
                    fill
                    style={{objectFit:"contain"}}
                    className="rounded-xl"
                    priority
                  />
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Label htmlFor="userContext" className="text-lg font-medium text-purple-300 mb-2 block">
                  Add a few words for deeper personalization? (Free for this image)
                </Label>
                <Textarea
                  id="userContext"
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="e.g., 'Celebrating a special milestone!' or 'My new furry friend'"
                  rows={3}
                  className="bg-slate-700/80 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                  disabled={isLoading || isProcessingCredits}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Label className="text-lg font-medium text-purple-300 mb-3 block">
                  Generate in a different tone: 
                  <span className="text-xs text-slate-400">
                    {creditProcessedForCurrentImage ? ` (Regenerating with tone change costs ${CREDIT_COSTS.IMAGE_TO_POST_REGENERATE} credits for this image)` : ` (Initial image processing)`}
                  </span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {toneOptions.map(({ label, value, icon }) => {
                    const Icon = icon ? Icons[icon] || Icons.help : Icons.help;
                    return(
                    <Button
                      key={value}
                      onClick={() => setSelectedTone(value)}
                      variant={selectedTone === value ? "default" : "outline"}
                      disabled={(!userIdToPass && value !== 'default') || isLoading || isProcessingCredits} 
                      className={`
                        ${selectedTone === value
                          ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                          : 'bg-slate-700/70 border-slate-600 text-slate-300 hover:bg-slate-600/90 hover:border-purple-500/50 hover:text-purple-300'}
                        transition-all duration-200 ease-in-out shadow-md hover:shadow-lg rounded-lg px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <Icon className="mr-2 h-4 w-4"/>
                      {label}
                    </Button>
                  )})}
                </div>
                 {!userIdToPass && <p className="text-xs text-slate-400 mt-2">Log in to unlock all tone options and generate posts.</p>}
              </motion.div>

              <Separator className="my-8 bg-slate-700" />

              <motion.div initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <CardTitle className="text-2xl font-semibold text-primary mb-4 flex items-center">
                  <Icons.wand className="mr-3 h-7 w-7" />
                  Your AI-Generated Post
                </CardTitle>
                {(isLoading || isProcessingCredits) && (
                  <div className="flex items-center justify-center p-6 rounded-lg bg-slate-700/50 min-h-[150px]">
                    <Icons.loader className="h-8 w-8 animate-spin text-primary mr-3" />
                    <span className="text-slate-300 text-lg">{isProcessingCredits ? "Processing credits..." : "Generating your post..."}</span>
                  </div>
                )}
                {!isLoading && !isProcessingCredits && error && (
                  <div className="p-4 rounded-lg bg-red-800/30 border border-red-700 text-red-300 min-h-[100px]">
                    <p className="font-semibold">Error:</p>
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                {!isLoading && !isProcessingCredits && !error && generatedPost && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="p-6 bg-slate-700/80 rounded-xl shadow-inner min-h-[150px]"
                  >
                    <p className="text-slate-100 whitespace-pre-wrap text-base leading-relaxed">{generatedPost}</p>
                  </motion.div>
                )}
                {!isLoading && !isProcessingCredits && !error && !generatedPost && !userIdToPass && imageDataUri && (
                   <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-slate-700/50 min-h-[150px] text-slate-400 text-center">
                    <Icons.lock className="h-8 w-8 mb-3 text-primary"/>
                    <span className="text-lg">Please log in to generate and view your post.</span>
                     <Link href="/login?redirect=/visual-post" className="mt-3"> 
                        <Button variant="link" className="text-primary hover:text-purple-400">Go to Login</Button>
                    </Link>
                  </div>
                )}
                 {!isLoading && !isProcessingCredits && !error && !generatedPost && userIdToPass && imageDataUri && (
                   <div className="flex items-center justify-center p-6 rounded-lg bg-slate-700/50 min-h-[150px] text-slate-400">
                    <Icons.info className="h-8 w-8 mr-3"/>
                    <span className="text-lg">Your generated post will appear here once processing is complete.</span>
                  </div>
                )}
              </motion.div>

              {!isLoading && !isProcessingCredits && generatedPost && (
                <motion.div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-3 mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{delay: 0.4}}>
                  <Button 
                    onClick={handleOpenEditModal}
                    disabled={!userIdToPass || isLoading || isProcessingCredits}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                     <Icons.edit className="mr-2 h-5 w-5" /> Refine Post
                  </Button>
                  <Button 
                    onClick={handleSaveDraft} 
                    disabled={isSavingDraft || !userIdToPass || isLoading || isProcessingCredits}
                    className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingDraft ? <Icons.loader className="animate-pulse mr-2 h-5 w-5" /> : <Icons.save className="mr-2 h-5 w-5" />}
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handleCopyPost} 
                    variant="outline"
                    disabled={isLoading || isProcessingCredits}
                    className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 hover:text-purple-300 py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Icons.copy className="mr-2 h-5 w-5" /> Copy Post
                  </Button>
                  <Button
                    onClick={handleSharePost}
                    variant="outline"
                    disabled={isLoading || isProcessingCredits}
                    className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700 py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Icons.share className="mr-2 h-5 w-5" /> Share
                  </Button>
                </motion.div>
              )}
               {!userIdToPass && !isLoading && !isProcessingCredits && imageDataUri &&
                  <p className="mt-4 text-xs text-slate-400 text-center">
                    Log in to save drafts or generate posts with all tone options.
                  </p>
                }
            </CardContent>
          </Card>
        </main>

        {/* Main Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary">Refine Generated Post</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Manually refine the post or use AI to make further changes.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={10}
                    className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
                />
                <DialogFooter className="mt-4 sm:justify-between">
                     <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingContent(originalContentBeforeEdit); }} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        Cancel
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                        <Button onClick={handleOpenAiEditInstructionModal} className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Icons.sparkles className="mr-2 h-4 w-4" /> Edit with AI
                        </Button>
                        <Button onClick={handleSaveManualEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                             <Icons.save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Nested AI Edit Instruction Modal */}
        <Dialog open={isAiEditModalOpen} onOpenChange={setIsAiEditModalOpen}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-primary">AI-Powered Editing</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Tell the AI how you want to change the current post content.
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
                    <Button onClick={handleAiEditSubmit} disabled={isAiSubmitting || !aiEditInstruction.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        {isAiSubmitting ? <Icons.loader className="animate-spin mr-2 h-4 w-4" /> : <Icons.wand className="mr-2 h-4 w-4" />}
                        Apply AI Edit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {commonFooter}
      </motion.div>
    );
  }

  return null;
}
