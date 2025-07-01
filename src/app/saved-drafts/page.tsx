
"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import { getDrafts, deleteDraft, type Draft, getCampaignDrafts, deleteCampaignDraft, type CampaignDraft } from '@/lib/firebaseUserActions';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

// Reusable Draft Platform Info (can be moved to a util if used elsewhere)
const getDraftPlatformInfo = (platform: Draft['platform']) => {
  switch (platform) {
    case 'twitter':
      return { icon: <Icons.twitter className="h-5 w-5 text-sky-400" />, name: 'Twitter Post' };
    case 'linkedin':
      return { icon: <Icons.linkedin className="h-5 w-5 text-blue-400" />, name: 'LinkedIn Post' };
    case 'visual':
      return { icon: <Icons.image className="h-5 w-5 text-purple-400" />, name: 'Visual Post' };
    default:
      return { icon: <Icons.file className="h-5 w-5 text-slate-400" />, name: 'Post' };
  }
};

interface DraftListItemProps {
  draft: Draft;
  onViewDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  isDeleting: boolean;
}

const DraftListItemComponent: React.FC<DraftListItemProps> = ({ draft, onViewDraft, onDeleteDraft, isDeleting }) => {
  const platformInfo = getDraftPlatformInfo(draft.platform);
  const draftItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      layout
      variants={draftItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "p-4 bg-slate-700/70 rounded-lg border border-slate-600 shadow-md hover:border-primary/50 transition-all duration-300",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {platformInfo.icon}
            <span className="font-semibold text-slate-100">{platformInfo.name}</span>
          </div>
          {draft.topic && <p className="text-xs text-slate-400 mb-1">Topic: {draft.topic}</p>}
          <p className="text-sm text-slate-300 line-clamp-2">{draft.content}</p>
          <p className="text-xs text-slate-500 mt-2">
            Saved: {draft.updatedAt ? formatDistanceToNow(draft.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 ml-2 mt-1 sm:mt-0">
          <Button variant="ghost" size="sm" onClick={() => onViewDraft(draft)} className="text-primary hover:text-purple-400 p-1 h-auto">
            <Icons.eye className="h-4 w-4 mr-1 sm:mr-0"/> <span className="sm:hidden">View</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => draft.id && onDeleteDraft(draft.id)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-400 p-1 h-auto"
          >
            {isDeleting ? <Icons.loader className="h-4 w-4 animate-spin" /> : <Icons.trash className="h-4 w-4 mr-1 sm:mr-0" />}
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
const DraftListItem = React.memo(DraftListItemComponent);


interface CampaignDraftListItemProps {
  campaignDraft: CampaignDraft;
  onLoadCampaign: (campaignDraftId: string) => void;
  onDeleteCampaign: (campaignDraftId: string) => void;
  isDeleting: boolean;
}

const CampaignDraftListItemComponent: React.FC<CampaignDraftListItemProps> = ({ campaignDraft, onLoadCampaign, onDeleteCampaign, isDeleting }) => {
  const campaignItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      layout
      variants={campaignItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "p-4 bg-slate-700/70 rounded-lg border border-slate-600 shadow-md hover:border-primary/50 transition-all duration-300",
        isDeleting && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Icons.sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-100">Smart Campaign</span>
          </div>
          <p className="text-sm text-slate-300 line-clamp-1">Topic: {campaignDraft.campaignTopic}</p>
          <p className="text-xs text-slate-400 mt-0.5 mb-1">Angle: {campaignDraft.selectedAngle.title}</p>
          <p className="text-xs text-slate-500 mt-2">
            Saved: {campaignDraft.updatedAt ? formatDistanceToNow(campaignDraft.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 ml-2 mt-1 sm:mt-0">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => campaignDraft.id && onLoadCampaign(campaignDraft.id)} 
            className="text-primary hover:text-purple-400 p-1 h-auto"
          >
            <Icons.archiveRestore className="h-4 w-4 mr-1 sm:mr-0"/> <span className="sm:hidden">Load</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => campaignDraft.id && onDeleteCampaign(campaignDraft.id)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-400 p-1 h-auto"
          >
            {isDeleting ? <Icons.loader className="h-4 w-4 animate-spin" /> : <Icons.trash className="h-4 w-4 mr-1 sm:mr-0" />}
             <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
const CampaignDraftListItem = React.memo(CampaignDraftListItemComponent);

type MainFilter = "all" | "quick" | "visual" | "campaigns";
type QuickPostSubFilter = "all" | "twitter" | "linkedin";

const DraftSkeleton = () => (
    <div className="p-4 bg-slate-700/70 rounded-lg border border-slate-600 flex items-center space-x-4 w-full">
      <Skeleton className="h-6 w-6 rounded-full" />
      <div className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );

export default function SavedDraftsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allPostDrafts, setAllPostDrafts] = useState<Draft[]>([]);
  const [allCampaignDrafts, setAllCampaignDrafts] = useState<CampaignDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingDraft, setViewingDraft] = useState<Draft | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [deletingCampaignDraftId, setDeletingCampaignDraftId] = useState<string | null>(null);

  const [mainFilter, setMainFilter] = useState<MainFilter>("all");
  const [quickPostSubFilter, setQuickPostSubFilter] = useState<QuickPostSubFilter>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchAllDrafts = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const [postDrafts, campaignDrafts] = await Promise.all([
        getDrafts(user.uid),
        getCampaignDrafts(user.uid),
      ]);
      setAllPostDrafts(postDrafts);
      setAllCampaignDrafts(campaignDrafts);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllDrafts();
  }, [fetchAllDrafts]);

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    if (!user || !draftId) return;
    setDeletingDraftId(draftId);
    const success = await deleteDraft(user.uid, draftId);
    if (success) {
      toast({ title: "Draft Deleted!", description: "Your post draft has been removed.", iconType: "checkCircle" });
      setAllPostDrafts(prev => prev.filter(d => d.id !== draftId));
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete post draft. Please try again.", iconType: "alertTriangle" });
    }
    setDeletingDraftId(null);
  }, [user, toast]);

  const handleDeleteCampaignDraft = useCallback(async (campaignDraftId: string) => {
    if (!user || !campaignDraftId) return;
    setDeletingCampaignDraftId(campaignDraftId);
    const success = await deleteCampaignDraft(user.uid, campaignDraftId);
    if (success) {
      toast({ title: "Campaign Draft Deleted!", description: "Your campaign draft has been removed.", iconType: "checkCircle" });
      setAllCampaignDrafts(prev => prev.filter(c => c.id !== campaignDraftId));
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete campaign draft. Please try again.", iconType: "alertTriangle" });
    }
    setDeletingCampaignDraftId(null);
  }, [user, toast]);

  const handleLoadCampaign = useCallback((campaignDraftId: string) => {
    router.push(`/smart-campaign?campaignDraftId=${campaignDraftId}`);
  }, [router]);

  const handleCopyDraftContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to Clipboard!", description: "Draft content is now on your clipboard.", iconType: "copy" });
  }, [toast]);

  const filteredPostDrafts = useMemo(() => {
    if (mainFilter === "quick") {
      return allPostDrafts.filter(draft => 
        (draft.platform === 'twitter' || draft.platform === 'linkedin') &&
        (quickPostSubFilter === 'all' || draft.platform === quickPostSubFilter)
      );
    }
    if (mainFilter === "visual") {
      return allPostDrafts.filter(draft => draft.platform === 'visual');
    }
    return allPostDrafts;
  }, [allPostDrafts, mainFilter, quickPostSubFilter]);

  const filteredCampaignDrafts = useMemo(() => {
    return mainFilter === "all" || mainFilter === "campaigns" ? allCampaignDrafts : [];
  }, [allCampaignDrafts, mainFilter]);


  const displayItems = useMemo(() => {
    let items: (Draft | CampaignDraft)[] = [];
    if (mainFilter === "all") {
      items = [...filteredPostDrafts, ...filteredCampaignDrafts];
    } else if (mainFilter === "campaigns") {
      items = [...filteredCampaignDrafts];
    } else {
      items = [...filteredPostDrafts];
    }
    return items.sort((a, b) => (b.updatedAt?.toDate()?.getTime() || 0) - (a.updatedAt?.toDate()?.getTime() || 0));
  }, [filteredPostDrafts, filteredCampaignDrafts, mainFilter]);


  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading Saved Drafts...</p>
      </div>
    );
  }

  const pageTitle = "My Saved Drafts & Campaigns";
  const pageIcon = Icons.archive;

  const mainFilterOptions: { value: MainFilter; label: string; icon: keyof typeof Icons }[] = [
    { value: "all", label: "All Items", icon: "layers" },
    { value: "quick", label: "Quick Posts", icon: "edit" },
    { value: "visual", label: "Visual Posts", icon: "image" },
    { value: "campaigns", label: "Campaigns", icon: "sparkles" },
  ];

  const quickPostSubFilterOptions: { value: QuickPostSubFilter; label: string; icon?: keyof typeof Icons }[] = [
    { value: "all", label: "All Quick", icon: "listChecks" },
    { value: "twitter", label: "Twitter", icon: "twitter" },
    { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  ];
  
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <HamburgerMenu />
          <Link href="/" passHref>
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
              <AppLogo className="h-12 w-12 sm:h-16 sm:w-16 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">SagePostAI</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{pageTitle}</p>
              </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl flex-grow w-full">
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-primary flex items-center">
                {React.createElement(pageIcon, { className: "mr-3 h-8 w-8"})}
                {pageTitle}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Browse, manage, and continue your saved content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={mainFilter} onValueChange={(value) => setMainFilter(value as MainFilter)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-700/50 border-slate-600 rounded-lg p-1 h-auto">
                  {mainFilterOptions.map(opt => {
                    const Icon = Icons[opt.icon] || Icons.file;
                    return (
                      <TabsTrigger
                        key={opt.value}
                        value={opt.value}
                        className="data-[state=active]:bg-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md text-slate-300 hover:bg-slate-600/50 transition-colors rounded-md py-2 sm:py-2.5 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                      >
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {mainFilter === 'quick' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                  <Tabs value={quickPostSubFilter} onValueChange={(value) => setQuickPostSubFilter(value as QuickPostSubFilter)} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-600/40 border-slate-500/70 rounded-md p-1 h-auto">
                       {quickPostSubFilterOptions.map(opt => {
                        const Icon = opt.icon ? Icons[opt.icon] || Icons.file : null;
                        return (
                          <TabsTrigger
                            key={opt.value}
                            value={opt.value}
                            className="data-[state=active]:bg-primary/70 data-[state=active]:text-primary-foreground text-slate-300 hover:bg-slate-500/40 transition-colors rounded py-1.5 text-xs flex items-center justify-center gap-1"
                          >
                            {Icon && <Icon className="h-3.5 w-3.5" />}
                            {opt.label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </motion.div>
              )}

              {isLoading ? (
                <div className="space-y-4 min-h-[200px]">
                    <DraftSkeleton />
                    <DraftSkeleton />
                    <DraftSkeleton />
                </div>
              ) : displayItems.length > 0 ? (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
                  <AnimatePresence>
                    {displayItems.map((item) => 
                      'content' in item ? (
                        <DraftListItem
                          key={item.id}
                          draft={item as Draft}
                          onViewDraft={setViewingDraft}
                          onDeleteDraft={handleDeleteDraft}
                          isDeleting={deletingDraftId === item.id}
                        />
                      ) : (
                        <CampaignDraftListItem
                          key={item.id}
                          campaignDraft={item as CampaignDraft}
                          onLoadCampaign={handleLoadCampaign}
                          onDeleteCampaign={handleDeleteCampaignDraft}
                          isDeleting={deletingCampaignDraftId === item.id}
                        />
                      )
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                 <div className="text-center py-10 px-4 bg-slate-700/30 rounded-lg border border-slate-600/50 min-h-[200px]">
                  <Icons.archive className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-300 mb-2">No Saved Items Here</h4>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    It looks like you haven't saved any drafts or campaigns that match the current filter. 
                    {mainFilter === "all" && " Try creating some content!"}
                  </p>
                  {mainFilter === "all" && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                        <Link href="/quick-post"><Icons.edit className="mr-2 h-4 w-4" />Quick Post</Link>
                      </Button>
                       <Button asChild variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                        <Link href="/smart-campaign"><Icons.sparkles className="mr-2 h-4 w-4" />New Campaign</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Dialog open={!!viewingDraft} onOpenChange={(isOpen) => !isOpen && setViewingDraft(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center">
                {viewingDraft ? getDraftPlatformInfo(viewingDraft.platform).icon : ''}
                <span className="ml-2">
                  View {viewingDraft ? getDraftPlatformInfo(viewingDraft.platform).name : 'Draft'}
                </span>
            </DialogTitle>
            {viewingDraft?.topic && <DialogDescription className="text-slate-400">Topic: {viewingDraft.topic}</DialogDescription>}
          </DialogHeader>
          <Textarea
            value={viewingDraft?.content || ''}
            readOnly
            rows={10}
            className="bg-slate-700/80 border-slate-600 text-slate-100 mt-2"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleCopyDraftContent(viewingDraft?.content || '')} className="border-green-500 text-green-400 hover:bg-green-500/10">
                <Icons.copy className="mr-2 h-4 w-4" /> Copy Content
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="w-full text-center p-6 sm:p-8 text-slate-500 text-sm mt-8">
        <span className="relative group hover:text-primary transition-colors duration-300 cursor-default">
          Made With ❤️ By 15-Year-Old Teenagers
          <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </div>
  );
}
