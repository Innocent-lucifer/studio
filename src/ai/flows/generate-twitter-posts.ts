
'use server';
/**
 * @fileOverview Generates multiple Twitter posts based on a researched topic with varying tones and angles.
 *
 * - generateTwitterPosts - A function that generates Twitter posts.
 * - GenerateTwitterPostsInput - The input type for the generateTwitterPosts function.
 * - GenerateTwitterPostsOutput - The return type for the generateTwitterPosts function.
 */

import {ai} from '@/ai/ai-instance';
import {z}from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";
// import { getUserData, deductCredits, CREDIT_COSTS, CreditTransactionType } from '@/lib/firebaseUserActions';

const GenerateTwitterPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate Twitter posts about. This might be a simple topic string or a more detailed researched summary.'),
  topicDisplay: z.string().optional().describe('The original, user-facing topic string, used for display and context if the main "topic" field contains a lengthy research summary.'),
  numPosts: z.number().describe('The number of Twitter posts to generate.'),
  userId: z.string().optional().describe('The ID of the user requesting the posts. Optional for now, to support guest users or scenarios where credits are not deducted.'),
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
      topicForAI: z.string().describe('The topic or researched information to generate Twitter posts about.'),
      displayTopic: z.string().describe('The original user-facing topic, for context in the prompt.'),
      numPosts: z.number().describe('The number of Twitter posts to generate.'),
      // researchedInformation: z.string().describe('The researched information about the topic.'), // Now part of topicForAI
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
Your task is to generate {{numPosts}} Twitter posts about the following topic: "{{displayTopic}}".
Use the detailed researched information provided below as the primary source for generating varied and engaging posts.
The posts should be:
- Cool and punchy
- Use an open, conversational, and human-like tone
- Engaging, shareable, and attention-grabbing
- Witty and concise
- Feel free to use relevant slang or a bit of humor if appropriate for the topic, but keep it generally respectful.
- Incorporate emojis to make them more engaging.
**Crucially, if the "Researched Information" contains any signals of recent events, timeliness, or specific details from live data (e.g., from Twitter search), ensure your posts reflect this up-to-date context.**

Researched Information:
{{{topicForAI}}}

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
    // console.log(`[generateTwitterPostsFlow] User: ${input.userId || 'Guest'}, Topic: ${input.topicDisplay || input.topic}`);
    // if (input.userId) { // Credit check temporarily disabled
    //   const userData = await getUserData(input.userId);
    //   if (!userData) {
    //     return { error: "User data not found. Cannot generate posts." };
    //   }
    //   if (userData.plan !== 'infinity' && (userData.credits || 0) < CREDIT_COSTS.QUICK_POST_GENERATION) {
    //     return { error: `Insufficient credits. Need ${CREDIT_COSTS.QUICK_POST_GENERATION}, have ${userData.credits || 0}.` };
    //   }
    // }
    
    try {
      let researchedInformation = input.topic;
      if ((!input.topicDisplay && input.topic.length < 100) || (input.topicDisplay && input.topic.length < 100 && input.topic === input.topicDisplay)) {
        console.log(`[generateTwitterPostsFlow] Short topic detected, performing research for: "${input.topic}"`);
        const researchedInfoResult = await researchTopic({ topic: input.topic, userId: input.userId });
        if (researchedInfoResult.error) {
          console.warn(`[generateTwitterPostsFlow] Research failed: ${researchedInfoResult.error}. Proceeding with basic topic.`);
          researchedInformation = input.topic; 
        } else {
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
      
      // if (input.userId) { // Credit deduction temporarily disabled
      //   const deductionResult = await deductCredits(
      //     input.userId,
      //     CREDIT_COSTS.QUICK_POST_GENERATION,
      //     `Generated Twitter posts for topic: ${input.topicDisplay || input.topic}`,
      //     CreditTransactionType.FEATURE_USE_QUICK_POST,
      //     'generateTwitterPostsFlow'
      //   );
      //   if (!deductionResult.success) {
      //     console.error(`[generateTwitterPostsFlow] Credit deduction failed for user ${input.userId}: ${deductionResult.error}`);
      //   }
      // }

      return { posts: promptOutput.posts };

    } catch (e: any) {
      console.error("[generateTwitterPostsFlow] Error:", e);
      return { error: e.message || "An unexpected error occurred during Twitter post generation." };
    }
  }
);

    