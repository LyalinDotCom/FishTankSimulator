'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ControlsProps {
    fishCount: number;
    onFishCountChange: (count: number) => void;
}

export function Controls({ fishCount, onFishCountChange }: ControlsProps) {
    return (
        <Card className="absolute top-4 right-4 z-20 w-80 shadow-lg bg-card/80 backdrop-blur-sm border-primary/20">
            <CardHeader>
                <CardTitle>Controls</CardTitle>
                <CardDescription>Adjust the aquarium settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <Label htmlFor="fish-count">Fish Count: <span className="font-bold text-primary-foreground">{fishCount}</span></Label>
                    <Slider
                        id="fish-count"
                        min={1}
                        max={50}
                        step={1}
                        value={[fishCount]}
                        onValueChange={(value) => onFishCountChange(value[0])}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
