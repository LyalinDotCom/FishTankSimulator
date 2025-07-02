'use server';

/**
 * @fileOverview Generates realistic and varied swimming patterns for virtual fish.
 *
 * - generateFishBehavior - A function that generates fish swimming behaviors.
 * - GenerateFishBehaviorInput - The input type for the generateFishBehavior function.
 * - GenerateFishBehaviorOutput - The return type for the generateFishBehavior function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFishBehaviorInputSchema = z.object({
  tankWidth: z.number().describe('The width of the fish tank.'),
  tankHeight: z.number().describe('The height of the fish tank.'),
  tankDepth: z.number().describe('The depth of the fish tank.'),
  fishCount: z.number().describe('The number of fish in the tank.'),
});
export type GenerateFishBehaviorInput = z.infer<typeof GenerateFishBehaviorInputSchema>;

const FishBehaviorSchema = z.object({
  id: z.number().describe('Unique identifier for the fish.'),
  startPosition: z.object({
    x: z.number().describe('Initial X coordinate of the fish.'),
    y: z.number().describe('Initial Y coordinate of the fish.'),
    z: z.number().describe('Initial Z coordinate of the fish.'),
  }),
  swimmingPattern: z
    .string()
    .describe(
      'A sequence of movements and actions for the fish, described in natural language, respecting the tank boundaries.'
    ),
});

const GenerateFishBehaviorOutputSchema = z.array(FishBehaviorSchema).describe('Array of fish behaviors.');
export type GenerateFishBehaviorOutput = z.infer<typeof GenerateFishBehaviorOutputSchema>;

export async function generateFishBehavior(input: GenerateFishBehaviorInput): Promise<GenerateFishBehaviorOutput> {
  return generateFishBehaviorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFishBehaviorPrompt',
  input: {schema: GenerateFishBehaviorInputSchema},
  output: {schema: GenerateFishBehaviorOutputSchema},
  prompt: `You are an expert in creating realistic fish swimming behaviors for a virtual aquarium.

You will receive the dimensions of the fish tank and the number of fish in the tank.
Your task is to generate a diverse and realistic swimming pattern for each fish, making sure each fish respects the tank boundaries, and doesn't overlap with other fish.

Tank Dimensions:
Width: {{{tankWidth}}}
Height: {{{tankHeight}}}
Depth: {{{tankDepth}}}

Number of Fish: {{{fishCount}}}

Generate swimming patterns that vary in speed, direction, and style. Each fish must have a unique ID.
Each fish behavior should contain a start position, and then a sequence of movements and actions described in natural language.

Output the swimming patterns as JSON array.
`,
});

const generateFishBehaviorFlow = ai.defineFlow(
  {
    name: 'generateFishBehaviorFlow',
    inputSchema: GenerateFishBehaviorInputSchema,
    outputSchema: GenerateFishBehaviorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
