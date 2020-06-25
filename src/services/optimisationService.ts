import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import TeamValidator from "./teamValidator";

export default class OptimisationService {
  constructor(private teamValidator: TeamValidator) {}

  getOptimalTeamForSettings = (
    players: PlayerScore[],
    settings: OptimisationSettings,
    budget: number,
    otherPlayersInTeam: PlayerScore[] = []
  ) => {
    const W = (budget - settings.budgetOffset) * 100;
    let cache: PlayerScore[][][] = [];
    for (let g = 0; g < players.length + 1; g++) {
      cache[g] = [];
      for (let h = 0; h < W + 1; h++) {
        cache[g][h] = [];
      }
    }

    for (let i = 0; i < players.length + 1; i++) {
      for (let j = 0; j < W + 1; j++) {
        if (i === 0 || j === 0) cache[i][j] = [];
        else if (Math.round(players[i - 1].value * 100) <= j) {
          const included = cache[i - 1][j - Math.round(players[i - 1].value * 100)].concat(
            players[i - 1]
          );
          const excluded = cache[i - 1][j];
          cache[i][j] =
            included.reduce((total, player) => total + Math.round(player.score * 100), 0) >
              excluded.reduce((total, player) => total + Math.round(player.score * 100), 0) &&
            this.teamValidator.isValid(included, settings, otherPlayersInTeam)
              ? included
              : excluded;
        } else {
          cache[i][j] = cache[i - 1][j];
        }
      }
    }
    return cache[players.length][W];
  };
}
