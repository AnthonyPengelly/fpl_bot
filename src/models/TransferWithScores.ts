import PlayerScore from "./PlayerScore";

export interface TransferWithScores {
  playerIn: PlayerScore;
  playerOut: PlayerScore;
  scoreImprovement: number;
}
