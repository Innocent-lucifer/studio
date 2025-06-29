
'use server';
/**
 * @fileOverview Suggests content angles based on a topic and researched context.
 *
 * - suggestContentAngles - A function that suggests content angles.
 * - SuggestContentAnglesInput - The input type for the suggestContentAngles function.
 * - SuggestContentAnglesOutput - The return type for the suggestContentAngles function.
 * - ContentAngle - A type representing a single content angle with title and explanation.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import { checkAndIncrementUsage } from '@/lib/firebaseAdminActions';

const ContentAngleSchema = z.object({
  title: z.string().describe('A concise, compelling title for the content angle (max 10 words).'),
  explanation: z.string().describe('A brief (1-2 sentences) explanation of the angle\'s appeal or target audience.'),
});
export type ContentAngle = z.infer<typeof ContentAngleSchema>;

const SuggestContentAnglesInputSchema = z.object({
  topic: z.string().describe('The main topic for which to suggest content angles.'),
  researchedContext: z.string().describe('The researched information about the topic.'),
  userId: z.string().optional().describe('The ID of the user requesting the angles. Optional for now.'),
  numAngles: z.number().optional().default(4).describe('The number of content angles to suggest (3-5 recommended).'),
});
export type SuggestContentAnglesInput = z.infer<typeof SuggestContentAnglesInputSchema>;

const SuggestContentAnglesOutputSchema = z.object({
  angles: z.array(ContentAngleSchema).optional().describe('An array of suggested content angles.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type SuggestContentAnglesOutput = z.infer<typeof SuggestContentAnglesOutputSchema>;

export async function suggestContentAngles(input: SuggestContentAnglesInput): Promise<SuggestContentAnglesOutput> {
  return suggestContentAnglesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestContentAnglesPrompt',
  input: {
    schema: SuggestContentAnglesInputSchema,
  },
  output: {
    schema: z.object({
      angles: z.array(ContentAngleSchema).describe('An array of suggested content angles.'),
    }),
  },
  prompt: `You are a brilliant content strategist. Based on the provided topic and researched context, suggest {{numAngles}} distinct and compelling content angles or themes.
For each angle, provide a concise title and a brief (1-2 sentences) explanation of its potential appeal or target audience.

Topic: {{{topic}}}

Researched Context:
{{{researchedContext}}}

Suggest {{numAngles}} content angles:
`,
  promptOptions: {
    temperature: 0.9,
  },
});

const suggestContentAnglesFlow = ai.defineFlow({
  name: 'suggestContentAnglesFlow',
  inputSchema: SuggestContentAnglesInputSchema,
  outputSchema: SuggestContentAnglesOutputSchema,
}, async (input) => {
  if (!input.userId) {
    return { error: "User ID is required for this operation." };
  }
  const usageCheck = await checkAndIncrementUsage(input.userId);
  if (!usageCheck.canProceed) {
    return { error: usageCheck.error };
  }

  try {
    const { output: promptOutput } = await prompt(input);

    if (!promptOutput || !promptOutput.angles || promptOutput.angles.length === 0) {
      return { error: "AI failed to suggest any content angles." };
    }
    
    return { angles: promptOutput.angles };

  } catch (e: any) {
    console.error("[suggestContentAnglesFlow] Error:", e);
    return { error: e.message || "An unexpected error occurred while suggesting content angles." };
  }
});
