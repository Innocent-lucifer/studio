
'use server';
/**
 * @fileOverview Generates an interconnected series of posts for a campaign.
 *
 * - generateCampaignSeries - A function that generates a campaign series.
 * - GenerateCampaignSeriesInput - The input type for the function.
 * - GenerateCampaignSeriesOutput - The return type for the function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed

const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

const GenerateCampaignSeriesInputSchema = z.object({
  topic: z.string().describe('The main topic of the campaign.'),
  selectedAngle: z.string().describe('The specific content angle chosen by the user.'),
  platform: z.enum(['twitter', 'linkedin']).describe('The social media platform for the series (Twitter or LinkedIn).'),
  researchedContext: z.string().describe('The researched information about the topic.'),
  userId: z.string().describe('The ID of the user requesting the series.'),
  numPostsInSeries: z.number().optional().default(3).describe('Number of posts in the series (e.g., 3 tweets in a thread).'),
});
export type GenerateCampaignSeriesInput = z.infer<typeof GenerateCampaignSeriesInputSchema>;

const GenerateCampaignSeriesOutputSchema = z.object({
  series: z.array(z.string()).optional().describe('An array of interconnected posts forming the series.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GenerateCampaignSeriesOutput = z.infer<typeof GenerateCampaignSeriesOutputSchema>;

export async function generateCampaignSeries(input: GenerateCampaignSeriesInput): Promise<GenerateCampaignSeriesOutput> {
  return generateCampaignSeriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCampaignSeriesPrompt',
  input: { 
    schema: GenerateCampaignSeriesInputSchema,
  },
  output: { 
    schema: z.object({
      series: z.array(z.string()).describe('An array of interconnected posts forming the series.'),
    }),
  },
  prompt: `You are an expert social media campaign creator, skilled at crafting engaging content even from general topics.
Your entire output MUST be a valid JSON object containing a single key "series". The value of "series" must be an array of strings, where each string is a post.

Based on the topic, selected content angle, and researched context, generate a cohesive series of {{numPostsInSeries}} interconnected posts for the {{platform}} platform.
The posts should build on each other to explore the angle more deeply. Be creative and aim for high engagement.
If the Researched Context is sparse or seems unhelpful (e.g., mentions API errors or lack of data), rely more heavily on the Topic and Selected Angle to generate imaginative and relevant posts. Do not mention any API errors or configuration issues in your posts.

Topic: {{{topic}}}
Selected Angle: {{{selectedAngle}}}
Platform: {{platform}}
Researched Context:
{{{researchedContext}}}

Specifically, for the {{platform}} platform:
{{#if (eq platform "twitter")}}
Generate a Twitter thread of {{numPostsInSeries}} tweets.
- Each tweet should be concise and impactful.
- Use emojis and relevant hashtags to boost visibility.
- Ensure the tweets flow logically, forming a coherent narrative or discussion.
- Aim for a conversational and engaging tone.
{{else if (eq platform "linkedin")}}
Generate a LinkedIn series of {{numPostsInSeries}} posts (or sections of a longer article-style post).
- The content should be professional, insightful, and provide tangible value to a business-oriented audience.
- Structure the posts logically to build a strong argument or explore the angle thoroughly.
- Use emojis where appropriate for a professional yet approachable tone.
- Consider including calls to action or questions to encourage engagement.
{{/if}}

Remember to format your entire response as a JSON object with a "series" key. For example:
{
  "series": [
    "Post 1 content for {{platform}} (e.g., Tweet 1 or LinkedIn Post Section 1)...",
    "Post 2 content for {{platform}}...",
    "Post 3 content for {{platform}}..."
  ]
}
`,
  promptOptions: {
    temperature: 0.75, // Slightly higher for more creativity with generic topics
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const generateCampaignSeriesFlow = ai.defineFlow({
  name: 'generateCampaignSeriesFlow',
  inputSchema: GenerateCampaignSeriesInputSchema,
  outputSchema: GenerateCampaignSeriesOutputSchema,
}, async (input) => {
  console.log(`[generateCampaignSeriesFlow] Starting for platform: ${input.platform}, topic: "${input.topic}", angle: "${input.selectedAngle}"`);
  if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
    // Auth stubbed - credit check logic would go here
  }

  try {
    console.log('[generateCampaignSeriesFlow] Calling AI prompt with input:', JSON.stringify(input, null, 2));
    const { output: promptOutput, usage } = await prompt(input);
    
    console.log('[generateCampaignSeriesFlow] Raw AI output:', JSON.stringify(promptOutput, null, 2));
    console.log('[generateCampaignSeriesFlow] Usage data:', JSON.stringify(usage, null, 2));

    if (!promptOutput) {
      const errorMessage = `AI returned no structured output for ${input.platform}. This may be due to a model error or a very restrictive topic. Input was: Topic='${input.topic}', Angle='${input.selectedAngle}'. Try a different angle or adjust the topic.`;
      console.warn(`[generateCampaignSeriesFlow] Warning: ${errorMessage}. Prompt output was null or undefined.`);
      return { error: errorMessage };
    }
    
    if (!promptOutput.series || !Array.isArray(promptOutput.series) || promptOutput.series.length === 0) {
       // Check if promptOutput.series is an array, because it might be an object if JSON parsing failed partially
      const seriesContent = Array.isArray(promptOutput.series) ? promptOutput.series.join('; ') : 'Not an array';
      const errorMessage = `AI returned an empty or invalid series for ${input.platform} (Series content: '${seriesContent}'). This could be due to the nature of the topic/angle, or the AI's internal policies. Input was: Topic='${input.topic}', Angle='${input.selectedAngle}'. Try a different angle or adjust the topic.`;
      console.warn(`[generateCampaignSeriesFlow] Warning: ${errorMessage}. Raw Prompt output was:`, JSON.stringify(promptOutput, null, 2));
      return { error: errorMessage };
    }
    
    // Auth stubbed - credit deduction logic would go here

    console.log(`[generateCampaignSeriesFlow] Successfully generated ${promptOutput.series.length} posts for ${input.platform}.`);
    return { series: promptOutput.series };

  } catch (e: any) {
    console.error(`[generateCampaignSeriesFlow] Error during series generation for ${input.platform}:`, e);
    let detailedErrorMessage = e.message || `An unexpected error occurred while generating the ${input.platform} series.`;
    if (e.data?.error?.message) { 
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    } else if (e.toString().includes('Error: Genkit')) {
        detailedErrorMessage += ` (Genkit processing error. Check previous logs for details.)`
    }
    return { error: detailedErrorMessage };
  }
});
