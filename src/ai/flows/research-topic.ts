
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
// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed

const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

const ResearchTopicInputSchema = z.object({
  topic: z.string().describe('The topic to research.'),
  userId: z.string().describe('The ID of the user requesting the research.'),
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
      twitterResults: z.string().describe('The results from searching Twitter. This could include tweets, "no results found", or error messages from the Twitter API.'),
    }),
  },
  output: { // Ensure this output schema matches ResearchTopicOutputSchema, minus error
    schema: z.object({
      summary: z.string().describe('A summary of the researched topic, incorporating insights from various sources including Twitter if available.'),
    }),
  },
  prompt: `You are an expert researcher. Your goal is to provide a comprehensive, engaging, and informative summary about the given topic. 
Integrate information from the provided Twitter results to add real-time context or recent discussions if available and relevant.
If Twitter results indicate an error or no relevant tweets, focus on providing a general summary based on your knowledge.

Topic: {{{topic}}}

Twitter Results: 
{{{twitterResults}}}

Based on all available information, provide a detailed summary of the topic:`,
});

const researchTopicFlow = ai.defineFlow(
  {
    name: 'researchTopicFlow',
    inputSchema: ResearchTopicInputSchema,
    outputSchema: ResearchTopicOutputSchema,
  }, 
  async (input) => {
    const { topic, userId } = input;

    // Auth stubbed: Bypass credit check for MOCK_USER_ID
    if (userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
        // This block would contain real credit check logic if auth were active
        // const userData = await getUserData(userId);
        // if (!userData) return { summary: "", error: "User data not found." };
        // if (userData.plan !== 'infinity' && (userData.credits || 0) <= 0) {
        //   return { summary: "", error: "You have no credits remaining. Please upgrade your plan." };
        // }
    }

    try {
      const twitterSearchResults = await searchTwitter({ query: topic });

      const {output: promptOutput} = await researchTopicPrompt({
        topic: topic,
        twitterResults: twitterSearchResults,
      });

      if (!promptOutput || !promptOutput.summary || promptOutput.summary.trim() === "") {
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
        
        return { summary: fallbackSummary }; // No error property if it's a fallback summary
      }

      // Auth stubbed: Bypass credit deduction for MOCK_USER_ID
      // if (userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
      //   const userData = await getUserData(userId); // Re-fetch to be safe
      //   if (userData && userData.plan !== 'infinity') {
      //     await deductCredits(userId, 1); // Assuming research also costs 1 credit
      //   }
      // }

      return { summary: promptOutput.summary };

    } catch (e: any) {
      console.error("Error in researchTopicFlow:", e);
      return { summary: "", error: e.message || "An unexpected error occurred during topic research." };
    }
});
