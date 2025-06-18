
'use server';
/**
 * @fileOverview A LinkedIn post generator AI agent.
 *
 * - generateLinkedInPosts - A function that handles the LinkedIn post generation process.
 * - GenerateLinkedInPostsInput - The input type for the generateLinkedInPosts function.
 * - GenerateLinkedInPostsOutput - The return type for the generateLinkedInPosts function.
 */

import {ai} from '@/ai/ai-instance';
import {z}from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";
// import { getUserData, deductCredits, CREDIT_COSTS, CreditTransactionType } from '@/lib/firebaseUserActions'; 

const GenerateLinkedInPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate LinkedIn posts about. This might be a simple topic string or a more detailed researched summary.'),
  topicDisplay: z.string().optional().describe('The original, user-facing topic string, used for display and context if the main "topic" field contains a lengthy research summary.'),
  numPosts: z.number().describe('The number of LinkedIn posts to generate.'),
  userId: z.string().optional().describe('The ID of the user requesting the posts. Optional for now, to support guest users or scenarios where credits are not deducted.'),
});
export type GenerateLinkedInPostsInput = z.infer<typeof GenerateLinkedInPostsInputSchema>;

const GenerateLinkedInPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('The generated LinkedIn posts.').optional(),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateLinkedInPostsOutput = z.infer<typeof GenerateLinkedInPostsOutputSchema>;

export async function generateLinkedInPosts(input: GenerateLinkedInPostsInput): Promise<GenerateLinkedInPostsOutput> {
  return generateLinkedInPostsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLinkedInPostsPrompt',
  input: {
    schema: z.object({
      topicForAI: z.string().describe('The topic or researched information to generate LinkedIn posts about.'),
      displayTopic: z.string().describe('The original user-facing topic, for context in the prompt.'),
      numPosts: z.number().describe('The number of LinkedIn posts to generate.'),
      // researchedInformation: z.string().describe('The researched information about the topic.'), // Now part of topicForAI
      postNumbers: z.array(z.number()).describe('The numbers of the posts to generate')
    }),
  },
  output: {
    schema: z.object({ // Output from LLM direct
      posts: z.array(z.string()).describe('The generated LinkedIn posts.'),
    }),
  },
  prompt: `You are an expert social media manager specializing in generating LinkedIn posts. 🚀

You will generate {{numPosts}} LinkedIn posts about the following topic: "{{displayTopic}}".
Use the detailed researched information provided below as the primary source for generating varied and insightful posts.
The posts should be professional in tone and targeted toward a business audience. 💼 Incorporate emojis to make them more engaging and human-like.
**Crucially, if the "Researched Information" contains any signals of recent events, timeliness, or specific details from live data (e.g., from Twitter search), ensure your posts reflect this up-to-date context.**

Researched Information:
{{{topicForAI}}}

Here are the posts:

{{#each postNumbers}}
Post {{this}}:
{{/each}}`,
  promptOptions: {
    temperature: 0.7,
  },
});

const generateLinkedInPostsFlow = ai.defineFlow(
  {
    name: 'generateLinkedInPostsFlow',
    inputSchema: GenerateLinkedInPostsInputSchema,
    outputSchema: GenerateLinkedInPostsOutputSchema,
  },
  async (input) => {
    // console.log(`[generateLinkedInPostsFlow] User: ${input.userId || 'Guest'}, Topic: ${input.topicDisplay || input.topic}`);
    // if (input.userId) { // Credit check temporarily disabled
    //   const userData = await getUserData(input.userId);
    //   if (!userData) {
    //     return { error: "User data not found. Cannot generate posts." };
    //   }
    //   if (userData.plan !== 'infinity' && (userData.credits || 0) < CREDIT_COSTS.QUICK_POST_GENERATION) {
    //     return { error: `Insufficient credits. Need ${CREDIT_COSTS.QUICK_POST_GENERATION}, have ${userData.credits || 0}.` };
    //   }
    // }

    const range = (numPosts: number) => {
      const arr = [];
      for (let i = 1; i <= numPosts; i++) {
        arr.push(i);
      }
      return arr;
    };

    try {
      // The 'input.topic' might already be researched content if coming from Trend Explorer or Smart Campaign.
      // If it's a simple topic string, research it.
      let researchedInformation = input.topic;
      // Heuristic: if topic is short and no topicDisplay, assume it needs research.
      // If topicDisplay is present, input.topic is likely already researched.
      if ((!input.topicDisplay && input.topic.length < 100) || (input.topicDisplay && input.topic.length < 100 && input.topic === input.topicDisplay)) {
         console.log(`[generateLinkedInPostsFlow] Short topic detected, performing research for: "${input.topic}"`);
         const researchedInfoResult = await researchTopic({topic: input.topic, userId: input.userId}); // Pass userId for potential future use in research
         if (researchedInfoResult.error) {
           // Proceed with the original topic if research fails, but log it
           console.warn(`[generateLinkedInPostsFlow] Research failed: ${researchedInfoResult.error}. Proceeding with basic topic.`);
           researchedInformation = input.topic; // Fallback to original topic
         } else {
           researchedInformation = researchedInfoResult.summary;
         }
      }


      const postNumbers = range(input.numPosts);
      const {output: promptOutput} = await prompt({
        topicForAI: researchedInformation, 
        displayTopic: input.topicDisplay || input.topic,
        numPosts: input.numPosts,
        postNumbers
      });

      if (!promptOutput || !promptOutput.posts) {
        return { error: "AI failed to generate LinkedIn posts content." };
      }
      
      // if (input.userId) { // Credit deduction temporarily disabled
      //   const deductionResult = await deductCredits(
      //     input.userId,
      //     CREDIT_COSTS.QUICK_POST_GENERATION,
      //     `Generated LinkedIn posts for topic: ${input.topicDisplay || input.topic}`,
      //     CreditTransactionType.FEATURE_USE_QUICK_POST,
      //     'generateLinkedInPostsFlow'
      //   );
      //   if (!deductionResult.success) {
      //     // Log error but still return posts if generated, as it's a post-operation deduction attempt
      //     console.error(`[generateLinkedInPostsFlow] Credit deduction failed for user ${input.userId}: ${deductionResult.error}`);
      //     // Potentially return a partial success message or specific error to user here
      //   }
      // }
      
      return { posts: promptOutput.posts };

    } catch (e: any) {
      console.error("[generateLinkedInPostsFlow] Error:", e);
      return { error: e.message || "An unexpected error occurred during LinkedIn post generation." };
    }
  }
);

    