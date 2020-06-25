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
    const inputs: ScoreInputs = {
      form: player.form,
      ictIndex: player.ict_index,
      teamStrength: team.strength,
      teamStrengthForPosition: this.teamStrengthForPosition(
        player,
        team,
        opponentFixtures
      ),
      opponentStrength: this.getOpponentAverageStrength(opponentFixtures),
      futureOpponentStrength: this.getOpponentAverageStrength(futureFixtures),
      chanceOfPlaying:
        player.chance_of_playing_next_round === null
          ? 80
          : player.chance_of_playing_next_round,
      numberOfGames: opponentFixtures.length,
      numberOfGamesInNext3Gameweeks: futureFixtures.length,
    };
    const weightedInputs = {} as ScoreInputs;
    weightedInputs.form =
      (inputs.form * weightings.form.weight) / weightings.form.max;

    weightedInputs.ictIndex =
      (inputs.ictIndex * weightings.ictIndex.weight) / weightings.ictIndex.max;

    weightedInputs.teamStrength =
      ((inputs.teamStrength - weightings.teamStrength.min) *
        weightings.teamStrength.weight) /
      (weightings.teamStrength.max - weightings.teamStrength.min);

    weightedInputs.teamStrengthForPosition =
      ((inputs.teamStrengthForPosition -
        weightings.teamStrengthForPosition.min) *
        weightings.teamStrengthForPosition.weight) /
      (weightings.teamStrengthForPosition.max -
        weightings.teamStrengthForPosition.min);

    weightedInputs.opponentStrength =
      ((weightings.opponentStrength.max - inputs.opponentStrength) *
        weightings.opponentStrength.weight) /
      (weightings.opponentStrength.max - weightings.opponentStrength.min);

    weightedInputs.futureOpponentStrength =
      ((weightings.futureOpponentStrength.max - inputs.futureOpponentStrength) *
        weightings.futureOpponentStrength.weight) /
      (weightings.futureOpponentStrength.max -
        weightings.futureOpponentStrength.min);

    weightedInputs.chanceOfPlaying =
      (inputs.chanceOfPlaying * weightings.chanceOfPlaying.weight) /
      weightings.chanceOfPlaying.max;

    const score = Object.values(weightedInputs).reduce(
      (total, value) => total + value,
      0
    );
    const weightingsMax = Object.values(weightings).reduce(
      (total, weight) => total + weight.weight,
      0
    );
    const normalisedScore = 100 * (score / weightingsMax);

    weightedInputs.numberOfGames =
      (inputs.numberOfGames * commonWeightings.numberOfGames.weight) /
      commonWeightings.numberOfGames.max;
    weightedInputs.numberOfGamesInNext3Gameweeks =
      ((inputs.numberOfGamesInNext3Gameweeks -
        commonWeightings.numberOfGamesInNext3Gameweeks.min) *
        commonWeightings.numberOfGamesInNext3Gameweeks.weight) /
      (commonWeightings.numberOfGamesInNext3Gameweeks.max -
        commonWeightings.numberOfGamesInNext3Gameweeks.min);

    const commonWeightingsScore =
      weightedInputs.numberOfGames +
      weightedInputs.numberOfGamesInNext3Gameweeks;
    const commonWeightingsMax = Object.values(commonWeightings).reduce(
      (total, weight) => total + weight.weight,
      0
    );
    const totalWeight = weightingsMax + commonWeightingsMax;

    const normalisedCommonScore =
      100 * (commonWeightingsScore / commonWeightingsMax);

    const finalScore =
      (normalisedScore * weightingsMax) / totalWeight +
      (normalisedCommonScore * commonWeightingsMax) / totalWeight;
    return {
      score: finalScore,
      inputs: inputs,
      weightedInputs: weightedInputs,
      weights: { ...weightings, ...commonWeightings },
    } as ScoreDetails;
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
