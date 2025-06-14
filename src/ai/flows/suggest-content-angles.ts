
'use server';
/**
 * @fileOverview Suggests content angles based on a topic and researched context.
 *
 * - suggestContentAngles - A function that suggests content angles.
 * - SuggestContentAnglesInput - The input type for the suggestContentAngles function.
 * - SuggestContentAnglesOutput - The return type for the suggestContentAngles function.
 * - ContentAngle - A type representing a single content angle with title and explanation.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// import { getUserData, deductCredits } from '@/lib/firebaseUserActions'; // Auth stubbed

const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

const ContentAngleSchema = z.object({
  title: z.string().describe('A concise, compelling title for the content angle (max 10 words).'),
  explanation: z.string().describe('A brief (1-2 sentences) explanation of the angle\'s appeal or target audience.'),
});
export type ContentAngle = z.infer<typeof ContentAngleSchema>;

const SuggestContentAnglesInputSchema = z.object({
  topic: z.string().describe('The main topic for which to suggest content angles.'),
  researchedContext: z.string().describe('The researched information about the topic.'),
  userId: z.string().describe('The ID of the user requesting the angles.'),
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
    schema: SuggestContentAnglesInputSchema, // Pass full input, prompt uses relevant fields
  },
  output: { // Output from LLM direct
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
    temperature: 0.7,
  },
});

const suggestContentAnglesFlow = ai.defineFlow({
  name: 'suggestContentAnglesFlow',
  inputSchema: SuggestContentAnglesInputSchema,
  outputSchema: SuggestContentAnglesOutputSchema,
}, async (input) => {
  if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
    // Auth stubbed - credit check logic would go here
  }

  try {
    const { output: promptOutput } = await prompt(input);

    if (!promptOutput || !promptOutput.angles || promptOutput.angles.length === 0) {
      return { error: "AI failed to suggest any content angles." };
    }
    
    // Auth stubbed - credit deduction logic would go here
    // if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
    //   // Potentially deduct credits for angle suggestion, or bundle it with campaign generation cost
    // }

    return { angles: promptOutput.angles };

  } catch (e: any) {
    console.error("Error in suggestContentAnglesFlow:", e);
    return { error: e.message || "An unexpected error occurred while suggesting content angles." };
  }
});
