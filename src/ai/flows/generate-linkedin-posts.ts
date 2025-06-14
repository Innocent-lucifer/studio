
'use server';
/**
 * @fileOverview A LinkedIn post generator AI agent.
 *
 * - generateLinkedInPosts - A function that handles the LinkedIn post generation process.
 * - GenerateLinkedInPostsInput - The input type for the generateLinkedInPosts function.
 * - GenerateLinkedInPostsOutput - The return type for the generateLinkedInPosts function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";
// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed

const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

const GenerateLinkedInPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate LinkedIn posts about.'),
  numPosts: z.number().describe('The number of LinkedIn posts to generate.'),
  userId: z.string().describe('The ID of the user requesting the posts.'),
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
      topic: z.string().describe('The topic to generate LinkedIn posts about.'),
      numPosts: z.number().describe('The number of LinkedIn posts to generate.'),
      researchedInformation: z.string().describe('The researched information about the topic.'),
      postNumbers: z.array(z.number()).describe('The numbers of the posts to generate')
    }),
  },
  output: {
    schema: z.object({ // Output from LLM direct
      posts: z.array(z.string()).describe('The generated LinkedIn posts.'),
    }),
  },
  prompt: `You are an expert social media manager specializing in generating LinkedIn posts. 🚀

You will generate {{numPosts}} LinkedIn posts about the following topic, with varying tones and angles, incorporating emojis to make them more engaging and human-like. The posts should be professional in tone and targeted toward a business audience. 💼

Topic: {{{topic}}}

Researched Information: {{{researchedInformation}}}

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
    // Auth stubbed: Bypass credit check and deduction for MOCK_USER_ID
    if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
        // This block would contain real credit check logic if auth were active
        // const userData = await getUserData(input.userId);
        // if (!userData) return { error: "User data not found." };
        // if (userData.plan !== 'infinity' && (userData.credits || 0) <= 0) {
        //   return { error: "You have no credits remaining. Please upgrade your plan." };
        // }
    }

    const range = (numPosts: number) => {
      const arr = [];
      for (let i = 1; i <= numPosts; i++) {
        arr.push(i);
      }
      return arr;
    };

    try {
      const researchedInfoResult = await researchTopic({topic: input.topic, userId: input.userId});
      if (researchedInfoResult.error) {
        return { error: `Research failed: ${researchedInfoResult.error}` };
      }
      const researchedInformation = researchedInfoResult.summary;


      const postNumbers = range(input.numPosts);
      const {output: promptOutput} = await prompt({
        ...input, 
        researchedInformation: researchedInformation, 
        postNumbers
      });

      if (!promptOutput || !promptOutput.posts) {
        return { error: "AI failed to generate LinkedIn posts content." };
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
      console.error("Error in generateLinkedInPostsFlow:", e);
      return { error: e.message || "An unexpected error occurred during LinkedIn post generation." };
    }
  }
);
