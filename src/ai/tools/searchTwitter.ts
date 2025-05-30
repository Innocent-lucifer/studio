
'use server';

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Dynamic import for TwitterApi will be used inside the function to potentially mitigate initialization issues.

const SearchTwitterInputSchema = z.object({
  query: z.string().describe('The search query for Twitter.'),
});

const SearchTwitterOutputSchema = z.string().describe('The search results from Twitter.');

export async function searchTwitter(input: { query: string }): Promise<string> {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiKeySecret = process.env.TWITTER_API_KEY_SECRET;

  if (!apiKey || !apiKeySecret) {
    const warningMessage = `ACTION REQUIRED: Twitter API key and/or secret not found in environment variables (.env file). 
    Twitter search will return placeholder data. 
    Please set TWITTER_API_KEY and TWITTER_API_KEY_SECRET in your .env file for live Twitter results.
    Example .env content:
    TWITTER_API_KEY=your_api_key
    TWITTER_API_KEY_SECRET=your_api_key_secret`;
    console.warn(warningMessage);
    return `[Placeholder] Twitter search results for "${input.query}" (Reason: API credentials not configured in .env).`;
  }

  try {
    // Dynamically import the TwitterApi class
    const TwitterApiModule = await import('twitter-api-v2');
    const TwitterApiClient = TwitterApiModule.TwitterApi; // Access the class from the imported module

    // Initialize TwitterApi client for app-only authentication
    const appOnlyClient = new TwitterApiClient({
      appKey: apiKey,
      appSecret: apiKeySecret,
    });

    // Perform an app-only authentication to get a read-only client
    const readOnlyClient = await appOnlyClient.appLogin();

    // Search for recent tweets
    const searchResponse = await readOnlyClient.v2.search(input.query, {
      'tweet.fields': ['text', 'created_at', 'public_metrics', 'author_id'],
      'expansions': ['author_id'],
      'user.fields': ['username', 'name'],
      'max_results': 5, // Fetch a small number of recent tweets
    });

    if (!searchResponse.data || !searchResponse.data.data || searchResponse.data.data.length === 0) {
      return `No recent tweets found for "${input.query}".`;
    }

    const tweets = searchResponse.data.data.map(tweet => {
      const author = searchResponse.data.includes?.users?.find(user => user.id === tweet.author_id);
      return `Tweet by ${author?.name || 'Unknown'} (@${author?.username || 'unknown'}):\n${tweet.text}\n(Retweets: ${tweet.public_metrics?.retweet_count || 0}, Likes: ${tweet.public_metrics?.like_count || 0})`;
    }).join('\n---\n');
    
    return `Recent tweets for "${input.query}":\n${tweets}`;

  } catch (error: any) {
    console.error(`Error during Twitter search for query "${input.query}":`, error); // Log the full error object
    let errorMessage = `Error during Twitter search for "${input.query}": API request failed. `;
    
    if (error && typeof error.message === 'string' && error.message.includes('Cannot access') && error.message.includes('before initialization')) {
      errorMessage += `A critical error occurred while trying to initialize the 'twitter-api-v2' library: "${error.message}". This often indicates a compatibility issue between the library and the Next.js server environment. Twitter search functionality will be affected.`;
      console.error("Detailed error: 'twitter-api-v2' failed to initialize correctly. This may require investigating the library's compatibility or seeking alternative solutions for Twitter integration.");
    } else if (error.rateLimit) {
      errorMessage += `Rate limit exceeded. Please try again later. (Rate limit resets at: ${new Date(error.rateLimit.reset * 1000).toLocaleTimeString()})`;
    } else if (error.isAuthError) {
      errorMessage += `Authentication failed. Please check your Twitter API keys in the .env file.`;
    } else {
      errorMessage += `This could be due to network issues, or other API errors. (Details: ${error.message || 'Unknown error'})`;
    }
    return errorMessage;
  }
}

ai.defineTool({
    name: 'searchTwitter',
    description: 'Searches Twitter for recent tweets related to a given query. Provides tweet text, author, and basic metrics.',
    inputSchema: SearchTwitterInputSchema,
    outputSchema: SearchTwitterOutputSchema,
  },
  async (input: z.infer<typeof SearchTwitterInputSchema>) => {
    return searchTwitter(input);
  }
);

