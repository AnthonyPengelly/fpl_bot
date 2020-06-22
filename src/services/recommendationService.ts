import { RecommendationSetting } from "../config/recommendationSettings";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";

export default class RecommendationService {
  constructor(private playerScores: PlayerScore[]) {}

  recommendATeam(settings: RecommendationSetting, budget: number) {
    return this.maxKnapsack(this.playerScores, settings, budget);
  }

  private maxKnapsack = (
    players: PlayerScore[],
    settings: RecommendationSetting,
    budget: number
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
          const included = cache[i - 1][
            j - Math.round(players[i - 1].value * 100)
          ].concat(players[i - 1]);
          const excluded = cache[i - 1][j];
          cache[i][j] =
            included.reduce(
              (total, player) => total + Math.round(player.score * 100),
              0
            ) >
              excluded.reduce(
                (total, player) => total + Math.round(player.score * 100),
                0
              ) && !this.breaksRules(included, settings)
              ? included
              : excluded;
        } else {
          cache[i][j] = cache[i - 1][j];
        }
      }
    }
    return cache[players.length][W];
  };

  // TODO players per squad
  private breaksRules = (
    players: PlayerScore[],
    settings: RecommendationSetting
  ) => {
    if (players.length > settings.maxPlayers) {
      return true;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.GOALKEEPER)
        .length > settings.goalkeepers
    ) {
      return true;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.DEFENDER)
        .length > settings.defenders
    ) {
      return true;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.MIDFIELDER)
        .length > settings.midfielders
    ) {
      return true;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.FORWARD)
        .length > settings.forwards
    ) {
      return true;
    }

    if (this.tooManyPlayersFromOneTeam(players, settings)) {
      return true;
    }

    return false;
  };

  private tooManyPlayersFromOneTeam = (
    players: PlayerScore[],
    settings: RecommendationSetting
  ) => {
    const playersPerTeam: { [index: number]: PlayerScore[] } = {};
    players.forEach((playerScore) => {
      playersPerTeam[playerScore.player.team] = playersPerTeam[
        playerScore.player.team
      ]
        ? playersPerTeam[playerScore.player.team].concat(playerScore)
        : [playerScore];
    });

    return (
      Object.values(playersPerTeam).filter(
        (players) => players.length > settings.maxPlayersPerTeam
      ).length !== 0
    );
  };
}
