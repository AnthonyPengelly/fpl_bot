import PlayerScore from "./PlayerScore";

export interface Transaction {
  playerOut: PlayerScore;
  playersIn: TransactionPlayerIn[];
}

export interface TransactionPlayerIn {
  player: PlayerScore;
  improvement: number;
}
