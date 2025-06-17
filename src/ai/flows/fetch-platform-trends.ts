
'use server';
/**
 * @fileOverview Fetches or generates trending topics for a given platform and category.
 *
 * - fetchPlatformTrends - A function that handles fetching/generating trends.
 * - FetchPlatformTrendsInput - The input type for the function.
 * - FetchPlatformTrendsOutput - The return type for the function.
 * - Trend - Represents a single trend item.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { searchTwitter } from '@/ai/tools/searchTwitter';
// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed for now

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
  userId: z.string().describe('The ID of the user requesting the trends.'),
  numTrendsToGenerate: z.number().optional().default(6).describe('The desired number of trends to generate.'),
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
      twitterSearchResults: z.string().optional().describe('Relevant recent tweets or search summary if the platform is Twitter. This may contain "No recent tweets found" or API error messages. Use this as primary context for Twitter trends if available and relevant. If it indicates errors or no useful data, rely more on general knowledge for the category.'),
      numTrendsToGenerate: z.number(),
    }),
  },
  output: {
    schema: z.object({
      generatedTrends: z.array(llmTrendOutputSchema).describe('An array of generated trend objects, each containing title, description, and hypeScore.'),
    }),
  },
  prompt: `You are an expert Trend Analyst for social media. Your task is to identify and describe {{numTrendsToGenerate}} trending topics for the {{platform}} platform within the '{{category}}' category.
If the category is "All", provide general trending topics for the {{platform}}.

{{#if twitterSearchResults}}
For Twitter, first consider these recent search results:
"{{{twitterSearchResults}}}"
If these results provide strong signals of specific trends (discussions, news, events), prioritize them. If the results are generic, indicate "no specific tweets found", or show an error, then generate trends based on your general knowledge of what's currently trending in the '{{category}}' on Twitter.
{{/if}}

For LinkedIn, focus on professionally relevant topics, industry news, career discussions, or significant business events within the '{{category}}'.

For each trend, provide:
1.  title: A concise, engaging title (max 10-15 words, avoid directly repeating the category name).
2.  description: A brief explanation (2-3 sentences) of what it is and why it's gaining attention.
3.  hypeScore: An estimated "hype score" (0-100) reflecting current discussion volume and impact.

Generate exactly {{numTrendsToGenerate}} distinct trends. Ensure the output is a valid JSON object with a single key "generatedTrends", which is an array of objects.
Example for a single trend object:
{
  "title": "AI in Creative Industries",
  "description": "Artists and designers are exploring AI tools for content creation, sparking debates about ethics and the future of creative work. New AI models are enabling novel forms of art and design.",
  "hypeScore": 85
}

Do not mention your sources or the Twitter search results directly in the trend descriptions.
If {{platform}} is Twitter, make trends sound like they'd appear on Twitter (e.g., concise, hashtags sometimes implied).
If {{platform}} is LinkedIn, make trends sound professional and business-oriented.
`,
  promptOptions: {
    temperature: 0.7,
  }
});

const fetchPlatformTrendsFlow = ai.defineFlow({
  name: 'fetchPlatformTrendsFlow',
  inputSchema: FetchPlatformTrendsInputSchema,
  outputSchema: FetchPlatformTrendsOutputSchema,
}, async (input) => {
  console.log(`[fetchPlatformTrendsFlow] Starting for platform: ${input.platform}, category: "${input.category}" for user: ${input.userId}`);
  // Auth Logic:
  // const userData = await getUserData(input.userId);
  // if (!userData) return { error: "User data not found." };
  // if (userData.plan !== 'infinity' && (userData.credits || 0) <= 0) {
  //   return { error: "You have no credits remaining. Please upgrade your plan." };
  // }

  let twitterSearchResults: string | undefined = undefined;

  try {
    if (input.platform === 'Twitter') {
      const searchQuery = input.category === 'All' ? 'trending topics' : `trending in ${input.category}`;
      console.log(`[fetchPlatformTrendsFlow] Searching Twitter with query: "${searchQuery}"`);
      twitterSearchResults = await searchTwitter({ query: searchQuery });
      console.log(`[fetchPlatformTrendsFlow] Twitter search results for "${searchQuery}": ${twitterSearchResults.substring(0, 200)}...`);
    }

    const promptInput = {
      platform: input.platform,
      category: input.category,
      twitterSearchResults: twitterSearchResults,
      numTrendsToGenerate: input.numTrendsToGenerate,
    };

    console.log('[fetchPlatformTrendsFlow] Calling AI prompt with input:', JSON.stringify(promptInput, null, 2));
    const { output: promptOutput, usage } = await prompt(promptInput);

    console.log('[fetchPlatformTrendsFlow] Raw AI output:', JSON.stringify(promptOutput, null, 2));
    console.log('[fetchPlatformTrendsFlow] Usage data:', JSON.stringify(usage, null, 2));

    if (!promptOutput || !promptOutput.generatedTrends || promptOutput.generatedTrends.length === 0) {
      const errorMessage = `AI returned no trends for ${input.platform}, category "${input.category}". The model might not have found relevant topics or there was an issue with its response structure.`;
      console.warn(`[fetchPlatformTrendsFlow] Warning: ${errorMessage}. Raw AI output:`, JSON.stringify(promptOutput, null, 2));
      return { trends: [], error: errorMessage }; // Return empty array with error for user feedback
    }

    const trends: Trend[] = promptOutput.generatedTrends.map((t, index) => ({
      ...t,
      id: `${input.platform}-${input.category}-${index}-${Date.now()}`, // Simple unique ID
      platform: input.platform,
      category: input.category, // Assign the input category
      region: 'Global', // Default to Global for now
    }));

    // Auth logic:
    // if (userData.plan !== 'infinity') {
    //   await deductCredits(input.userId, 1); // Or appropriate credit deduction
    // }

    console.log(`[fetchPlatformTrendsFlow] Successfully generated ${trends.length} trends for ${input.platform}, category "${input.category}".`);
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
