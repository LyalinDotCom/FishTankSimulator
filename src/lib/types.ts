export type FishBehavior = {
  id: number;
  startPosition: {
    x: number;
    y: number;
    z: number;
  };
  swimmingPattern: string;
};

export type GenerateFishBehaviorOutput = FishBehavior[];
