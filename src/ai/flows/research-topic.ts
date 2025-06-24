
'use server';

/**
 * @fileOverview This file defines a Genkit flow for researching a given topic and summarizing key information.
 *
 * - researchTopic - A function that takes a topic as input and returns a summary of researched information.
 * - ResearchTopicInput - The input type for the researchTopic function, which is a topic string.
 * - ResearchTopicOutput - The output type for the researchTopic function, which is a summary string.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import { searchTwitter } from '@/ai/tools/searchTwitter';

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
  userId: z.string().optional().describe('The ID of the user requesting the research. Optional for now.'),
});
export type ResearchTopicInput = z.infer<typeof ResearchTopicInputSchema>;

const ResearchTopicOutputSchema = z.object({
  summary: z.string().describe('A summary of the researched topic, incorporating insights from various sources including Twitter if available.'),
  error: z.string().optional().describe('An error message if research failed.'),
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
      twitterResults: z.string().describe('The results from searching Twitter. This could include tweets, "no results found", or error messages from the Twitter API, including if search is unconfigured.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the researched topic, incorporating insights from various sources including Twitter if available.'),
    }),
  },
  prompt: `You are an expert researcher. Your goal is to provide a comprehensive, engaging, and informative summary about the given topic. 
Integrate information from the provided Twitter results to add real-time context or recent discussions.

Topic: {{{topic}}}

Twitter Search Results:
"{{{twitterResults}}}"

Based on all available information, provide a detailed summary of the topic.
- If the Twitter Results show actual tweets or clear trend indications, synthesize them into your summary.
- If Twitter Results indicate "No recent tweets found", "Twitter search functionality is not configured", or an API error, state that fresh Twitter data was not available for this topic and briefly explain why (e.g., "no specific recent tweets," "Twitter search offline for this query"). Then, proceed to generate a summary based on your general knowledge.
- Do not invent tweets if none were found. Your summary should be factual based on the information provided or your existing knowledge.
- Make the summary useful for someone wanting to create social media posts about the topic. Highlight key points, interesting angles, or recent developments if found.
- The summary should be a well-structured paragraph or a few paragraphs.

Summary:`,
});

const researchTopicFlow = ai.defineFlow(
  {
    name: 'researchTopicFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  }, 
  async (input) => {
    const { topic, userId } = input;
    
    try {
      const twitterSearchResults = await searchTwitter({ query: topic });

      const {output: promptOutput} = await researchTopicPrompt({
        topic: topic,
        twitterResults: twitterSearchResults,
      });

      if (!promptOutput || !promptOutput.summary || promptOutput.summary.trim() === "") {
        let fallbackSummary = `AI-generated summary for "${topic}" could not be fully formed. `;
        
        if (twitterSearchResults && 
            !twitterSearchResults.toLowerCase().includes("error fetching") && 
            !twitterSearchResults.toLowerCase().includes("placeholder") &&
            !twitterSearchResults.toLowerCase().includes("no recent tweets found") &&
            !twitterSearchResults.toLowerCase().includes("not configured")) {
          fallbackSummary += `However, Twitter search found: "${twitterSearchResults.substring(0, 200)}...". `;
        } else if (twitterSearchResults && (twitterSearchResults.toLowerCase().includes("error") || twitterSearchResults.toLowerCase().includes("placeholder") || twitterSearchResults.toLowerCase().includes("not configured"))) {
          fallbackSummary += `There was an issue fetching/accessing live Twitter data: "${twitterSearchResults}". `;
        } else if (twitterSearchResults && twitterSearchResults.toLowerCase().includes("no recent tweets found")) {
          fallbackSummary += `No recent tweets were found for this topic. `;
        }
        fallbackSummary += `Please use this information or your own knowledge to proceed. Content generation will use the original topic if this summary is insufficient.`;
        
        return { summary: fallbackSummary }; 
      }
      return { summary: promptOutput.summary };

    } catch (e: any) {
      console.error("[researchTopicFlow] Error:", e);
      return { summary: "", error: e.message || "An unexpected error occurred during topic research." };
    }
});
