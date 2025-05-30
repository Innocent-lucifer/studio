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
  summary: z.string().describe('A summary of the researched topic, incorporating insights from various sources including Twitter if available.'),
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
      twitterResults: z.string().describe('The results from searching Twitter. This could include tweets, "no results found", or error messages from the Twitter API.'),
    }),
  },
  output: { // Ensure this output schema matches ResearchTopicOutputSchema
    schema: ResearchTopicOutputSchema,
  },
  prompt: `You are an expert researcher. Your goal is to provide a comprehensive, engaging, and informative summary about the given topic. 
Integrate information from the provided Twitter results to add real-time context or recent discussions if available and relevant.
If Twitter results indicate an error or no relevant tweets, focus on providing a general summary based on your knowledge.

Topic: {{{topic}}}

Twitter Results: 
{{{twitterResults}}}

Based on all available information, provide a detailed summary of the topic:`,
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

  // Search Twitter using the tool
  const twitterSearchResults = await searchTwitter({ query: topic });

  const {output} = await researchTopicPrompt({
    topic: topic,
    twitterResults: twitterSearchResults,
  });

  // Check if the output or summary is missing or empty
  if (!output || !output.summary || output.summary.trim() === "") {
    console.warn(`Research topic flow for "${topic}" returned an empty or missing summary from the LLM. Using fallback summary.`);
    
    let fallbackSummary = `While a detailed AI-generated summary for "${topic}" could not be fully formed, `;
    
    if (twitterSearchResults && 
        !twitterSearchResults.toLowerCase().includes("error fetching") && 
        !twitterSearchResults.toLowerCase().includes("placeholder") &&
        !twitterSearchResults.toLowerCase().includes("no recent tweets found")) {
      fallbackSummary += `here's what was found on Twitter: "${twitterSearchResults}". `;
    } else if (twitterSearchResults && (twitterSearchResults.toLowerCase().includes("error") || twitterSearchResults.toLowerCase().includes("placeholder"))) {
      fallbackSummary += `there was an issue fetching detailed Twitter data: "${twitterSearchResults}". `;
    } else if (twitterSearchResults && twitterSearchResults.toLowerCase().includes("no recent tweets found")) {
      fallbackSummary += `no recent tweets were found for this topic. `;
    }
    fallbackSummary += `Social media posts will be generated based on the core topic. You can refine them further.`;
    
    return { summary: fallbackSummary };
  }

  return output; // output should conform to ResearchTopicOutputSchema
});
