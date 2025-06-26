
'use server';
/**
 * @fileOverview Generates expert, high-impact repurposing strategies for a content campaign.
 *
 * - suggestRepurposingIdeas - A function that suggests repurposing strategies.
 * - SuggestRepurposingIdeasInput - The input type for the function.
 * - SuggestRepurposingIdeasOutput - The return type for the function.
 * - RepurposingIdea - A type representing a single, detailed repurposing strategy.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RepurposingIdeaSchema = z.object({
  platformAndFormat: z.string().describe('The target platform and specific content format (e.g., "Instagram Carousel", "TikTok Video Script").'),
  hook: z.string().describe('A killer, attention-grabbing hook or title for the repurposed content. This must be concise and impactful.'),
  rationale: z.string().describe("An expert rationale explaining why this format and hook will perform well and has viral potential. Be specific and insightful."),
  viralityScore: z.number().min(0).max(100).describe('An estimated "Virality Score" from 0 (not a chance) to 100 (guaranteed viral hit), predicting its potential for massive reach.'),
});
export type RepurposingIdea = z.infer<typeof RepurposingIdeaSchema>;

const SuggestRepurposingIdeasInputSchema = z.object({
  topic: z.string().describe('The main topic of the campaign.'),
  selectedAngle: z.string().describe('The specific content angle chosen by the user.'),
  campaignSummary: z.string().describe('A summary or concatenation of the generated campaign posts (Twitter & LinkedIn).'),
  userId: z.string().describe('The ID of the user requesting the ideas.'),
  numIdeas: z.number().optional().default(3).describe('The number of repurposing ideas to suggest.'),
});
export type SuggestRepurposingIdeasInput = z.infer<typeof SuggestRepurposingIdeasInputSchema>;

const SuggestRepurposingIdeasOutputSchema = z.object({
  ideas: z.array(RepurposingIdeaSchema).optional().describe('An array of detailed, high-impact repurposing strategies.'),
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
      ideas: z.array(RepurposingIdeaSchema).describe('An array of detailed, high-impact repurposing strategies.'),
    }),
  },
  prompt: `You are a legendary viral marketing strategist, known for turning simple content into massive, multi-platform hits.
Based on the provided campaign materials, generate {{numIdeas}} high-impact, actionable strategies to repurpose the content. Don't just list ideas; provide a full strategic breakdown for each one.

Campaign Topic: {{{topic}}}
Selected Angle: {{{selectedAngle}}}
Original Content Summary:
{{{campaignSummary}}}

For each of the {{numIdeas}} strategies, you must provide the following:
1.  **platformAndFormat**: The specific platform and content format (e.g., "Instagram Carousel," "TikTok Video Script," "In-depth Blog Post," "Newsletter Teaser"). Be creative and specific.
2.  **hook**: A killer, attention-grabbing hook or title for the repurposed content. This must be concise, powerful, and tailored to the platform.
3.  **rationale**: Your expert rationale. Explain *why* this idea will work. Why is it a good fit for the platform? What makes the hook effective? Why does it have viral potential?
4.  **viralityScore**: Your professional estimate of its virality potential on a scale of 0-100. Be realistic but optimistic where justified.

Your output must be a valid JSON object with a single "ideas" key, containing an array of these strategy objects.
`,
  promptOptions: {
    temperature: 0.8,
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
      return { error: "The AI strategist failed to generate any repurposing ideas for this campaign." };
    }
    
    return { ideas: promptOutput.ideas };

  } catch (e: any) {
    console.error("Error in suggestRepurposingIdeasFlow:", e);
    return { error: e.message || "An unexpected error occurred while consulting the AI strategist." };
  }
});
