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

export default function AquaVidaApp() {
    const [fishCount, setFishCount] = useState(15);
    const [behaviors, setBehaviors] = useState<GenerateFishBehaviorOutput>([]);
    const [customFishImages, setCustomFishImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Generate initial fish on mount
        setBehaviors(generateLocalBehaviors(fishCount, TANK_DIMENSIONS));
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFishCountChange = (count: number) => {
        setFishCount(count);
        setBehaviors(generateLocalBehaviors(count, TANK_DIMENSIONS));
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
            const newBehaviors = await generateFishBehavior(input);
            setBehaviors(newBehaviors);
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
