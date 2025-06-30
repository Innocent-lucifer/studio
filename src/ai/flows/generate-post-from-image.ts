
'use server';
/**
 * @fileOverview Generates a social media post based on an image, optional user context, and tone.
 *
 * - generatePostFromImage - A function that handles the image-based post generation.
 * - GeneratePostFromImageInput - The input type for the function.
 * - GeneratePostFromImageOutput - The return type for the function.
 */

import {ai}from '@/ai/ai-instance';
import {z}from 'genkit';
import { checkTrialAndSubscription } from '@/lib/firebaseAdminActions';

const GeneratePostFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image data URI (e.g., 'data:image/jpeg;base64,...'). This image will be the primary inspiration for the post."
    ),
  userContext: z
    .string()
    .optional()
    .describe('Optional text provided by the user for deeper personalization or specific keywords to include.'),
  tone: z
    .enum(['romantic', 'funny', 'professional', 'mysterious', 'default'])
    .optional()
    .default('default')
    .describe('The desired tone for the generated post. "default" implies a generally engaging and suitable tone based on the image.'),
  userId: z.string().optional().describe('The ID of the user requesting the post. Optional for now, but checked client-side before calling this flow for credit purposes.'),
});
export type GeneratePostFromImageInput = z.infer<typeof GeneratePostFromImageInputSchema>;

const GeneratePostFromImageOutputSchema = z.object({
  generatedPost: z.string().optional().describe('The AI-generated social media post based on the image and inputs.'),
  error: z.string().optional().describe('An error message if generation failed.'),
});
export type GeneratePostFromImageOutput = z.infer<typeof GeneratePostFromImageOutputSchema>;

export async function generatePostFromImage(input: GeneratePostFromImageInput): Promise<GeneratePostFromImageOutput> {
  return generatePostFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePostFromImagePrompt',
  input: {
    schema: GeneratePostFromImageInputSchema,
  },
  output: {
    schema: z.object({ // Output from LLM direct
      post: z.string().describe('The generated social media post.'),
    }),
  },
  prompt: `You are a master storyteller and social media wordsmith who writes with deep emotional intelligence. Your writing is indistinguishable from a human's.
Your goal is to look at an image and craft a compelling, detailed, and emotionally resonant social media post. It should feel authentic, personal, and be completely undetectable as AI.

Analyze the provided image carefully. Go beyond just describing it. Capture its mood, the unspoken story, the feelings it evokes, and the human experience it represents.

Image: {{media url=imageDataUri}}

Desired tone: {{tone}}

{{#if userContext}}
User's additional context/keywords: "{{userContext}}"
Weave this context into your narrative seamlessly, making the post feel even more personal and profound.
{{else}}
Even without user context, create a rich, imaginative, and substantial post. Invent a backstory, explore a feeling, or ask a question that the image inspires. Connect with the viewer on an emotional level.
{{/if}}

The post must be more than a caption; it should be a story or a reflection.
If a specific tone like 'romantic', 'funny', 'professional', or 'mysterious' is requested, embody that tone with nuance and authenticity. If the tone is 'default', aim for a style that is descriptive, engaging, and emotionally intelligent.
**Use relevant emojis and hashtags to amplify the human emotion and feeling of the post.**

Your entire output must be the generated post text. Do not add any preamble.

Generated post:
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

const generatePostFromImageFlow = ai.defineFlow({
  name: 'generatePostFromImageFlow',
  inputSchema: GeneratePostFromImageInputSchema,
  outputSchema: GeneratePostFromImageOutputSchema,
}, async (input) => {
    const { userId } = input;
    if (!userId) {
        return { error: "User not authenticated." };
    }
    const accessCheck = await checkTrialAndSubscription(userId);
    if (!accessCheck.canProceed) {
        return { error: accessCheck.error || "Access denied." };
    }

  try {
    const { output: promptOutput, usage } = await prompt(input);

    if (!promptOutput || !promptOutput.post) {
      const errorMessage = "AI failed to generate a post from the image. The model might not have returned any content or the expected 'post' field was missing.";
      return { error: errorMessage };
    }
    
    return { 
        generatedPost: promptOutput.post,
    };

  } catch (e: any) {
    console.error('[generatePostFromImageFlow] Exception during post generation:', e);
    let detailedErrorMessage = e.message || 'An unexpected error occurred while generating the post from the image.';
    if (e.data?.error?.message) {
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    }
    return { error: detailedErrorMessage };
  }
});
