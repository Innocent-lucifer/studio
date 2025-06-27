
'use server';
/**
 * @fileOverview A LinkedIn post generator AI agent.
 *
 * - generateLinkedInPosts - A function that handles the LinkedIn post generation process.
 * - GenerateLinkedInPostsInput - The input type for the generateLinkedInPosts function.
 * - GenerateLinkedInPostsOutput - The return type for the generateLinkedInPosts function.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import {researchTopic} from "@/ai/flows/research-topic";

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
      postNumbers: z.array(z.number()).describe('The numbers of the posts to generate')
    }),
  },
  output: {
    schema: z.object({ // Output from LLM direct
      posts: z.array(z.string()).describe('The generated LinkedIn posts.'),
    }),
  },
  prompt: `You are an expert ghostwriter and thought leader, specializing in LinkedIn content that is both professional and deeply human. Your writing is emotionally intelligent and completely undetectable as AI. 🚀

You will generate {{numPosts}} LinkedIn posts about the following topic: "{{displayTopic}}".
Use the detailed researched information provided below as your primary source.
The posts MUST sound like they were written by a real, insightful professional. They should have a natural, conversational, yet authoritative tone.
- Be professional, but avoid corporate jargon. Write with clarity and emotional intelligence.
- Target a business audience with valuable insights.
- Incorporate emojis tastefully to make posts more engaging and human.
- The posts must be indistinguishable from content written by a human expert.
**Crucially, if the "Researched Information" contains any signals of recent events, timeliness, or specific details from live data (e.g., from Twitter search), ensure your posts reflect this up-to-date context.**

Researched Information:
{{{topicForAI}}}

Here are the posts:

{{#each postNumbers}}
Post {{this}}:
{{/each}}`,
  promptOptions: {
    temperature: 1.0,
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const generateLinkedInPostsFlow = ai.defineFlow(
  {
    name: 'generateLinkedInPostsFlow',
    inputSchema: GenerateLinkedInPostsInputSchema,
    outputSchema: GenerateLinkedInPostsOutputSchema,
  },
  async (input) => {
    if (!input.userId) {
      return { error: "User ID is required for this operation." };
    }

    try {
      let researchedInformation = input.topic;
      if (((!input.topicDisplay && input.topic.length < 100) || (input.topicDisplay && input.topic.length < 100 && input.topic === input.topicDisplay))) {
         const researchedInfoResult = await researchTopic({topic: input.topic, userId: input.userId});
         if (researchedInfoResult.error) {
           researchedInformation = input.topic;
         } else {
           researchedInformation = researchedInfoResult.summary;
         }
      }

      const range = (numPosts: number) => {
        const arr = [];
        for (let i = 1; i <= numPosts; i++) {
          arr.push(i);
        }
        return arr;
      };

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
      
      return { 
        posts: promptOutput.posts,
      };

    } catch (e: any) {
      console.error("[generateLinkedInPostsFlow] Error:", e);
      return { error: e.message || "An unexpected error occurred during LinkedIn post generation." };
    }
  }
);
