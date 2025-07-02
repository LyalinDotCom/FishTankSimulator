'use client';

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ControlsProps {
    fishCount: number;
    onFishCountChange: (count: number) => void;
    onImageUpload: (dataUrl: string) => void;
}

export function Controls({ fishCount, onFishCountChange, onImageUpload }: ControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onImageUpload(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

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
                <div className="space-y-3">
                    <Label>Add Your Fish</Label>
                    <Button onClick={handleUploadClick} variant="outline" className="w-full">Upload Image</Button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
