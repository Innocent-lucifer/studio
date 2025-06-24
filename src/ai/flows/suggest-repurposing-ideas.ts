
'use server';
/**
 * @fileOverview Suggests repurposing ideas for a generated content campaign.
 *
 * - suggestRepurposingIdeas - A function that suggests repurposing ideas.
 * - SuggestRepurposingIdeasInput - The input type for the function.
 * - SuggestRepurposingIdeasOutput - The return type for the function.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';

const SuggestRepurposingIdeasInputSchema = z.object({
  topic: z.string().describe('The main topic of the campaign.'),
  selectedAngle: z.string().describe('The specific content angle chosen by the user.'),
  campaignSummary: z.string().describe('A summary or concatenation of the generated campaign posts (Twitter & LinkedIn).'),
  userId: z.string().describe('The ID of the user requesting the ideas.'),
  numIdeas: z.number().optional().default(4).describe('The number of repurposing ideas to suggest.'),
});
export type SuggestRepurposingIdeasInput = z.infer<typeof SuggestRepurposingIdeasInputSchema>;

const SuggestRepurposingIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).optional().describe('An array of repurposing ideas as bullet points.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type SuggestRepurposingIdeasOutput = z.infer<typeof SuggestRepurposingIdeasOutputSchema>;

export async function suggestRepurposingIdeas(input: SuggestRepurposingIdeasInput): Promise<SuggestRepurposingIdeasOutput> {
  return suggestRepurposingIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRepurposingIdeasPrompt',
  input: {
    schema: SuggestRepurposingIdeasInputSchema,
  },
  output: {
    schema: z.object({
      ideas: z.array(z.string()).describe('An array of repurposing ideas as bullet points.'),
    }),
  },
  prompt: `You are a creative content repurposing expert.
Based on the provided topic, selected angle, and the generated campaign summary, suggest {{numIdeas}} actionable ways to repurpose this content for other platforms or formats.
Provide these as concise bullet points.

Topic: {{{topic}}}
Selected Angle: {{{selectedAngle}}}

Generated Campaign Summary:
{{{campaignSummary}}}

Suggest {{numIdeas}} repurposing ideas (e.g., "Turn key points into an Instagram carousel", "Use the thread as a script for a short video", "Summarize as a newsletter section"):
`,
  promptOptions: {
    temperature: 0.6,
  },
});

const suggestRepurposingIdeasFlow = ai.defineFlow({
  name: 'suggestRepurposingIdeasFlow',
  inputSchema: SuggestRepurposingIdeasInputSchema,
  outputSchema: SuggestRepurposingIdeasOutputSchema,
}, async (input) => {
  try {
    const { output: promptOutput } = await prompt(input);

    if (!promptOutput || !promptOutput.ideas || promptOutput.ideas.length === 0) {
      return { error: "AI failed to suggest any repurposing ideas." };
    }
    
    return { ideas: promptOutput.ideas };

  } catch (e: any) {
    console.error("Error in suggestRepurposingIdeasFlow:", e);
    return { error: e.message || "An unexpected error occurred while suggesting repurposing ideas." };
  }
});
