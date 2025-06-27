
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const googleApiKey = process.env.GOOGLE_GENAI_API_KEY;

if (!googleApiKey) {
  console.warn(`
    ACTION REQUIRED: GOOGLE_GENAI_API_KEY is not set in your .env file.
    The AI features of this application will not work without it.
    Please get your key from Google AI Studio (aistudio.google.com)
    and add it to your .env file.
  `);
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: googleApiKey,
    }),
  ],
  model: 'gemini-1.5-flash',
});
