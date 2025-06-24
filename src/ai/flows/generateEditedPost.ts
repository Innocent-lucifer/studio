
'use server';
/**
 * @fileOverview An AI agent for editing existing social media posts based on user instructions.
 *
 * - generateEditedPost - A function that handles the post editing process.
 * - GenerateEditedPostInput - The input type for the generateEditedPost function.
 * - GenerateEditedPostOutput - The return type for the generateEditedPost function.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';

const GenerateEditedPostInputSchema = z.object({
  originalPost: z.string().describe('The original social media post content.'),
  editInstruction: z.string().describe('The user\'s instruction on how to edit the post (e.g., "make it shorter", "add a call to action").'),
  topic: z.string().describe('The original topic of the post, for context.'),
  platform: z.enum(['twitter', 'linkedin']).describe('The social media platform the post is for.'),
  userId: z.string().optional().describe('The ID of the user requesting the edit. Optional for now.'),
});
export type GenerateEditedPostInput = z.infer<typeof GenerateEditedPostInputSchema>;

const GenerateEditedPostOutputSchema = z.object({
  editedPost: z.string().describe('The AI-edited social media post.').optional(),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateEditedPostOutput = z.infer<typeof GenerateEditedPostOutputSchema>;

export async function generateEditedPost(input: GenerateEditedPostInput): Promise<GenerateEditedPostOutput> {
  return generateEditedPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEditedPostPrompt',
  input: {schema: GenerateEditedPostInputSchema},
  output: {schema: z.object({ editedPost: z.string() })},
  prompt: `You are an expert social media post editor.
You will revise an existing social media post based on the user's instructions.
The post is for the {{platform}} platform and relates to the topic: "{{topic}}".

Original Post:
{{{originalPost}}}

User's Edit Instruction:
"{{{editInstruction}}}"

Your task is to apply the edit instruction to the original post and provide the revised post.
Ensure the edited post remains suitable for the {{platform}} platform and maintains the context of the original topic.

Edited Post:`,
  promptOptions: {
    temperature: 0.5,
  },
});

const generateEditedPostFlow = ai.defineFlow(
  {
    name: 'generateEditedPostFlow',
    inputSchema: GenerateEditedPostInputSchema,
    outputSchema: GenerateEditedPostOutputSchema,
  },
  async (input) => {
    try {
      const {output: promptOutput} = await prompt(input); 
      if (!promptOutput || !promptOutput.editedPost) {
        return { 
          editedPost: `// AI Edit Failed to produce new content. Original Post:\n${input.originalPost}\n// Instruction: ${input.editInstruction}`, 
          error: "AI failed to edit post. No content returned." 
        };
      }
      
      return { editedPost: promptOutput.editedPost };

    } catch (e: any) {
      console.error("[generateEditedPostFlow] Error:", e);
      return { 
        editedPost: `// AI Edit encountered an exception. Original Post:\n${input.originalPost}\n// Instruction: ${input.editInstruction}`,
        error: e.message || "An unexpected error occurred during post editing." 
      };
    }
  }
);
