'use client';

import { useState, useEffect } from 'react';
import type { GenerateFishBehaviorOutput, FishBehavior } from '@/lib/types';

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

    useEffect(() => {
        setBehaviors(generateLocalBehaviors(fishCount, TANK_DIMENSIONS));
    }, [fishCount]);

    const handleImageUpload = (dataUrl: string) => {
        setCustomFishImages(prev => [...prev, dataUrl]);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-background">
            <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary-foreground/80 font-headline z-10 select-none pointer-events-none">
                AquaVida
            </h1>
            <Controls 
                fishCount={fishCount}
                onFishCountChange={setFishCount}
                onImageUpload={handleImageUpload}
            />
            <FishTank 
                behaviors={behaviors} 
                tankDimensions={TANK_DIMENSIONS} 
                customFishImages={customFishImages} 
            />
        </div>
    );
}
