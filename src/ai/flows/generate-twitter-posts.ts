
'use server';
/**
 * @fileOverview Generates multiple Twitter posts based on a researched topic.
 *
 * - generateTwitterPosts - A function that generates Twitter posts automatically after research.
 * - regenerateTwitterPosts - A function for manual regeneration, which counts as a new usage.
 * - GenerateTwitterPostsInput - The input type for the functions.
 * - GenerateTwitterPostsOutput - The return type for the functions.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";
import { checkAndIncrementUsage } from '@/lib/firebaseAdminActions';

const GenerateTwitterPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate Twitter posts about. This might be a simple topic string or a more detailed researched summary.'),
  topicDisplay: z.string().optional().describe('The original, user-facing topic string, used for display and context if the main "topic" field contains a lengthy research summary.'),
  numPosts: z.number().describe('The number of Twitter posts to generate.'),
  userId: z.string().optional().describe('The ID of the user requesting the posts. Required for credit deduction.'),
});
export type GenerateTwitterPostsInput = z.infer<typeof GenerateTwitterPostsInputSchema>;

const GenerateTwitterPostsOutputSchema = z.object({
  posts: z.array(
    z.string().describe('A generated Twitter post.')
  ).describe('The list of generated Twitter posts.').optional(),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateTwitterPostsOutput = z.infer<typeof GenerateTwitterPostsOutputSchema>;

// This is for the initial automatic generation (no credit cost)
export async function generateTwitterPosts(input: GenerateTwitterPostsInput): Promise<GenerateTwitterPostsOutput> {
  return generateTwitterPostsFlow(input);
}

// This is for manual regeneration (costs a credit)
export async function regenerateTwitterPosts(input: GenerateTwitterPostsInput): Promise<GenerateTwitterPostsOutput> {
    return regenerateTwitterPostsFlow(input);
}


const generateTwitterPostsPrompt = ai.definePrompt({
  name: 'generateTwitterPostsPrompt',
  input: {
    schema: z.object({
      topicForAI: z.string().describe('The topic or researched information to generate Twitter posts about.'),
      displayTopic: z.string().describe('The original user-facing topic, for context in the prompt.'),
      numPosts: z.number().describe('The number of Twitter posts to generate.'),
    }),
  },
  output: { 
    schema: z.object({
      posts: z.array(
        z.string().describe('A generated Twitter post.')
      ).describe('The list of generated Twitter posts.')
    }),
  },
  prompt: `You are an expert ghostwriter who is undetectable from a real, savvy Twitter user. Your writing has emotional depth and intelligence. 🐦
Your task is to generate {{numPosts}} Twitter posts about the following topic: "{{displayTopic}}".
Use the detailed researched information provided below as the primary source for generating varied and engaging posts.
The posts MUST sound like a real person wrote them, with a natural, conversational, and deeply human-like tone. They should be completely undetectable as AI-generated content.
They should be:
- Cool, punchy, and attention-grabbing.
- Emotionally resonant, witty, and concise.
- Use relevant slang or humor where appropriate to sound authentic.
- Incorporate emojis naturally to enhance the human feel.
**Crucially, if the "Researched Information" contains any signals of recent events, timeliness, or specific details from live data (e.g., from Twitter search), ensure your posts reflect this up-to-date context.**

Researched Information:
{{{topicForAI}}}

Craft your tweets to be indistinguishable from a real person's thoughts, not a corporate bot.

Posts:`,
  promptOptions: {
    temperature: 0.9,
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const commonGenerationLogic = async (input: GenerateTwitterPostsInput): Promise<GenerateTwitterPostsOutput> => {
    try {
      let researchedInformation = input.topic;
      if (((!input.topicDisplay && input.topic.length < 100) || (input.topicDisplay && input.topic.length < 100 && input.topic === input.topicDisplay))) {
        const researchedInfoResult = await researchTopic({ topic: input.topic, userId: input.userId });
        if (!researchedInfoResult.error) {
          researchedInformation = researchedInfoResult.summary;
        }
      }

      const { output: promptOutput } = await generateTwitterPostsPrompt({
        topicForAI: researchedInformation,
        displayTopic: input.topicDisplay || input.topic,
        numPosts: input.numPosts,
      });
      
      if (!promptOutput || !promptOutput.posts) {
        return { error: "AI failed to generate Twitter posts content." };
      }
      
      return { 
        posts: promptOutput.posts, 
      };

    } catch (e: any) {
      return { error: e.message || "An unexpected error occurred during Twitter post generation." };
    }
}

// Flow for automatic generation (NO usage check)
const generateTwitterPostsFlow = ai.defineFlow(
  {
    name: 'generateTwitterPostsFlow',
    inputSchema: GenerateTwitterPostsInputSchema,
    outputSchema: GenerateTwitterPostsOutputSchema,
  },
  commonGenerationLogic
);

// Flow for regeneration (WITH usage check)
const regenerateTwitterPostsFlow = ai.defineFlow(
    {
        name: 'regenerateTwitterPostsFlow',
        inputSchema: GenerateTwitterPostsInputSchema,
        outputSchema: GenerateTwitterPostsOutputSchema,
    },
    async (input) => {
        if (!input.userId) {
            return { error: "User ID is required for this operation." };
        }
        const usageCheck = await checkAndIncrementUsage(input.userId);
        if (!usageCheck.canProceed) {
            return { error: usageCheck.error };
        }
        return commonGenerationLogic(input);
    }
);
