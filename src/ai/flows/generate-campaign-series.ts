
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
  input: { // Pass full input, prompt uses relevant fields
    schema: GenerateCampaignSeriesInputSchema,
  },
  output: { // Output from LLM direct
    schema: z.object({
      series: z.array(z.string()).describe('An array of interconnected posts forming the series.'),
    }),
  },
  prompt: `You are an expert social media campaign creator.
Based on the topic, selected content angle, and researched context, generate a cohesive series of {{numPostsInSeries}} interconnected posts for the {{platform}} platform.
The posts should build on each other to explore the angle more deeply.

Topic: {{{topic}}}
Selected Angle: {{{selectedAngle}}}
Platform: {{platform}}
Researched Context:
{{{researchedContext}}}

{{#if (eq platform "twitter")}}
Generate a Twitter thread with {{numPostsInSeries}} tweets. Ensure they flow logically. Use emojis and hashtags appropriately.
The tweets should be engaging and encourage discussion.
{{else if (eq platform "linkedin")}}
Generate a LinkedIn post series (or a single long-form post divided into {{numPostsInSeries}} logical sections).
The content should be professional, insightful, and provide value to a business audience. Use emojis where appropriate.
{{/if}}

Generated Series:
`,
  promptOptions: { 
    temperature: 0.7,
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
    console.log('[generateCampaignSeriesFlow] Calling AI prompt...');
    const { output: promptOutput, usage } = await prompt(input);
    
    console.log('[generateCampaignSeriesFlow] Raw AI output:', JSON.stringify(promptOutput, null, 2));
    console.log('[generateCampaignSeriesFlow] Usage data:', JSON.stringify(usage, null, 2));


    if (!promptOutput || !promptOutput.series || promptOutput.series.length === 0) {
      const errorMessage = `AI failed to generate a campaign series for ${input.platform}. This could be due to the nature of the topic or the AI's internal generation policies even with relaxed safety filters. Try a different angle or adjust the topic.`;
      console.warn(`[generateCampaignSeriesFlow] Warning: ${errorMessage}. Prompt output was:`, promptOutput);
      return { error: errorMessage };
    }
    
    // Auth stubbed - credit deduction logic would go here

    console.log(`[generateCampaignSeriesFlow] Successfully generated ${promptOutput.series.length} posts for ${input.platform}.`);
    return { series: promptOutput.series };

  } catch (e: any) {
    console.error(`[generateCampaignSeriesFlow] Error during series generation for ${input.platform}:`, e);
    let detailedErrorMessage = e.message || `An unexpected error occurred while generating the ${input.platform} series.`;
    if (e.data?.error?.message) { // Check for nested error messages from the API
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    }
    return { error: detailedErrorMessage };
  }
});

