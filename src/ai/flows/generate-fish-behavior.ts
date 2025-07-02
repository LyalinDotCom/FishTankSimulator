'use server';
/**
 * @fileOverview A flow for generating fish behaviors in a virtual aquarium.
 *
 * - generateFishBehavior - A function that generates behaviors for a given number of fish.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateFishBehaviorInput, GenerateFishBehaviorOutput } from '@/lib/types';

const FishBehaviorSchema = z.object({
  id: z.number().describe('A unique numeric ID for the fish.'),
  startPosition: z.object({
    x: z.number().describe('The starting X coordinate.'),
    y: z.number().describe('The starting Y coordinate.'),
    z: z.number().describe('The starting Z coordinate.'),
  }),
  swimmingPattern: z.string().describe("The swimming pattern of the fish. Can be one of: 'straight', 'lazy_s', 'circle', 'erratic'."),
});

const GenerateFishBehaviorInputSchema = z.object({
  fishCount: z.number().int().min(1).max(50).describe('The number of fish to generate behaviors for.'),
  tankDimensions: z.object({
    width: z.number().describe('The width of the tank.'),
    height: z.number().describe('The height of the tank.'),
    depth: z.number().describe('The depth of the tank.'),
  }),
});

const GenerateFishBehaviorOutputSchema = z.array(FishBehaviorSchema);

const PromptInputSchema = GenerateFishBehaviorInputSchema.extend({
    halfWidth: z.number(),
    halfHeight: z.number(),
    halfDepth: z.number(),
    maxId: z.number(),
});

const prompt = ai.definePrompt({
    name: 'generateFishBehaviorPrompt',
    input: { schema: PromptInputSchema },
    output: { schema: GenerateFishBehaviorOutputSchema },
    prompt: `You are a marine biologist designing a simulation for a virtual fish tank.
Your task is to generate distinct behaviors for {{fishCount}} fish.

The valid coordinate ranges are:
- x: from -{{halfWidth}} to {{halfWidth}}
- y: from -{{halfHeight}} to {{halfHeight}}
- z: from -{{halfDepth}} to {{halfDepth}}

For each fish, provide a unique ID (from 0 to {{maxId}}) and a starting position (x, y, z) that is safely inside the tank boundaries (e.g., not directly on the edge, leave some margin like 10%).
Also, assign a swimming pattern from the following options: 'straight', 'lazy_s', 'circle', 'erratic'.

Generate a JSON array of {{fishCount}} fish behavior objects. Ensure the output is a valid JSON array matching the requested schema.
`,
});

const generateFishBehaviorFlow = ai.defineFlow(
  {
    name: 'generateFishBehaviorFlow',
    inputSchema: GenerateFishBehaviorInputSchema,
    outputSchema: GenerateFishBehaviorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
        ...input,
        halfWidth: input.tankDimensions.width / 2,
        halfHeight: input.tankDimensions.height / 2,
        halfDepth: input.tankDimensions.depth / 2,
        maxId: input.fishCount - 1,
    });
    
    if (!output) {
        throw new Error("Failed to generate fish behaviors from AI.");
    }
    return output;
  }
);


export async function generateFishBehavior(input: GenerateFishBehaviorInput): Promise<GenerateFishBehaviorOutput> {
    return await generateFishBehaviorFlow(input);
}
