'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {TwitterApi} from 'twitter-api-v2';

const SearchTwitterInputSchema = z.object({
  query: z.string().describe('The search query for Twitter.'),
});

const SearchTwitterOutputSchema = z.string().describe('The search results from Twitter.');

export async function searchTwitter(input: { query: string }): Promise<string> {
  const apiKey = process.env.TWITTER_API_KEY || "ZPdUr3W0U8Ye2WupiBE4Ug8WD";
  const apiKeySecret = process.env.TWITTER_API_KEY_SECRET || "pHCFxryOPkPHr4O3QgdJGVmOXC2ji2ETX9PayEehS7eGwnyhOg";

  if (!apiKey || !apiKeySecret) {
    console.warn("Twitter API key and secret not found in environment variables. Using placeholder values.");
  }

  try {
    const twitterClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiKeySecret,
    });

    // Search for tweets
    const response = await twitterClient.v2.searchRecent(input.query, {
      max_results: 10,
    });

    // Extract tweets and join them into a single string
    const tweets = response.data.map((tweet: any) => tweet.text).join('\n');
    return tweets;
  } catch (error: any) {
    console.error('Error searching Twitter:', error);
    return `Error searching Twitter: ${error.message || 'Unknown error'}`;
  }
}

ai.defineTool({
    name: 'searchTwitter',
    description: 'Searches Twitter for recent tweets related to a given query.',
    inputSchema: SearchTwitterInputSchema,
    outputSchema: SearchTwitterOutputSchema,
  },
  async input => {
    const result = await searchTwitter(input);
    return result;
  }
);

// Install twitter-api-v2 by running npm install twitter-api-v2
