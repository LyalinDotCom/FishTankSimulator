'use client';

import { useState, useEffect } from 'react';
import type { GenerateFishBehaviorOutput, FishBehavior, CustomFish } from '@/lib/types';
import { generateFishImage } from '@/ai/flows/generate-fish-image';
import { removeImageBackground } from '@/ai/flows/remove-background-flow';
import { v4 as uuidv4 } from 'uuid';

import { Controls } from './controls';
import { FishTank } from './fishtank';
import { CameraCapture } from './camera-capture';
import { Toaster } from "@/components/ui/toaster";

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
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusIsError, setStatusIsError] = useState(false);
    const [showCamera, setShowCamera] = useState(false);

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

    const showStatus = (message: string, isError = false, duration = 4000) => {
        setStatusMessage(message);
        setStatusIsError(isError);
        setTimeout(() => {
            setStatusMessage(null);
            setStatusIsError(false);
        }, duration);
    };

    const handleFishCountChange = (count: number) => {
        setFishCount(count);
        const proceduralFish = generateLocalBehaviors(count, TANK_DIMENSIONS);
        setBehaviors(proceduralFish);
    };

    const handleImageUpload = async (dataUrl: string) => {
        setIsUploading(true);
        setStatusMessage("Processing your fish...");
        setStatusIsError(false);
        try {
            const processedImage = await removeImageBackground(dataUrl);
            setCustomFishImages(prev => [...prev, { id: uuidv4(), url: processedImage }]);
            showStatus("Success! Your custom fish has been added to the tank.");
        } catch (error) {
            console.error("Failed to process image:", error);
            showStatus("Image Processing Failed. Please try another one.", true);
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setStatusMessage("Generating new AI fish...");
        setStatusIsError(false);
        try {
            const newImage = await generateFishImage();
            setCustomFishImages(prev => [...prev, { id: uuidv4(), url: newImage }]);
            showStatus("Success! A new AI-powered fish has been added.");
        } catch (error) {
            console.error("Failed to generate fish image:", error);
            showStatus("AI Generation Failed. Please check your API key and try again.", true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setBehaviors(generateLocalBehaviors(fishCount, TANK_DIMENSIONS));
        setCustomFishImages([]);
        showStatus("Simulation Reset. The tank has been returned to its default state.");
    };

    const handlePhotoTaken = async (dataUrl: string) => {
        setShowCamera(false);
        await handleImageUpload(dataUrl);
    };

    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
            <Toaster />
            <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary-foreground/80 font-headline z-10 select-none pointer-events-none">
                AquaVida
            </h1>
            <div className="relative flex-1">
                <FishTank 
                    behaviors={behaviors} 
                    tankDimensions={TANK_DIMENSIONS} 
                    customFishImages={customFishImages} 
                />
                {showCamera && (
                    <CameraCapture 
                        onPhotoTaken={handlePhotoTaken}
                        onClose={() => setShowCamera(false)}
                    />
                )}
            </div>
            <Controls 
                fishCount={fishCount}
                onFishCountChange={handleFishCountChange}
                onImageUpload={handleImageUpload}
                onGenerate={handleGenerate}
                onReset={handleReset}
                onUseCamera={() => setShowCamera(true)}
                isLoading={isLoading}
                isUploading={isUploading}
                statusMessage={statusMessage}
                statusIsError={statusIsError}
            />
        </div>
    );
}
