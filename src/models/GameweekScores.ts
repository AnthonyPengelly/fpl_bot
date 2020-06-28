interface GameweekScores {
  event: number;
  playerData: {
    name: string;
    id: number;
    code: number;
    team: number;
    position: string;
    score: number;
    value: number;
    scoreDetails: ScoreDetails;
  }[];
}
