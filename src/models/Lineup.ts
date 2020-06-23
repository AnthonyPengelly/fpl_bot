import PlayerScore from "./PlayerScore";

export interface Lineup {
  starting11: PlayerScore[];
  orderedSubs: PlayerScore[];
  captain: PlayerScore;
  viceCaptain: PlayerScore;
}
