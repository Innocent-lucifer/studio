
"use client";

import React, { useEffect, useState, useCallback } from 'react'; 
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '@/components/icons';
import { AppLogo } from '@/components/AppLogo';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { getDrafts, deleteDraft, type Draft, getCampaignDrafts, deleteCampaignDraft, type CampaignDraft, getUserData, UserData } from '@/lib/firebaseUserActions';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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

const getDraftPlatformInfo = (platform: Draft['platform']) => {
  switch (platform) {
    case 'twitter':
      return { icon: <Icons.twitter className="h-5 w-5 text-sky-400" />, name: 'Twitter Draft' };
    case 'linkedin':
      return { icon: <Icons.linkedin className="h-5 w-5 text-blue-400" />, name: 'LinkedIn Draft' };
    case 'visual':
      return { icon: <Icons.image className="h-5 w-5 text-purple-400" />, name: 'Visual Post Draft' };
    default:
      return { icon: <Icons.file className="h-5 w-5 text-slate-400" />, name: 'Draft' };
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
      className="p-4 bg-slate-700/70 rounded-lg border border-slate-600 shadow-md hover:border-primary/50 transition-colors"
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
      className="p-4 bg-slate-700/70 rounded-lg border border-slate-600 shadow-md hover:border-primary/50 transition-colors"
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


export default function AccountPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(true);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [viewingDraft, setViewingDraft] = useState<Draft | null>(null);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);

  const [campaignDrafts, setCampaignDrafts] = useState<CampaignDraft[]>([]);
  const [isLoadingCampaignDrafts, setIsLoadingCampaignDrafts] = useState(true);
  const [deletingCampaignDraftId, setDeletingCampaignDraftId] = useState<string | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchAllUserData = useCallback(async () => {
    if (user) {
      setIsLoadingUserDetails(true);
      setIsLoadingDrafts(true);
      setIsLoadingCampaignDrafts(true);

      const [fetchedUserData, userDrafts, userCampaignDrafts] = await Promise.all([
        getUserData(user.uid),
        getDrafts(user.uid),
        getCampaignDrafts(user.uid)
      ]);

      setUserData(fetchedUserData);
      setDrafts(userDrafts);
      setCampaignDrafts(userCampaignDrafts);

      setIsLoadingUserDetails(false);
      setIsLoadingDrafts(false);
      setIsLoadingCampaignDrafts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllUserData();
  }, [fetchAllUserData]);

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  };

  const handleDeleteDraft = useCallback(async (draftId: string) => {
    if (!user || !draftId) return;
    setDeletingDraftId(draftId);
    const success = await deleteDraft(user.uid, draftId);
    if (success) {
      toast({ title: "Draft Deleted", description: "Your post draft has been successfully removed." });
      setDrafts(prevDrafts => prevDrafts.filter(d => d.id !== draftId));
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the post draft." });
    }
    setDeletingDraftId(null);
  }, [user, toast]);

  const handleDeleteCampaignDraft = useCallback(async (campaignDraftId: string) => {
    if (!user || !campaignDraftId) return;
    setDeletingCampaignDraftId(campaignDraftId);
    const success = await deleteCampaignDraft(user.uid, campaignDraftId);
    if (success) {
      toast({ title: "Campaign Draft Deleted", description: "Your campaign draft has been successfully removed." });
      setCampaignDrafts(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignDraftId));
    } else {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not delete the campaign draft." });
    }
    setDeletingCampaignDraftId(null);
  }, [user, toast]);

  const handleLoadCampaign = useCallback((campaignDraftId: string) => {
    router.push(`/smart-campaign?campaignDraftId=${campaignDraftId}`);
  }, [router]);

  const handleCopyDraftContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to Clipboard!", description: "Draft content has been copied." });
  }, [toast]);


  if (authLoading || (!user && !authLoading) || isLoadingUserDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-4">
        <Icons.loader className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-xl">Loading Account...</p>
      </div>
    );
  }
  
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
              <AppLogo className="h-12 w-12 sm:h-14 sm:w-14 text-primary group-hover:scale-110 transition-transform" />
               <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                    SagePostAI
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">My Account</p>
                </div>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl flex-grow w-full">
        <motion.div variants={cardVariants} initial="initial" animate="animate">
        <Card className="bg-slate-800/60 backdrop-blur-md border border-slate-700 shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-primary">Account Overview</CardTitle>
            <CardDescription className="text-slate-400">Manage your account details and saved content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">User Information</h3>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Email:</span> {userData?.email || user?.email}
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Phone:</span> <span className="text-slate-400 italic">N/A (Add phone number - Coming soon)</span>
              </p>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">UID:</span> <span className="text-xs">{user?.uid}</span>
              </p>
            </div>

            <div className="space-y-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="text-lg font-medium text-slate-200">Plan & Credits</h3>
              <p className="text-sm text-slate-300">
                Current Plan: <span className="font-semibold text-purple-400">{userData?.plan ? userData.plan.charAt(0).toUpperCase() + userData.plan.slice(1) : 'Loading...'}</span>
              </p>
              <p className="text-sm text-slate-300">
                Available Credits: <span className="font-semibold text-purple-400">{userData?.credits ?? 'Loading...'}</span>
              </p>
              <Button variant="outline" className="mt-2 border-primary text-primary hover:bg-primary/10" disabled>
                Manage Subscription / Buy Credits (Coming Soon)
              </Button>
            </div>
            
            <Separator className="bg-slate-700" />

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-4">My Saved Post Drafts</h3>
              {isLoadingDrafts ? (
                <div className="flex items-center justify-center p-6 rounded-md bg-slate-700/30">
                  <Icons.loader className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-slate-300">Loading post drafts...</span>
                </div>
              ) : drafts.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {drafts.map((draft) => (
                      <DraftListItem
                        key={draft.id}
                        draft={draft}
                        onViewDraft={setViewingDraft}
                        onDeleteDraft={handleDeleteDraft}
                        isDeleting={deletingDraftId === draft.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                 <div className="text-center py-8 px-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <Icons.fileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-300 mb-1">No Post Drafts Yet!</h4>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Your creative ideas will be saved here. Try generating some content and save it as a draft!
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <Link href="/quick-post"><Icons.edit className="mr-2 h-4 w-4" />Quick Post</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                      <Link href="/visual-post"><Icons.image className="mr-2 h-4 w-4" />Image to Post</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-700" />

            <div>
              <h3 className="text-2xl font-semibold text-primary mb-4">My Saved Campaigns</h3>
              {isLoadingCampaignDrafts ? (
                <div className="flex items-center justify-center p-6 rounded-md bg-slate-700/30">
                  <Icons.loader className="h-8 w-8 animate-spin text-primary mr-3" />
                  <span className="text-slate-300">Loading campaign drafts...</span>
                </div>
              ) : campaignDrafts.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {campaignDrafts.map((campaign) => (
                      <CampaignDraftListItem
                        key={campaign.id}
                        campaignDraft={campaign}
                        onLoadCampaign={handleLoadCampaign}
                        onDeleteCampaign={handleDeleteCampaignDraft}
                        isDeleting={deletingCampaignDraftId === campaign.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                 <div className="text-center py-8 px-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <Icons.layers className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-slate-300 mb-1">No Campaigns Saved Yet!</h4>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Craft a full Smart Campaign and save it here to pick up where you left off or reuse your strategies.
                  </p>
                  <div className="mt-6">
                    <Button asChild variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                      <Link href="/smart-campaign"><Icons.sparkles className="mr-2 h-4 w-4" />Create a Smart Campaign</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>


            <Separator className="bg-slate-700" />
            <Button onClick={handleLogout} variant="destructive" className="w-full sm:w-auto">
              <Icons.logOut className="mr-2 h-5 w-5" /> Log Out
            </Button>
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
          Built by EZ Teenagers.
          <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </span>
      </footer>
    </div>
  );
}
