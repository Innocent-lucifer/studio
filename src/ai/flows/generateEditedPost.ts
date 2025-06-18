
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
// import { getUserData, deductCredits, CREDIT_COSTS, CreditTransactionType } from '@/lib/firebaseUserActions'; 

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
  input: {schema: GenerateEditedPostInputSchema}, // Will pass full input, prompt uses relevant fields
  output: {schema: z.object({ editedPost: z.string() })}, // Direct output from LLM
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
    // console.log(`[generateEditedPostFlow] User: ${input.userId || 'Guest'}, Editing for platform: ${input.platform}`);
    // if (input.userId) { // Credit check temporarily disabled
    //   const userData = await getUserData(input.userId);
    //   if (!userData) {
    //     return { error: "User data not found. Cannot perform AI edit." };
    //   }
    //   if (userData.plan !== 'infinity' && (userData.credits || 0) < CREDIT_COSTS.AI_EDIT) {
    //     return { error: `Insufficient credits for AI Edit. Need ${CREDIT_COSTS.AI_EDIT}, have ${userData.credits || 0}.` };
    //   }
    // }

    try {
      const {output: promptOutput} = await prompt(input); 
      if (!promptOutput || !promptOutput.editedPost) {
        // Fallback to original post if AI edit fails but doesn't throw an error itself
        return { 
          editedPost: `// AI Edit Failed to produce new content. Original Post:\n${input.originalPost}\n// Instruction: ${input.editInstruction}`, 
          error: "AI failed to edit post. No content returned." 
        };
      }
      
      // if (input.userId) { // Credit deduction temporarily disabled
      //    const deductionResult = await deductCredits(
      //       input.userId, 
      //       CREDIT_COSTS.AI_EDIT,
      //       `AI Edit for platform: ${input.platform}, topic: ${input.topic}`,
      //       CreditTransactionType.FEATURE_USE_AI_EDIT,
      //       'generateEditedPostFlow'
      //     );
      //     if (!deductionResult.success) {
      //       console.error(`[generateEditedPostFlow] Credit deduction failed for user ${input.userId}: ${deductionResult.error}`);
      //     }
      // }
      return { editedPost: promptOutput.editedPost };

    } catch (e: any) {
      console.error("[generateEditedPostFlow] Error:", e);
      return { 
        // Provide original post in case of exception too, so user doesn't lose original content due to AI error
        editedPost: `// AI Edit encountered an exception. Original Post:\n${input.originalPost}\n// Instruction: ${input.editInstruction}`,
        error: e.message || "An unexpected error occurred during post editing." 
      };
    }
  }
);

    