
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
import { searchNews } from '@/ai/tools/searchNews'; // Import searchNews
import { checkAndIncrementUsage } from '@/lib/firebaseUserActions';

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
      newsResults: z.string().describe('The results from searching NewsAPI.ai. This could include article summaries, "no results found", or error messages.'), // Add newsResults
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the researched topic, incorporating insights from various sources including Twitter if available.'),
    }),
  },
  prompt: `You are an expert researcher. Your goal is to provide a comprehensive, engaging, and informative summary about the given topic. 
Integrate information from the provided real-time sources to add context about recent discussions and news.

Topic: {{{topic}}}

Recent News Articles:
"{{{newsResults}}}"

Recent Twitter Discussions:
"{{{twitterResults}}}"

Based on all available information (your general knowledge, recent news, and Twitter discussions), provide a detailed summary of the topic.
- Synthesize the key points, interesting angles, or recent developments from both the news and Twitter results.
- If a source indicates "No results found", "not configured", or an API error, state that fresh data from that source was not available for this topic and briefly explain why (e.g., "no specific recent tweets," "news search offline for this query"). Then, proceed to generate a summary based on the other available information and your general knowledge.
- Do not invent tweets or news if none were found. Your summary should be factual based on the information provided or your existing knowledge.
- Make the summary useful for someone wanting to create social media posts about the topic.

Summary:`,
});

const researchTopicFlow = ai.defineFlow(
  {
    name: 'researchTopicFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  }, 
  async (input) => {
    if (!input.userId) {
      return { summary: "", error: "User ID is required for this operation." };
    }
    const usageCheck = await checkAndIncrementUsage(input.userId);
    if (!usageCheck.canProceed) {
        return { summary: "", error: usageCheck.error };
    }

    const { topic, userId } = input;
    
    try {
      // Run searches in parallel
      const [twitterSearchResults, newsSearchResults] = await Promise.all([
        searchTwitter({ query: topic }),
        searchNews({ query: topic })
      ]);

      const {output: promptOutput} = await researchTopicPrompt({
        topic: topic,
        twitterResults: twitterSearchResults,
        newsResults: newsSearchResults, // Pass news results
      });

      if (!promptOutput || !promptOutput.summary || promptOutput.summary.trim() === "") {
        let fallbackSummary = `AI-generated summary for "${topic}" could not be fully formed. `;
        
        if (newsSearchResults && !newsSearchResults.toLowerCase().includes("error") && !newsSearchResults.toLowerCase().includes("not configured") && !newsSearchResults.toLowerCase().includes("no recent news")) {
          fallbackSummary += `However, recent news found: "${newsSearchResults.substring(0, 150)}...". `;
        }
        if (twitterSearchResults && !twitterSearchResults.toLowerCase().includes("error") && !twitterSearchResults.toLowerCase().includes("not configured") && !twitterSearchResults.toLowerCase().includes("no recent tweets")) {
          fallbackSummary += `However, Twitter search found: "${twitterSearchResults.substring(0, 150)}...". `;
        }
        fallbackSummary += `Please use this information or your own knowledge to proceed.`;
        
        return { summary: fallbackSummary }; 
      }
      return { summary: promptOutput.summary };

    } catch (e: any) {
      console.error("[researchTopicFlow] Error:", e);
      return { summary: "", error: e.message || "An unexpected error occurred during topic research." };
    }
});
