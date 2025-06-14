
'use server';
/**
 * @fileOverview Generates multiple Twitter posts based on a researched topic with varying tones and angles.
 *
 * - generateTwitterPosts - A function that generates Twitter posts.
 * - GenerateTwitterPostsInput - The input type for the generateTwitterPosts function.
 * - GenerateTwitterPostsOutput - The return type for the generateTwitterPosts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";
// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed

const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

const GenerateTwitterPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate Twitter posts about.'),
  numPosts: z.number().describe('The number of Twitter posts to generate.'),
  userId: z.string().describe('The ID of the user requesting the posts.'),
});
export type GenerateTwitterPostsInput = z.infer<typeof GenerateTwitterPostsInputSchema>;

const GenerateTwitterPostsOutputSchema = z.object({
  posts: z.array(
    z.string().describe('A generated Twitter post.')
  ).describe('The list of generated Twitter posts.').optional(),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateTwitterPostsOutput = z.infer<typeof GenerateTwitterPostsOutputSchema>;

export async function generateTwitterPosts(input: GenerateTwitterPostsInput): Promise<GenerateTwitterPostsOutput> {
  return generateTwitterPostsFlow(input);
}

const generateTwitterPostsPrompt = ai.definePrompt({
  name: 'generateTwitterPostsPrompt',
  input: {
    schema: z.object({
      topic: z.string().describe('The topic to generate Twitter posts about.'),
      numPosts: z.number().describe('The number of Twitter posts to generate.'),
      researchedInformation: z.string().describe('The researched information about the topic.'),
    }),
  },
  output: { // Output from LLM direct
    schema: z.object({
      posts: z.array(
        z.string().describe('A generated Twitter post.')
      ).describe('The list of generated Twitter posts.')
    }),
  },
  prompt: `You are a social media expert and a savvy Twitter user. 🐦
Your task is to generate {{numPosts}} Twitter posts about the following topic.
The posts should be:
- Cool and punchy
- Use an open, conversational, and human-like tone
- Engaging, shareable, and attention-grabbing
- Witty and concise
- Feel free to use relevant slang or a bit of humor if appropriate for the topic, but keep it generally respectful.
- Incorporate emojis to make them more engaging.

Topic: {{{topic}}}

Researched Information: {{{researchedInformation}}}

Craft your tweets to sound like they're coming from a real person, not a corporate bot.

Posts:`,
  promptOptions: {
    temperature: 0.8, 
  },
});

const generateTwitterPostsFlow = ai.defineFlow(
  {
    name: 'generateTwitterPostsFlow',
    inputSchema: GenerateTwitterPostsInputSchema,
    outputSchema: GenerateTwitterPostsOutputSchema,
  },
  async (input) => {
    // Auth stubbed: Bypass credit check for MOCK_USER_ID
    if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
      // This block would contain real credit check logic if auth were active
      // const userData = await getUserData(input.userId);
      // if (!userData) return { error: "User data not found." };
      // if (userData.plan !== 'infinity' && (userData.credits || 0) <= 0) {
      //   return { error: "You have no credits remaining. Please upgrade your plan." };
      // }
    }
    
    try {
      const researchedInfoResult = await researchTopic({ topic: input.topic, userId: input.userId });
      if (researchedInfoResult.error) {
        return { error: `Research failed: ${researchedInfoResult.error}` };
      }
      const researchedInformation = researchedInfoResult.summary;

      const { output: promptOutput } = await generateTwitterPostsPrompt({
        ...input, 
        researchedInformation: researchedInformation
      });
      
      if (!promptOutput || !promptOutput.posts) {
        return { error: "AI failed to generate Twitter posts content." };
      }
      
      // Auth stubbed: Bypass credit deduction for MOCK_USER_ID
      // if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
      //   const userData = await getUserData(input.userId); // Re-fetch to be safe
      //   if (userData && userData.plan !== 'infinity') {
      //     await deductCredits(input.userId, 1);
      //   }
      // }

      return { posts: promptOutput.posts };

    } catch (e: any) {
      console.error("Error in generateTwitterPostsFlow:", e);
      return { error: e.message || "An unexpected error occurred during Twitter post generation." };
    }
  }
);
