export type FishShape = {
  bodyShape: 'ellipsoid' | 'box';
  bodyDimensions: { x: number; y: number; z: number };
  tailShape: 'cone' | 'triangle';
  tailDimensions: { x: number; y: number; z: number };
  dorsalFin: boolean;
};

export type FishBehavior = {
  id: number;
  startPosition: {
    x: number;
    y: number;
    z: number;
  };
  swimmingPattern: string;
  shape?: FishShape;
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
