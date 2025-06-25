
'use server';
/**
 * @fileOverview Generates an interconnected series of posts for a campaign.
 *
 * - generateCampaignSeries - A function that generates a campaign series.
 * - GenerateCampaignSeriesInput - The input type for the function.
 * - GenerateCampaignSeriesOutput - The return type for the function.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';

const GenerateCampaignSeriesInputSchema = z.object({
  topic: z.string().describe('The main topic of the campaign.'),
  selectedAngle: z.string().describe('The specific content angle chosen by the user.'),
  platform: z.enum(['twitter', 'linkedin']).describe('The social media platform for the series (Twitter or LinkedIn).'),
  researchedContext: z.string().describe('The researched information about the topic.'),
  userId: z.string().optional().describe('The ID of the user requesting the series. Optional for now.'),
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
  prompt: `You are an expert campaign strategist and ghostwriter who creates content with deep emotional intelligence, making it undetectable from human writing. Your entire output MUST be a valid JSON object with a "series" key, where the value is an array of strings.

Topic: {{{topic}}}
Selected Angle: {{{selectedAngle}}}
Platform: {{platform}}
Number of posts: {{numPostsInSeries}}
Researched Context:
{{{researchedContext}}}

Based on the above, generate a cohesive series of {{numPostsInSeries}} interconnected posts for the {{platform}} platform.
The posts MUST sound like a real person wrote them, with a natural, conversational, and deeply human-like tone. They should be completely undetectable as AI-generated content.
The posts should build on each other to explore the angle more deeply. Be extremely creative, especially if the topic is abstract.
If the Researched Context is sparse or unhelpful, rely on your own creativity to generate imaginative, emotionally intelligent posts based on the Topic and Angle. Do not mention API errors or lack of data in your posts.

If the platform is Twitter:
- Generate a Twitter thread of {{numPostsInSeries}} tweets.
- Each tweet should be concise (under 280 characters), impactful, and emotionally resonant.
- Use emojis and relevant hashtags naturally to boost visibility and convey a human feel.
- Ensure the tweets form a coherent narrative.

If the platform is LinkedIn:
- Generate a LinkedIn series of {{numPostsInSeries}} posts.
- The content should be professional and insightful, but written with an authentic, human voice. Avoid corporate jargon.
- Structure the posts to build a strong, emotionally intelligent argument.
- Use emojis where appropriate for a professional yet approachable tone.

Remember to format your entire response as a JSON object with a "series" key. For example:
{
  "series": [
    "Post 1 content for the {{platform}} platform...",
    "Post 2 content for the {{platform}} platform...",
    "Post 3 content for the {{platform}} platform..."
  ]
}
`,
  promptOptions: {
    temperature: 0.9, 
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
  try {
    const { output: promptOutput, usage } = await prompt(input);

    if (!promptOutput) {
      const errorMessage = `AI returned no structured output (it was null or undefined) for ${input.platform}. This may be due to a model error, a very restrictive topic/angle, or internal safety policies. Input: Topic='${input.topic}', Angle='${input.selectedAngle}'.`;
      return { error: errorMessage };
    }

    if (promptOutput.series === undefined || promptOutput.series === null) {
      const errorMessage = `AI output was missing the 'series' field for ${input.platform}. Input: Topic='${input.topic}', Angle='${input.selectedAngle}'. Raw output: ${JSON.stringify(promptOutput)}.`;
      return { error: errorMessage };
    }
    
    if (!Array.isArray(promptOutput.series)) {
      const errorMessage = `AI returned an invalid 'series' field (expected an array, got ${typeof promptOutput.series}) for ${input.platform}. Input: Topic='${input.topic}', Angle='${input.selectedAngle}'. Raw output: ${JSON.stringify(promptOutput)}.`;
      return { error: errorMessage };
    }
    
    if (promptOutput.series.length === 0) {
      const errorMessage = `AI returned an empty 'series' array for ${input.platform}. This could be due to the extreme vagueness of the topic/angle or the AI's inability to generate specific content. Input: Topic='${input.topic}', Angle='${input.selectedAngle}'. Try a more specific angle or adjust the topic.`;
      return { series: [] };
    }
    
    return { series: promptOutput.series };

  } catch (e: any) {
    console.error(`[generateCampaignSeriesFlow] Exception during series generation for ${input.platform}:`, e);
    let detailedErrorMessage = e.message || `An unexpected exception occurred while generating the ${input.platform} series.`;
    if (e.data?.error?.message) {
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    } else if (e.toString().includes('Error: Genkit')) {
        detailedErrorMessage += ` (Genkit processing error. Check previous logs for details.)`;
    }
    return { error: detailedErrorMessage };
  }
});
