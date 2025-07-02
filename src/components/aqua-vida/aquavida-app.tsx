'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GenerateFishBehaviorOutput } from '@/ai/flows/generate-fish-behavior';
import { getFishBehavior } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Controls } from './controls';
import { FishTank } from './fishtank';
import { Loader2 } from 'lucide-react';

const TANK_DIMENSIONS = {
    width: 20,
    height: 10,
    depth: 10,
};

export default function AquaVidaApp() {
    const [fishCount, setFishCount] = useState(15);
    const [behaviors, setBehaviors] = useState<GenerateFishBehaviorOutput>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const handleGenerateBehaviors = useCallback(async (count: number) => {
        setIsLoading(true);
        try {
            const newBehaviors = await getFishBehavior({
                tankWidth: TANK_DIMENSIONS.width,
                tankHeight: TANK_DIMENSIONS.height,
                tankDepth: TANK_DIMENSIONS.depth,
                fishCount: count,
            });
            setBehaviors(newBehaviors);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error generating behaviors',
                description: 'The AI could not generate fish behaviors. Please try again later.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        handleGenerateBehaviors(fishCount);
    }, [fishCount, handleGenerateBehaviors]);


    return (
        <div className="relative w-screen h-screen overflow-hidden bg-background">
            <h1 className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold text-primary-foreground/80 font-headline z-10 select-none pointer-events-none">
                AquaVida
            </h1>
            {isLoading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                         <Loader2 className="h-16 w-16 animate-spin text-primary" />
                         <p className="text-primary-foreground/80">AI is generating fish behaviors...</p>
                    </div>
                </div>
            )}
            <Controls 
                fishCount={fishCount}
                onFishCountChange={setFishCount}
                isLoading={isLoading}
            />
            <FishTank behaviors={behaviors} tankDimensions={TANK_DIMENSIONS} />
        </div>
    );
}
