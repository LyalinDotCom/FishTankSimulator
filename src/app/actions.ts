'use server';

import { generateFishBehavior, type GenerateFishBehaviorInput, type GenerateFishBehaviorOutput } from '@/ai/flows/generate-fish-behavior';

export async function getFishBehavior(input: GenerateFishBehaviorInput): Promise<GenerateFishBehaviorOutput> {
    try {
        const output = await generateFishBehavior(input);
        return output;
    } catch (error) {
        console.error("Error generating fish behavior:", error);
        throw new Error("Failed to generate fish behavior from AI.");
    }
}
