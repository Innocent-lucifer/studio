
'use server';
/**
 * @fileOverview Generates a social media post based on an image, optional user context, and tone.
 *
 * - generatePostFromImage - A function that handles the image-based post generation.
 * - GeneratePostFromImageInput - The input type for the function.
 * - GeneratePostFromImageOutput - The return type for the function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Auth stubbed for MOCK_USER_ID
const MOCK_USER_ID_FOR_STUBBED_AUTH = "sagepostai-guest-user";

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
  userId: z.string().describe('The ID of the user requesting the post.'),
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
  prompt: `You are an expert social media content creator specializing in crafting engaging posts from images.
Analyze the provided image carefully. Consider its mood, setting, objects, colors, and overall vibe.

Image: {{media url=imageDataUri}}

{{#if userContext}}
User's additional context/keywords: "{{userContext}}"
Incorporate this context naturally into your post.
{{/if}}

Desired tone: {{tone}}

Generate a compelling and concise social media post (suitable for platforms like Instagram, Twitter, or LinkedIn depending on the content and tone).
The post should be inspired by the image.
If the tone is 'default', aim for a generally appealing and engaging style.
If a specific tone like 'romantic', 'funny', 'professional', 'mysterious' is requested, ensure the post strongly reflects that tone.
Use relevant emojis and hashtags to enhance engagement.

Generated post:
`,
  promptOptions: {
    temperature: 0.7, // Balances creativity and coherence
     safetySettings: [ // Permissive settings
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
  console.log('[generatePostFromImageFlow] Received input:', { ...input, imageDataUri: input.imageDataUri.substring(0,50) + "..."});

  if (input.userId !== MOCK_USER_ID_FOR_STUBBED_AUTH) {
    // Auth stubbed - credit check logic would go here
  }

  try {
    const { output: promptOutput, usage } = await prompt(input);
    console.log('[generatePostFromImageFlow] Raw AI output:', JSON.stringify(promptOutput, null, 2));
    console.log('[generatePostFromImageFlow] Usage data:', JSON.stringify(usage, null, 2));

    if (!promptOutput || !promptOutput.post) {
      const errorMessage = "AI failed to generate a post from the image. The model might not have returned any content or the expected 'post' field was missing.";
      console.warn(`[generatePostFromImageFlow] Error: ${errorMessage}`);
      return { error: errorMessage };
    }

    // Auth stubbed - credit deduction logic
    
    return { generatedPost: promptOutput.post };

  } catch (e: any) {
    console.error('[generatePostFromImageFlow] Exception during post generation:', e);
    let detailedErrorMessage = e.message || 'An unexpected error occurred while generating the post from the image.';
    if (e.data?.error?.message) {
        detailedErrorMessage += ` (AI Provider Error: ${e.data.error.message})`;
    }
    return { error: detailedErrorMessage };
  }
});
    
