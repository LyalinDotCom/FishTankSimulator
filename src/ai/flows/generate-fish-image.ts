'use server';
/**
 * @fileOverview A flow for generating an image of a fish.
 *
 * - generateFishImage - A function that returns a data URI of a newly generated fish image.
 */

import { ai } from '@/ai/genkit';

const fishTypes = ['tropical fish', 'deep-sea fish', 'fantasy water spirit', 'alien aquatic lifeform', 'coral reef dweller', 'bioluminescent creature'];
const adjectives = ['vibrant', 'iridescent', 'ethereal', 'geometric', 'armored', 'spiky', 'elegant', 'whimsical', 'futuristic', 'glowing'];
const features = ['long flowing fins', 'unusual patterns', 'a metallic sheen', 'translucent skin', 'intricate markings', 'a feathery tail', 'large expressive eyes', 'a crystal-like body'];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateFishImage(): Promise<string> {
  const type = getRandomElement(fishTypes);
  const adj1 = getRandomElement(adjectives);
  const adj2 = getRandomElement(adjectives);
  const feature = getRandomElement(features);

  const prompt = `Generate a photorealistic, studio-quality image of a single, unique ${adj1} ${adj2} ${type} with ${feature}. The fish MUST be facing to the right. The background MUST be completely transparent. The output format MUST be a PNG with a transparent alpha channel. Do not add any background color, shadows, or reflections.`;

  const { media } = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: prompt,
    config: {
        responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
      throw new Error('AI failed to generate an image.');
  }

  return media.url;
}
