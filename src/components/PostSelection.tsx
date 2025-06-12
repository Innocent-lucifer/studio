
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { generateEditedPost } from "@/ai/flows/generateEditedPost";
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
  onUpdatePost: (type: 'twitter' | 'linkedin', index: number, newText: string) => void;
}

export const PostSelection: React.FC<PostSelectionProps> = ({ 
  twitterPosts, 
  linkedinPosts, 
  topic, 
  onUpdatePost 
}) => {
  const [selectedTwitterPosts, setSelectedTwitterPosts] = useState<string[]>([]);
  const [selectedLinkedInPosts, setSelectedLinkedInPosts] = useState<string[]>([]);
  
  const [editingPost, setEditingPost] = useState<{type: 'twitter' | 'linkedin', index: number, originalTextWhileEditing: string, currentText: string} | null>(null);
  const [isAiEditingModalOpen, setIsAiEditingModalOpen] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState("");
  const [isAiSubmitting, setIsAiSubmitting] = useState(false);
  
  const { toast } = useToast();

  const handlePostSelection = (post: string, type: 'twitter' | 'linkedin') => {
    if (type === 'twitter') {
      setSelectedTwitterPosts(prev => 
        prev.includes(post) ? prev.filter(p => p !== post) : [...prev, post]
      );
    } else {
      setSelectedLinkedInPosts(prev => 
        prev.includes(post) ? prev.filter(p => p !== post) : [...prev, post]
      );
    }
  };

  const handleEditPost = (postText: string, index: number, type: 'twitter' | 'linkedin') => {
    // When opening edit, `postText` is the current text from the list (twitterPosts[index] or linkedinPosts[index])
    setEditingPost({ type, index, originalTextWhileEditing: postText, currentText: postText });
  };
  

  const handleSaveEdit = () => {
    if (editingPost) {
      onUpdatePost(editingPost.type, editingPost.index, editingPost.currentText);
      toast({
        title: "Post Updated",
        description: "Your changes have been saved to the main list.",
      });
      setEditingPost(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  const handleCopySelectedPosts = () => {
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
  };

  const openAiEditModal = () => {
    if (!editingPost) {
       toast({
        variant: "destructive",
        title: "No Post Selected for AI Edit",
        description: "Please first select a post and click 'Edit' to enable AI changes.",
      });
      return;
    }
    setIsAiEditingModalOpen(true);
  };

  const handleAiEditSubmit = async () => {
    if (!editingPost || !aiEditInstruction.trim()) {
      toast({
        title: "Missing Information",
        description: "Please ensure a post is being edited and provide instructions for the AI.",
        variant: "destructive",
      });
      return;
    }
    setIsAiSubmitting(true);
    try {
      const result = await generateEditedPost({
        originalPost: editingPost.currentText, // Use current text in editor for AI edit
        editInstruction: aiEditInstruction,
        topic: topic, 
        platform: editingPost.type,
      });
      // Update only the currentText in the dialog, Save will commit it to parent
      setEditingPost(prev => prev ? { ...prev, currentText: result.editedPost } : null);
      toast({
        title: "AI Edit Applied",
        description: "The AI has revised the post. Click 'Save Changes' to update the main list.",
      });
      setIsAiEditingModalOpen(false);
      setAiEditInstruction("");
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
  };
  
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
        <ScrollArea className="h-[200px] pr-3">
        <div className="space-y-3">
          {twitterPosts.map((post, index) => (
            <motion.div 
              key={`twitter-${index}`} 
              className="p-3 bg-slate-700/50 rounded-md border border-slate-600 hover:border-primary/50 transition-colors"
              variants={itemVariants}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`twitter-cb-${index}`}
                  checked={selectedTwitterPosts.includes(post)}
                  onCheckedChange={() => handlePostSelection(post, 'twitter')}
                  className="mt-1 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor={`twitter-cb-${index}`} className="flex-grow text-sm text-slate-200 cursor-pointer">{post}</Label>
                <Button variant="ghost" size="sm" onClick={() => handleEditPost(post, index, 'twitter')} className="text-primary/80 hover:text-primary h-auto p-1">
                  <Icons.edit className="h-4 w-4"/>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        </ScrollArea>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-primary flex items-center"><Icons.linkedin className="mr-2 h-5 w-5" />LinkedIn Posts</h3>
         <ScrollArea className="h-[200px] pr-3">
        <div className="space-y-3">
          {linkedinPosts.map((post, index) => (
            <motion.div 
              key={`linkedin-${index}`} 
              className="p-3 bg-slate-700/50 rounded-md border border-slate-600 hover:border-primary/50 transition-colors"
              variants={itemVariants}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`linkedin-cb-${index}`}
                  checked={selectedLinkedInPosts.includes(post)}
                  onCheckedChange={() => handlePostSelection(post, 'linkedin')}
                   className="mt-1 border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor={`linkedin-cb-${index}`} className="flex-grow text-sm text-slate-200 cursor-pointer whitespace-pre-wrap">{post}</Label>
                 <Button variant="ghost" size="sm" onClick={() => handleEditPost(post, index, 'linkedin')} className="text-primary/80 hover:text-primary h-auto p-1">
                   <Icons.edit className="h-4 w-4"/>
                 </Button>
              </div>
            </motion.div>
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
                  Refine your post content here. Use AI changes or edit manually.
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
                    <Icons.sparkles className="mr-2 h-4 w-4" /> Make AI Changes
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
            <Button onClick={handleAiEditSubmit} disabled={isAiSubmitting || !aiEditInstruction.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isAiSubmitting ? <Icons.loader className="animate-spin mr-2 h-4 w-4" /> : <Icons.wand className="mr-2 h-4 w-4" />}
              Apply AI Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center" variants={itemVariants}>
        <Button onClick={handleCopySelectedPosts} disabled={selectedTwitterPosts.length === 0 && selectedLinkedInPosts.length === 0} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2.5 px-6">
          <Icons.copy className="mr-2 h-5 w-5" /> Copy Selected Posts
        </Button>
        <Button 
          onClick={() => { 
            toast({ title: "Feature Coming Soon", description: "Post scheduling will be available in a future update."});
          }} 
          variant="outline" 
          className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 py-2.5 px-6"
        >
          <Icons.calendar className="mr-2 h-5 w-5" /> Schedule Selected
        </Button>
         <Button 
          onClick={() => { 
             toast({ title: "Feature Coming Soon", description: "Instant posting will be available after account integration."});
          }} 
          variant="outline" 
          className="w-full sm:w-auto border-blue-500 text-blue-400 hover:bg-blue-500/10 py-2.5 px-6"
        >
          <Icons.send className="mr-2 h-5 w-5" /> Post Selected Now
        </Button>
      </motion.div>
       <p className="mt-4 text-xs text-slate-500 text-center">
        Select posts to copy, schedule, or post instantly. Edit posts by clicking the <Icons.edit className="inline h-3 w-3"/> icon.
      </p>
    </motion.div>
  );
};
