'use client';

import { useState, useEffect } from 'react';
import type { GenerateFishBehaviorOutput, FishBehavior, CustomFish } from '@/lib/types';
import { generateFishImage } from '@/ai/flows/generate-fish-image';
import { removeImageBackground } from '@/ai/flows/remove-background-flow';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

import { Controls } from './controls';
import { FishTank } from './fishtank';

const TANK_DIMENSIONS = {
    width: 20,
    height: 10,
    depth: 10,
};

export default function AquaVidaApp() {
    const [fishCount, setFishCount] = useState(15);
    const [behaviors, setBehaviors] = useState<GenerateFishBehaviorOutput>([]);
    const [customFishImages, setCustomFishImages] = useState<CustomFish[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const generateLocalBehaviors = (count: number, dimensions: typeof TANK_DIMENSIONS): GenerateFishBehaviorOutput => {
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

    useEffect(() => {
        const initialProceduralFish = generateLocalBehaviors(fishCount, TANK_DIMENSIONS);
        setBehaviors(initialProceduralFish);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFishCountChange = (count: number) => {
        setFishCount(count);
        const proceduralFish = generateLocalBehaviors(count, TANK_DIMENSIONS);
        setBehaviors(proceduralFish);
    };

    const handleImageUpload = async (dataUrl: string) => {
        setIsUploading(true);
        toast({
            title: "Processing your fish...",
            description: "The AI is removing the background from your image.",
        });
        try {
            const processedImage = await removeImageBackground(dataUrl);
            setCustomFishImages(prev => [...prev, { id: uuidv4(), url: processedImage }]);
            toast({
                title: "Success!",
                description: "Your custom fish has been added to the tank.",
            });
        } catch (error) {
            console.error("Failed to process image:", error);
            toast({
                variant: "destructive",
                title: "Image Processing Failed",
                description: "There was a problem processing your image. Please try another one.",
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        toast({
            title: "Generating new AI fish...",
            description: "The AI is creating a new fish image. Please wait.",
        });
        try {
            const newImage = await generateFishImage();
            setCustomFishImages(prev => [...prev, { id: uuidv4(), url: newImage }]);

            toast({
                title: "Success!",
                description: "A new AI-powered fish has been added to the tank.",
            });
        } catch (error) {
            console.error("Failed to generate fish image:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with the AI generation. Please check your API key and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setBehaviors(generateLocalBehaviors(fishCount, TANK_DIMENSIONS));
        setCustomFishImages([]);
        toast({
            title: "Simulation Reset",
            description: "The fish tank has been reset to its default state.",
        });
    };

    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
            <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary-foreground/80 font-headline z-10 select-none pointer-events-none">
                AquaVida
            </h1>
            <div className="relative flex-1">
                <FishTank 
                    behaviors={behaviors} 
                    tankDimensions={TANK_DIMENSIONS} 
                    customFishImages={customFishImages} 
                />
            </div>
            <Controls 
                fishCount={fishCount}
                onFishCountChange={handleFishCountChange}
                onImageUpload={handleImageUpload}
                onGenerate={handleGenerate}
                onReset={handleReset}
                isLoading={isLoading}
                isUploading={isUploading}
            />
        </div>
    );
}
