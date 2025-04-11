
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PostSelectionProps {
  twitterPosts: string[];
  linkedinPosts: string[];
}

export const PostSelection: React.FC<PostSelectionProps> = ({ twitterPosts, linkedinPosts }) => {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [editedPost, setEditedPost] = useState<string>("");

  const handlePostSelection = (post: string) => {
    if (selectedPosts.includes(post)) {
      setSelectedPosts(selectedPosts.filter((p) => p !== post));
    } else {
      setSelectedPosts([...selectedPosts, post]);
    }
  };

  const handleEditPost = (post: string) => {
    setEditedPost(post);
  };

  const handleCopySelectedPosts = () => {
    navigator.clipboard.writeText(selectedPosts.join("\n\n"));
    alert("Selected posts copied to clipboard!");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Post Selection and Editing</h2>
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-1">Twitter Posts</h3>
        {twitterPosts.map((post, index) => (
          <div key={index} className="mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedPosts.includes(post)}
                onChange={() => handlePostSelection(post)}
              />
              <span>{post}</span>
              <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                Edit
              </Button>
            </label>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h3 className="text-md font-semibold mb-1">LinkedIn Posts</h3>
        {linkedinPosts.map((post, index) => (
          <div key={index} className="mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedPosts.includes(post)}
                onChange={() => handlePostSelection(post)}
              />
              <span>{post}</span>
              <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                Edit
              </Button>
            </label>
          </div>
        ))}
      </div>

      {editedPost && (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-1">Edit Post</h3>
          <Textarea value={editedPost} onChange={(e) => setEditedPost(e.target.value)} />
          <Button onClick={() => setEditedPost("")}>Save</Button>
        </div>
      )}

      <Button onClick={handleCopySelectedPosts} disabled={selectedPosts.length === 0}>
        Copy Selected Posts to Clipboard
      </Button>
    </div>
  );
};
