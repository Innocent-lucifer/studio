'use server';

/**
 * @fileOverview This file defines a Genkit flow for researching a given topic and summarizing key information.
 *
 * - researchTopic - A function that takes a topic as input and returns a summary of researched information.
 * - ResearchTopicInput - The input type for the researchTopic function, which is a topic string.
 * - ResearchTopicOutput - The output type for the researchTopic function, which is a summary string.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { searchTwitter } from '@/ai/tools/searchTwitter';

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
});
export type ResearchTopicInput = z.infer<typeof ResearchTopicInputSchema>;

const ResearchTopicOutputSchema = z.object({
  summary: z.string().describe('A summary of the researched topic.'),
});
export type ResearchTopicOutput = z.infer<typeof ResearchTopicOutputSchema>;

export async function researchTopic(input: ResearchTopicInput): Promise<ResearchTopicOutput> {
  return researchTopicFlow(input);
}

const researchTopicPrompt = ai.definePrompt({
  name: 'researchTopicPrompt',
  input: {
    schema: z.object({
      topic: z.string().describe('The topic to research.'),
      twitterResults: z.string().describe('The results from searching Twitter.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the researched topic.'),
    }),
  },
  prompt: `You are an expert researcher. Please research the following topic and provide a detailed summary, incorporating information from Twitter:\n\nTopic: {{{topic}}}\n\nTwitter Results: {{{twitterResults}}}`,
});

const researchTopicFlow = ai.defineFlow<
  typeof ResearchTopicInputSchema,
  typeof ResearchTopicOutputSchema
>({
  name: 'researchTopicFlow',
  inputSchema: ResearchTopicInputSchema,
  outputSchema: ResearchTopicOutputSchema,
}, async (input) => {
  const { topic } = input;

  // Search Twitter and LinkedIn using the new tools
  const twitterResults = await searchTwitter({ query: topic });

  const {output} = await researchTopicPrompt({
    topic: topic,
    twitterResults: twitterResults
  });
  return output!;
});
