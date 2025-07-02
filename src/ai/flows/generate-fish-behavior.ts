'use server';
/**
 * @fileOverview A flow for generating fish behaviors in a virtual aquarium.
 *
 * - generateFishBehavior - A function that generates behaviors for a given number of fish.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateFishBehaviorInput, GenerateFishBehaviorOutput } from '@/lib/types';

const FishShapeSchema = z.object({
  bodyShape: z.enum(['ellipsoid', 'box']).describe("The basic shape of the fish's body."),
  bodyDimensions: z.object({
    x: z.number().describe("The width of the fish body."),
    y: z.number().describe("The height of the fish body."),
    z: z.number().describe("The length of the fish body."),
  }).describe("The dimensions of the fish body's bounding box. Suggested values for x, y, z are between 0.2 and 0.8."),
  tailShape: z.enum(['cone', 'triangle']).describe("The shape of the fish's tail. A 'triangle' is a flat fin."),
  tailDimensions: z.object({
    x: z.number().describe("The width of the fish tail."),
    y: z.number().describe("The height of the fish tail."),
    z: z.number().describe("The length/depth of the fish tail."),
  }).describe("The dimensions for the tail. Suggested values for x, y, z are between 0.1 and 0.4."),
  dorsalFin: z.boolean().describe('Whether the fish has a dorsal fin on top.'),
});

const FishBehaviorSchema = z.object({
  id: z.number().describe('A unique numeric ID for the fish.'),
  startPosition: z.object({
    x: z.number().describe('The starting X coordinate.'),
    y: z.number().describe('The starting Y coordinate.'),
    z: z.number().describe('The starting Z coordinate.'),
  }),
  swimmingPattern: z.string().describe("The swimming pattern of the fish. Can be one of: 'straight', 'lazy_s', 'circle', 'erratic'."),
  shape: FishShapeSchema.describe("The physical shape and features of the fish."),
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
    prompt: `You are a marine biologist and 3D artist designing a simulation for a virtual fish tank.
Your task is to generate distinct behaviors and appearances for {{fishCount}} fish.

The valid coordinate ranges are:
- x: from -{{halfWidth}} to {{halfWidth}}
- y: from -{{halfHeight}} to {{halfHeight}}
- z: from -{{halfDepth}} to {{halfDepth}}

For each fish, provide:
1. A unique ID (from 0 to {{maxId}}).
2. A starting position (x, y, z) that is safely inside the tank boundaries.
3. A swimming pattern from the following options: 'straight', 'lazy_s', 'circle', 'erratic'.
4. A unique physical shape. Be creative and generate a wide variety of fish. Define the shape using these parameters:
   - bodyShape: Can be 'ellipsoid' or 'box'.
   - bodyDimensions: An object with x, y, z dimensions for the body's bounding box. Suggested values for x, y, z are between 0.2 and 0.8.
   - tailShape: Can be 'cone' or 'triangle'. A 'triangle' will be a flat fin.
   - tailDimensions: An object with x, y, z dimensions for the tail. Suggested values for x, y, z are between 0.1 and 0.4.
   - dorsalFin: A boolean (true/false) to add a dorsal fin.

Generate a JSON array of {{fishCount}} fish objects. Ensure the output is a valid JSON array matching the requested schema.
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
