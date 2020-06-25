interface ScoreDetails {
  score: number;
  inputs: ScoreInputs;
  weightedInputs: ScoreInputs;
  weights: { [weight: string]: { min?: number; max: number; weight: number } };
}
