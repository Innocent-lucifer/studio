
"use client";

import React, { useState, useCallback } from "react"; // Import React
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { generateEditedPost } from "@/ai/flows/generateEditedPost";
import { saveDraft } from "@/lib/firebaseUserActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Icons } from "./icons";
import { ScrollArea } from "./ui/scroll-area";


interface PostSelectionProps {
  twitterPosts: string[];
  linkedinPosts: string[];
  topic: string;
  userId?: string; 
  onUpdatePost: (type: 'twitter' | 'linkedin', index: number, newText: string) => void;
}

interface PostDisplayItemProps {
  post: string;
  type: 'twitter' | 'linkedin';
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onSaveDraft: () => void;
  isSavingThisDraft: boolean;
  userId?: string;
}

const PostDisplayItemComponent: React.FC<PostDisplayItemProps> = ({
  post,
  type,
  index,
  isSelected,
  onSelect,
  onEdit,
  onSaveDraft,
  isSavingThisDraft,
  userId
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };
  const platformIcon = type === 'twitter' ? <Icons.twitter className="mr-2 h-5 w-5 text-sky-400" /> : <Icons.linkedin className="mr-2 h-5 w-5 text-blue-400" />;
  const platformColor = type === 'twitter' ? 'text-sky-400' : 'text-blue-400';

  return (
    <motion.div
      key={`${type}-${index}`}
      className="p-3 bg-slate-700/50 rounded-md border border-slate-600 hover:border-primary/50 transition-colors"
      variants={itemVariants}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          id={`${type}-cb-${index}`}
          checked={isSelected}
          onCheckedChange={onSelect}
          className="mt-1 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          disabled={!userId}
        />
        <Label htmlFor={`${type}-cb-${index}`} className="flex-grow text-sm text-slate-200 cursor-pointer whitespace-pre-wrap">{post}</Label>
        <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className={`${platformColor}/80 hover:${platformColor} h-auto p-1 disabled:opacity-50`}
            disabled={!userId || isSavingThisDraft}
            title="Edit Post"
          >
            <Icons.edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveDraft}
            className="text-green-400/80 hover:text-green-400 h-auto p-1 disabled:opacity-50"
            disabled={!userId || isSavingThisDraft}
            title="Save as Draft"
          >
            {isSavingThisDraft ? <Icons.loader className="h-4 w-4 animate-pulse" /> : <Icons.save className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
const PostDisplayItem = React.memo(PostDisplayItemComponent);


export const PostSelection: React.FC<PostSelectionProps> = ({ 
  twitterPosts, 
  linkedinPosts, 
  topic, 
  userId,
  onUpdatePost 
}) => {
  const [selectedTwitterPosts, setSelectedTwitterPosts] = useState<string[]>([]);
  const [selectedLinkedInPosts, setSelectedLinkedInPosts] = useState<string[]>([]);
  
  const [editingPost, setEditingPost] = useState<{type: 'twitter' | 'linkedin', index: number, originalTextWhileEditing: string, currentText: string} | null>(null);
  const [isAiEditingModalOpen, setIsAiEditingModalOpen] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState<{ type: 'twitter' | 'linkedin', index: number } | null>(null);
  
  const { toast } = useToast();

  const buttonMotionProps = {
    whileHover: { scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 10 } },
    whileTap: { scale: 0.97, transition: { type: "spring", stiffness: 400, damping: 17 } },
  };

  const handlePostSelection = useCallback((post: string, type: 'twitter' | 'linkedin') => {
    if (type === 'twitter') {
      setSelectedTwitterPosts(prev => 
        prev.includes(post) ? prev.filter(p => p !== post) : [...prev, post]
      );
    } else {
      setSelectedLinkedInPosts(prev => 
        prev.includes(post) ? prev.filter(p => p !== post) : [...prev, post]
      );
    }
  }, []);

  const handleEditPost = useCallback((postText: string, index: number, type: 'twitter' | 'linkedin') => {
    if (!userId) {
      toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to edit posts." });
      return;
    }
    setEditingPost({ type, index, originalTextWhileEditing: postText, currentText: postText });
  }, [userId, toast]);
  

  const handleSaveEdit = useCallback(() => {
    if (editingPost) {
      onUpdatePost(editingPost.type, editingPost.index, editingPost.currentText);
      toast({
        title: "Post Updated",
        description: "Your changes have been saved to the main list.",
      });
      setEditingPost(null);
    }
  }, [editingPost, onUpdatePost, toast]);
  
  const handleCancelEdit = useCallback(() => {
    setEditingPost(null);
  }, []);

  const handleCopySelectedPosts = useCallback(() => {
    const allSelectedPosts = [...selectedTwitterPosts, ...selectedLinkedInPosts];
    if (allSelectedPosts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Posts Selected",
        description: "Please select at least one post to copy.",
      });
      return;
    }
    navigator.clipboard.writeText(allSelectedPosts.join("\n\n---\n\n"));
    toast({
      title: "Posts Copied!",
      description: "Selected posts have been copied to your clipboard.",
    });
  }, [selectedTwitterPosts, selectedLinkedInPosts, toast]);

  const openAiEditModal = useCallback(() => {
    if (!editingPost) {
       toast({
        variant: "destructive",
        title: "No Post Selected for AI Edit",
        description: "Please first select a post and click 'Edit' to enable AI changes.",
      });
      return;
    }
    setIsAiEditingModalOpen(true);
  }, [editingPost, toast]);

  const handleAiEditSubmit = useCallback(async () => {
    if (!editingPost || !aiEditInstruction.trim() || !userId) {
      toast({
        title: "Missing Information",
        description: "Please ensure a post is being edited, you are logged in, and provide instructions for the AI.",
        variant: "destructive",
      });
      return;
    }
    setIsAiSubmitting(true);
    
    try {
      const result = await generateEditedPost({
        originalPost: editingPost.currentText, 
        editInstruction: aiEditInstruction,
        topic: topic, 
        platform: editingPost.type,
        userId: userId,
      });

      if (result.error) {
        toast({ variant: "destructive", title: "AI Edit Error", description: result.error});
      } else if (result.editedPost){
        setEditingPost(prev => prev ? { ...prev, currentText: result.editedPost! } : null);
        toast({
          title: "AI Edit Applied",
          description: "The AI has revised the post. Click 'Save Changes' to update the main list.",
        });
        setIsAiEditingModalOpen(false);
        setAiEditInstruction("");
      } else {
        toast({ variant: "destructive", title: "AI Edit Failed", description: "AI did not return an edited post."});
      }
    } catch (error: any) {
      console.error("Error applying AI edit:", error);
      toast({
        title: "AI Edit Failed",
        description: error.message || "Could not apply AI changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiSubmitting(false);
    }
  }, [editingPost, aiEditInstruction, userId, topic, toast]);

  const handleSaveDraft = useCallback(async (postContent: string, postTopic: string, platform: 'twitter' | 'linkedin', index: number) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to save drafts." });
      return;
    }
    setIsSavingDraft({ type: platform, index });
    const draftData = {
      content: postContent,
      platform: platform,
      topic: postTopic,
    };
    try {
      const savedDraft = await saveDraft(userId, draftData);
      if (savedDraft) {
        toast({ title: "Draft Saved!", description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} post draft has been saved.` });
      } else {
        toast({ variant: "destructive", title: "Save Failed", description: "Could not save the draft. Please try again." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Save Error", description: "An error occurred while saving." });
    } finally {
      setIsSavingDraft(null);
    }
  }, [userId, toast]);
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><Icons.twitter className="mr-2 h-5 w-5" />Twitter Posts</h3>
        <ScrollArea className="h-[250px] md:h-[350px] pr-3">
        <div className="space-y-3">
          {twitterPosts.map((post, index) => (
            <PostDisplayItem
              key={`twitter-${index}`}
              post={post}
              type="twitter"
              index={index}
              isSelected={selectedTwitterPosts.includes(post)}
              onSelect={() => handlePostSelection(post, 'twitter')}
              onEdit={() => handleEditPost(post, index, 'twitter')}
              onSaveDraft={() => handleSaveDraft(post, topic, 'twitter', index)}
              isSavingThisDraft={isSavingDraft?.type === 'twitter' && isSavingDraft?.index === index}
              userId={userId}
            />
          ))}
        </div>
        </ScrollArea>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><Icons.linkedin className="mr-2 h-5 w-5" />LinkedIn Posts</h3>
         <ScrollArea className="h-[250px] md:h-[350px] pr-3">
        <div className="space-y-3">
          {linkedinPosts.map((post, index) => (
             <PostDisplayItem
              key={`linkedin-${index}`}
              post={post}
              type="linkedin"
              index={index}
              isSelected={selectedLinkedInPosts.includes(post)}
              onSelect={() => handlePostSelection(post, 'linkedin')}
              onEdit={() => handleEditPost(post, index, 'linkedin')}
              onSaveDraft={() => handleSaveDraft(post, topic, 'linkedin', index)}
              isSavingThisDraft={isSavingDraft?.type === 'linkedin' && isSavingDraft?.index === index}
              userId={userId}
            />
          ))}
        </div>
        </ScrollArea>
      </div>

      <AnimatePresence>
        {editingPost && (
          <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle className="text-primary">Edit Post ({editingPost.type})</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Refine your post content here. Use AI to make changes or edit manually.
                </DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Textarea
                  value={editingPost.currentText}
                  onChange={(e) => setEditingPost(prev => prev ? { ...prev, currentText: e.target.value } : null)}
                  rows={8}
                  className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm"
                />
              </motion.div>
              <DialogFooter className="mt-4 sm:justify-between">
                <Button variant="outline" onClick={handleCancelEdit} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  Cancel
                </Button>
                <div className="flex space-x-2">
                   <Button onClick={openAiEditModal} className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Icons.sparkles className="mr-2 h-4 w-4" /> Edit with AI
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Icons.save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      
      <Dialog open={isAiEditingModalOpen} onOpenChange={setIsAiEditingModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">AI-Powered Editing</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tell the AI how you want to change the selected post.
              For example: "Make it more professional", "Add a call to action to visit our website", "Shorten it to 2 sentences".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Make it funnier and add relevant emojis"
            value={aiEditInstruction}
            onChange={(e) => setAiEditInstruction(e.target.value)}
            rows={3}
            className="bg-slate-700 border-slate-600 text-slate-100 focus:ring-primary focus:border-primary text-sm mt-2"
          />
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAiEditSubmit} disabled={isAiSubmitting || !aiEditInstruction.trim() || !userId} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isAiSubmitting ? <Icons.loader className="animate-spin mr-2 h-4 w-4" /> : <Icons.wand className="mr-2 h-4 w-4" />}
              Apply AI Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center" variants={itemVariants}>
        <motion.div {...buttonMotionProps} className="w-full sm:w-auto">
          <Button onClick={handleCopySelectedPosts} disabled={(selectedTwitterPosts.length === 0 && selectedLinkedInPosts.length === 0) || !userId} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2.5 px-6">
            <Icons.copy className="mr-2 h-5 w-5" /> Copy Selected Posts
          </Button>
        </motion.div>
        <motion.div {...buttonMotionProps} className="w-full sm:w-auto">
          <Button 
            onClick={() => { 
              toast({ title: "Feature Coming Soon", description: "Post scheduling will be available in a future update."});
            }} 
            variant="outline" 
            className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 py-2.5 px-6"
            disabled={!userId}
          >
            <Icons.calendar className="mr-2 h-5 w-5" /> Schedule Selected
          </Button>
        </motion.div>
        <motion.div {...buttonMotionProps} className="w-full sm:w-auto">
           <Button 
            onClick={() => { 
               toast({ title: "Feature Coming Soon", description: "Instant posting will be available after account integration."});
            }} 
            variant="outline" 
            className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/10 py-2.5 px-6"
            disabled={!userId}
          >
            <Icons.send className="mr-2 h-5 w-5" /> Post Selected Now
          </Button>
        </motion.div>
      </motion.div>
       <p className="mt-4 text-xs text-slate-500 text-center">
        {userId ? "Select posts to copy, schedule, or post instantly. Edit or save drafts using the icons." : "Log in to interact with posts."}
      </p>
    </motion.div>
  );
};
