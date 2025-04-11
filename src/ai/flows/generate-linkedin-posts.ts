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

const GenerateLinkedInPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate LinkedIn posts about.'),
  numPosts: z.number().describe('The number of LinkedIn posts to generate.'),
});
export type GenerateLinkedInPostsInput = z.infer<typeof GenerateLinkedInPostsInputSchema>;

const GenerateLinkedInPostsOutputSchema = z.object({
  posts: z.array(z.string()).describe('The generated LinkedIn posts.'),
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
    schema: z.object({
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

const generateLinkedInPostsFlow = ai.defineFlow<
  typeof GenerateLinkedInPostsInputSchema,
  typeof GenerateLinkedInPostsOutputSchema
>({
  name: 'generateLinkedInPostsFlow',
  inputSchema: GenerateLinkedInPostsInputSchema,
  outputSchema: GenerateLinkedInPostsOutputSchema,
},
async input => {
  const range = (numPosts: number) => {
    const arr = [];
    for (let i = 1; i <= numPosts; i++) {
      arr.push(i);
    }
    return arr;
  };

  const researchedInformation = await researchTopic({topic: input.topic});
  const postNumbers = range(input.numPosts);
  const {output} = await prompt({...input, researchedInformation: researchedInformation.summary, postNumbers});
  return output!;
});
