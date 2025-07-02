'use client';

import { useRef } from 'react';
import { Loader2, Camera } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ControlsProps {
    fishCount: number;
    onFishCountChange: (count: number) => void;
    onImageUpload: (dataUrl: string) => void;
    onGenerate: () => void;
    onReset: () => void;
    onUseCamera: () => void;
    isLoading: boolean;
    isUploading: boolean;
    statusMessage: string | null;
    statusIsError: boolean;
}

export function Controls({ 
    fishCount, 
    onFishCountChange, 
    onImageUpload, 
    onGenerate, 
    onReset, 
    onUseCamera,
    isLoading, 
    isUploading, 
    statusMessage,
    statusIsError
}: ControlsProps) {
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
        <div className="z-20 border-t bg-card/80 backdrop-blur-sm">
             <div className="h-8 flex items-center justify-center text-center px-4">
                {statusMessage && (
                    <p className={cn(
                        "text-sm font-medium",
                        statusIsError ? "text-destructive" : "text-muted-foreground"
                    )}>
                        {statusMessage}
                    </p>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 p-4 pt-0">
                <div className="flex items-center gap-4">
                    <div className="space-y-2 w-48">
                        <Label htmlFor="fish-count">Procedural Fish: <span className="font-bold text-primary-foreground">{fishCount}</span></Label>
                        <Slider
                            id="fish-count"
                            min={1}
                            max={50}
                            step={1}
                            value={[fishCount]}
                            onValueChange={(value) => onFishCountChange(value[0])}
                            disabled={isLoading || isUploading}
                        />
                    </div>
                    <Button onClick={onReset} variant="outline" disabled={isLoading || isUploading}>Reset</Button>
                </div>
            
                <Separator orientation="vertical" className="h-10" />

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleUploadClick} variant="outline" className="w-full" disabled={isUploading || isLoading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isUploading ? 'Processing...' : 'Upload Fish'}
                        </Button>
                        <Input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg"
                        />
                    </div>
                    <Button onClick={onUseCamera} variant="outline" disabled={isLoading || isUploading}>
                        <Camera className="mr-2 h-4 w-4" />
                        Use Camera
                    </Button>
                    <Button onClick={onGenerate} disabled={isLoading || isUploading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate AI Fish
                    </Button>
                </div>
            </div>
        </div>
    );
}
