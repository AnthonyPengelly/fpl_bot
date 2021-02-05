interface ScoreDetails {
  score: number;
  overallScore: number;
  scoreThisWeek: number;
  inputs: ScoreInputs;
  weightedInputs: ScoreInputs;
  weights: { [weight: string]: { min?: number; max: number; weight: number } };
}
