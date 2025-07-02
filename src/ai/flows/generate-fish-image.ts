'use server';
/**
 * @fileOverview A flow for generating an image of a fish with a transparent background.
 *
 * - generateFishImage - A function that returns a data URI of a newly generated fish image.
 */

import { ai } from '@/ai/genkit';

const PROMPT = `Generate a photorealistic image of a unique, colorful, tropical fish facing sideways. The background MUST be completely transparent. Output a PNG image with an alpha channel for transparency. Do not include any background color.`;

export async function generateFishImage(): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: PROMPT,
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
        ]
    },
  });

  if (!media?.url) {
      throw new Error('AI failed to generate an image.');
  }

  return media.url;
}
