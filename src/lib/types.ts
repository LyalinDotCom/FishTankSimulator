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

export type GenerateFishBehaviorInput = {
  fishCount: number;
  tankDimensions: {
    width: number;
    height: number;
    depth: number;
  };
};
