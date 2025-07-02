'use server';
/**
 * @fileOverview A flow for removing the background from an image.
 *
 * - removeImageBackground - A function that takes an image data URI and returns a new data URI with the background removed.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RemoveBackgroundImageInputSchema = z.string().describe(
    "A photo of a fish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
);

const RemoveBackgroundImageOutputSchema = z.string().describe(
    "A data URI of the processed fish image with a transparent background."
);

export async function removeImageBackground(photoDataUri: string): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: [
        { media: { url: photoDataUri } },
        { text: 'You are an expert image editor. Isolate the fish in this image and remove the background completely. The output must be a PNG image with a fully transparent background.' },
    ],
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
      throw new Error('AI failed to process the image.');
  }

  return media.url;
}
