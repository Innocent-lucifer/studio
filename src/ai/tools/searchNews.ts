
'use server';

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import axios from 'axios';

const SearchNewsInputSchema = z.object({
  query: z.string().describe('The search query for news articles.'),
});

const SearchNewsOutputSchema = z.string().describe('A summary of the latest news articles.');

export async function searchNews(input: { query: string }): Promise<string> {
  const apiKey = process.env.NEWS_API_AI_KEY;

  if (!apiKey) {
    const warningMessage = `ACTION REQUIRED: NewsAPI.ai (Event Registry) API key not found.
    News search will return placeholder data.
    Please set NEWS_API_AI_KEY in your .env file for live news results.`;
    console.warn(warningMessage);
    return `News search functionality is not configured. No real-time news insights are available for "${input.query}".`;
  }

  try {
    const response = await axios.get('https://eventregistry.org/api/v1/article/getArticles', {
      params: {
        action: 'getArticles',
        query: JSON.stringify({
          $query: {
            keyword: input.query,
            lang: "eng",
          },
        }),
        resultType: 'articles',
        articlesSortBy: 'date',
        articlesCount: 5,
        apiKey: apiKey,
        articleBodyLen: 300,
      },
    });

    const articles = response.data?.articles?.results;

    if (!articles || articles.length === 0) {
      return `No recent news articles found for "${input.query}". General knowledge will be used.`;
    }

    const newsSummary = articles.map((article: any) => 
      `Title: ${article.title}\nSource: ${article.source.title}\nSummary: ${article.body}`
    ).join('\n---\n');

    return `Recent news for "${input.query}":\n${newsSummary}`;

  } catch (error: any) {
    console.error(`Error during NewsAPI.ai search for query "${input.query}":`, error);
    let errorMessage = `Error during news search for "${input.query}". `;

    if (error.response) {
      errorMessage += `API responded with status ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage += 'No response received from the news API.';
    } else {
      errorMessage += `An unexpected error occurred: ${error.message}`;
    }
    
    return `${errorMessage} Could not fetch live news data for "${input.query}". Proceeding with general knowledge.`;
  }
}

ai.defineTool({
    name: 'searchNews',
    description: 'Searches for recent news articles related to a given query using NewsAPI.ai (Event Registry). Provides article titles, sources, and summaries. Returns a neutral message if search fails or is unconfigured.',
    inputSchema: SearchNewsInputSchema,
    outputSchema: SearchNewsOutputSchema,
  },
  async (input: z.infer<typeof SearchNewsInputSchema>) => {
    return searchNews(input);
  }
);
