import PlayerScore from "./PlayerScore";

export interface TransferWithScores {
  playersIn: PlayerScore[];
  playersOut: PlayerScore[];
  scoreImprovement: number;
}
