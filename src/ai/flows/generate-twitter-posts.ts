
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

const GenerateTwitterPostsInputSchema = z.object({
  topic: z.string().describe('The topic to generate Twitter posts about.'),
  numPosts: z.number().describe('The number of Twitter posts to generate.'),
});
export type GenerateTwitterPostsInput = z.infer<typeof GenerateTwitterPostsInputSchema>;

const GenerateTwitterPostsOutputSchema = z.object({
  posts: z.array(
    z.string().describe('A generated Twitter post.')
  ).describe('The list of generated Twitter posts.')
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
  output: {
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
    temperature: 0.8, // Slightly higher temperature for more creative/human-like tweets
  },
});

const generateTwitterPostsFlow = ai.defineFlow<
  typeof GenerateTwitterPostsInputSchema,
  typeof GenerateTwitterPostsOutputSchema
>({
  name: 'generateTwitterPostsFlow',
  inputSchema: GenerateTwitterPostsInputSchema,
  outputSchema: GenerateTwitterPostsOutputSchema,
},
async input => {
  const researchedInformation = await researchTopic({topic: input.topic});
  const { output } = await generateTwitterPostsPrompt({...input, researchedInformation: researchedInformation.summary});
  return output!;
}
);

