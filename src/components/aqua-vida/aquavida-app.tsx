'use client';

import { useState, useEffect } from 'react';
import type { GenerateFishBehaviorOutput, FishBehavior, GenerateFishBehaviorInput } from '@/lib/types';
import { generateFishBehavior } from '@/ai/flows/generate-fish-behavior';
import { useToast } from "@/hooks/use-toast";

import { Controls } from './controls';
import { FishTank } from './fishtank';

const TANK_DIMENSIONS = {
    width: 20,
    height: 10,
    depth: 10,
};

function generateLocalBehaviors(count: number, dimensions: typeof TANK_DIMENSIONS): GenerateFishBehaviorOutput {
    const behaviors: FishBehavior[] = [];
    for (let i = 0; i < count; i++) {
        behaviors.push({
            id: i,
            startPosition: {
                x: (Math.random() - 0.5) * dimensions.width * 0.9,
                y: (Math.random() - 0.5) * dimensions.height * 0.9,
                z: (Math.random() - 0.5) * dimensions.depth * 0.9,
            },
            swimmingPattern: 'procedural',
        });
    }
    return behaviors;
}

// Helper to ensure all fish have a unique ID, which is crucial for React keys and Three.js object tracking.
const assignUniqueIds = (behaviors: FishBehavior[]): FishBehavior[] => {
    return behaviors.map((b, index) => ({ ...b, id: index }));
};

export default function AquaVidaApp() {
    const [fishCount, setFishCount] = useState(15);
    const [behaviors, setBehaviors] = useState<GenerateFishBehaviorOutput>([]);
    const [customFishImages, setCustomFishImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Generate initial procedural fish on mount
        const initialProceduralFish = generateLocalBehaviors(fishCount, TANK_DIMENSIONS);
        setBehaviors(assignUniqueIds(initialProceduralFish));
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFishCountChange = (count: number) => {
        setFishCount(count);
        setBehaviors(prevBehaviors => {
            // Keep AI-generated fish, replace procedural ones
            const aiFish = prevBehaviors.filter(b => b.swimmingPattern !== 'procedural');
            const newProceduralFish = generateLocalBehaviors(count, TANK_DIMENSIONS);
            return assignUniqueIds([...aiFish, ...newProceduralFish]);
        });
    };

    const handleImageUpload = (dataUrl: string) => {
        setCustomFishImages(prev => [...prev, dataUrl]);
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        toast({
            title: "Generating new fish...",
            description: "The AI is creating new swimming patterns. Please wait.",
        });
        try {
            const input: GenerateFishBehaviorInput = {
                fishCount,
                tankDimensions: TANK_DIMENSIONS,
            };
            const newAiBehaviors = await generateFishBehavior(input);
            
            setBehaviors(prevBehaviors => {
                // Keep procedural fish, replace AI-generated ones
                const proceduralFish = prevBehaviors.filter(b => b.swimmingPattern === 'procedural');
                return assignUniqueIds([...proceduralFish, ...newAiBehaviors]);
            });

            toast({
                title: "Success!",
                description: "New AI-powered fish have been added to the tank.",
            });
        } catch (error) {
            console.error("Failed to generate fish behavior:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with the AI generation. Please check your API key and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-background">
            <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary-foreground/80 font-headline z-10 select-none pointer-events-none">
                AquaVida
            </h1>
            <Controls 
                fishCount={fishCount}
                onFishCountChange={handleFishCountChange}
                onImageUpload={handleImageUpload}
                onGenerate={handleGenerate}
                isLoading={isLoading}
            />
            <FishTank 
                behaviors={behaviors} 
                tankDimensions={TANK_DIMENSIONS} 
                customFishImages={customFishImages} 
            />
        </div>
    );
}
