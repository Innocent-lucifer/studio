
'use server';
/**
 * @fileOverview Fetches or generates trending topics for a given platform and category.
 *
 * - fetchPlatformTrends - A function that handles fetching/generating trends.
 * - FetchPlatformTrendsInput - The input type for the function.
 * - FetchPlatformTrendsOutput - The return type for the function.
 * - Trend - Represents a single trend item.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import { searchTwitter } from '@/ai/tools/searchTwitter';
import { searchNews } from '@/ai/tools/searchNews'; // Import searchNews
import { checkTrialAndSubscription } from '@/lib/firebaseAdminActions';

const TrendSchema = z.object({
  id: z.string().describe('A unique identifier for the trend.'),
  title: z.string().describe('A concise, engaging title for the trend (max 10-15 words).'),
  description: z.string().describe('A brief (2-3 sentences) explanation of the trend, what it is, and why it\'s significant or gaining attention.'),
  platform: z.enum(['Twitter', 'LinkedIn']).describe('The platform this trend is associated with.'),
  category: z.string().describe('The category this trend falls under.'),
  hypeScore: z.number().min(0).max(100).describe('An estimated "hype score" from 0 (not hyped) to 100 (very hyped), based on perceived current discussion volume and impact.'),
  region: z.enum(['Global', 'Local']).default('Global').describe('The geographical region of the trend, defaults to Global.'),
});
export type Trend = z.infer<typeof TrendSchema>;

const FetchPlatformTrendsInputSchema = z.object({
  platform: z.enum(['Twitter', 'LinkedIn']).describe('The social media platform (Twitter or LinkedIn).'),
  category: z.string().describe('The category to find trends for (e.g., Tech, Finance, AI). If "All", consider general trends for the platform.'),
  userId: z.string().optional().describe('The ID of the user requesting the trends. Optional for now.'),
  numTrendsToGenerate: z.number().optional().default(12).describe('The desired number of trends to generate.'),
  region: z.enum(['Global', 'Local']).optional().default('Global').describe('The geographical region to fetch trends for.'),
});
export type FetchPlatformTrendsInput = z.infer<typeof FetchPlatformTrendsInputSchema>;

const FetchPlatformTrendsOutputSchema = z.object({
  trends: z.array(TrendSchema).optional().describe('An array of generated/fetched trends.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type FetchPlatformTrendsOutput = z.infer<typeof FetchPlatformTrendsOutputSchema>;

export async function fetchPlatformTrends(input: FetchPlatformTrendsInput): Promise<FetchPlatformTrendsOutput> {
  return fetchPlatformTrendsFlow(input);
}

const llmTrendOutputSchema = z.object({
    title: z.string().describe('A concise, engaging title for the trend (max 10-15 words). Avoid using the category name directly in the title unless absolutely necessary for clarity.'),
    description: z.string().describe('A brief (2-3 sentences) explanation of the trend, what it is, and why it\'s significant or gaining attention. Make it sound current and relevant.'),
    hypeScore: z.number().min(0).max(100).describe('An estimated "hype score" from 0 (not hyped) to 100 (very hyped), based on perceived current discussion volume and impact. Be realistic with the score.'),
});

const prompt = ai.definePrompt({
  name: 'fetchPlatformTrendsPrompt',
  input: {
    schema: z.object({
      platform: z.enum(['Twitter', 'LinkedIn']),
      category: z.string(),
      twitterSearchResults: z.string().optional().describe('Relevant recent tweets or search summary if the platform is Twitter.'),
      newsSearchResults: z.string().optional().describe('Relevant recent news articles from NewsAPI.ai.'),
      numTrendsToGenerate: z.number(),
      region: z.enum(['Global', 'Local']).optional(),
    }),
  },
  output: {
    schema: z.object({
      generatedTrends: z.array(llmTrendOutputSchema).describe('An array of generated trend objects, each containing title, description, and hypeScore.'),
    }),
  },
  prompt: `You are an expert Trend Analyst for social media. Your task is to identify and describe {{numTrendsToGenerate}} trending topics for the {{platform}} platform within the '{{category}}' category.
The user has requested trends for the '{{region}}' region. If the region is 'Local', assume the user's local region based on general context. If it is 'Global', provide worldwide trends.

If the category is "All", provide general trending topics for the {{platform}} for the specified region.

Use the following real-time data to inform your analysis. Prioritize trends that appear in both sources.

Recent News from NewsAPI.ai:
"{{{newsSearchResults}}}"

{{#if twitterSearchResults}}
Recent Discussions from Twitter:
"{{{twitterSearchResults}}}"
{{/if}}

If the real-time sources provide strong signals of specific trends (discussions, news, events), prioritize them. If the results are generic, indicate errors, or state "not configured", then generate trends based on your general knowledge of what's currently trending in the '{{category}}' on the specified platform.

For each trend, provide:
1.  title: A concise, engaging title (max 10-15 words, avoid directly repeating the category name).
2.  description: A brief explanation (2-3 sentences) of what it is and why it's gaining attention.
3.  hypeScore: An estimated "hype score" (0-100) reflecting current discussion volume and impact.

Generate exactly {{numTrendsToGenerate}} distinct trends. Ensure the output is a valid JSON object with a single key "generatedTrends", which is an array of objects.
Do not mention your sources directly in the trend descriptions.
If {{platform}} is Twitter, make trends sound like they'd appear on Twitter (e.g., concise, hashtags sometimes implied).
If {{platform}} is LinkedIn, make trends sound professional and business-oriented.
`,
  promptOptions: {
    temperature: 0.9,
  }
});

const fetchPlatformTrendsFlow = ai.defineFlow({
  name: 'fetchPlatformTrendsFlow',
  inputSchema: FetchPlatformTrendsInputSchema,
  outputSchema: FetchPlatformTrendsOutputSchema,
}, async (input) => {
    const { userId } = input;
    if (!userId) {
        return { error: "User not authenticated." };
    }
    const accessCheck = await checkTrialAndSubscription(userId);
    if (!accessCheck.canProceed) {
        return { error: accessCheck.error || "Access denied." };
    }

  let twitterSearchResults: string | undefined = undefined;
  let newsSearchResults: string | undefined = undefined;
  
  const regionQueryPart = input.region === 'Local' ? 'for my local region' : 'globally';
  const searchQuery = input.category === 'All' ? `trending topics ${regionQueryPart}` : `trending in ${input.category} ${regionQueryPart}`;

  const numToGenerate = input.category === 'All' ? 18 : input.numTrendsToGenerate;

  try {
    const promises = [searchNews({ query: searchQuery })];
    if (input.platform === 'Twitter') {
      promises.push(searchTwitter({ query: searchQuery }));
    }

    const [newsResults, twitterResults] = await Promise.all(promises);
    newsSearchResults = newsResults;
    if (input.platform === 'Twitter') {
      twitterSearchResults = twitterResults;
    }

    const promptInput = {
      platform: input.platform,
      category: input.category,
      twitterSearchResults: twitterSearchResults,
      newsSearchResults: newsSearchResults,
      numTrendsToGenerate: numToGenerate,
      region: input.region,
    };

    const { output: promptOutput, usage } = await prompt(promptInput);

    if (!promptOutput || !promptOutput.generatedTrends || promptOutput.generatedTrends.length === 0) {
      const errorMessage = `AI returned no trends for ${input.platform}, category "${input.category}". The model might not have found relevant topics or there was an issue with its response structure.`;
      return { trends: [], error: errorMessage };
    }

    const trends: Trend[] = promptOutput.generatedTrends.map((t, index) => ({
      ...t,
      id: `${input.platform}-${input.category}-${index}-${Date.now()}`,
      platform: input.platform,
      category: input.category,
      region: input.region || 'Global',
    }));
    
    return { trends };

  } catch (e: any) {
    console.error(`[fetchPlatformTrendsFlow] Exception during trend generation for ${input.platform}, category "${input.category}":`, e);
    let detailedErrorMessage = e.message || `An unexpected error occurred while generating trends.`;
    if (e.data?.error?.message) {
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    }
    return { error: detailedErrorMessage };
  }
});
