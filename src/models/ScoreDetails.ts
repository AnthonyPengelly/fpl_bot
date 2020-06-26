interface ScoreDetails {
  score: number;
  overallScore: number;
  inputs: ScoreInputs;
  weightedInputs: ScoreInputs;
  weights: { [weight: string]: { min?: number; max: number; weight: number } };
}
