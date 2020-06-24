import {
  getCommonWeightings,
  getWeightingsForPlayer,
} from "../config/scoreWeightings";
import { PositionMap } from "../models/PositionMap";

export default class ScoreService {
  static calculateScore(
    player: PlayerOverview,
    team: Team,
    opponentFixtures: OpponentFixture[],
    futureFixtures: OpponentFixture[]
  ) {
    const weightings = getWeightingsForPlayer(player);
    const commonWeightings = getCommonWeightings();
    let score = 0;
    score += (player.form * weightings.form.weight) / weightings.form.max;
    score +=
      (player.ict_index * weightings.ictIndex.weight) / weightings.ictIndex.max;
    score +=
      (team.strength * weightings.teamStrength.weight) /
      weightings.teamStrength.max;
    score +=
      (this.teamStrengthForPosition(player, team, opponentFixtures) *
        weightings.teamStrengthForPosition.weight) /
      weightings.teamStrengthForPosition.max;
    score +=
      (this.getOpponentAverageStrength(opponentFixtures) *
        weightings.opponentStrength.weight) /
      weightings.opponentStrength.max;
    score +=
      (this.getOpponentAverageStrength(futureFixtures) *
        weightings.futureOpponentStrength.weight) /
      weightings.futureOpponentStrength.max;

    const maxScore = Object.values(weightings).reduce(
      (total, weight) => total + weight.weight,
      0
    );
    const normalisedScore =
      player.chance_of_playing_next_round * (score / maxScore);

    let commonWeightingsScore = 0;
    commonWeightingsScore +=
      (opponentFixtures.length * commonWeightings.numberOfGames.weight) /
      commonWeightings.numberOfGames.max;
    commonWeightingsScore +=
      (futureFixtures.length *
        commonWeightings.numberOfGamesInNext3Gameweeks.weight) /
      commonWeightings.numberOfGamesInNext3Gameweeks.max;

    const commonWeightingsMax = Object.values(commonWeightings).reduce(
      (total, weight) => total + weight.weight,
      0
    );
    const totalWeight = maxScore + commonWeightingsMax;

    const normalisedCommonScore =
      player.chance_of_playing_next_round *
      (commonWeightingsScore / commonWeightingsMax);

    return (
      (normalisedScore * (totalWeight - commonWeightingsMax)) / totalWeight +
      (normalisedCommonScore * commonWeightingsMax) / totalWeight
    );
  }

  private static teamStrengthForPosition(
    player: PlayerOverview,
    team: Team,
    fixtures: OpponentFixture[]
  ) {
    if (fixtures.length === 0) {
      return player.element_type === PositionMap.GOALKEEPER ||
        player.element_type === PositionMap.DEFENDER
        ? team.strength_defence_home
        : team.strength_attack_home;
    }
    return (
      fixtures.reduce(
        (total, fixture) =>
          total + player.element_type === PositionMap.GOALKEEPER ||
          player.element_type === PositionMap.DEFENDER
            ? fixture.isHome
              ? team.strength_defence_home
              : team.strength_defence_away
            : fixture.isHome
            ? team.strength_attack_home
            : team.strength_attack_away,
        0
      ) / fixtures.length
    );
  }

  private static getOpponentAverageStrength(fixtures: OpponentFixture[]) {
    if (fixtures.length === 0) {
      return 3;
    }
    return (
      fixtures.reduce(
        (total, fixture) => total + fixture.opponent.strength,
        0
      ) / fixtures.length
    );
  }
}
