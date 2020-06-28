import { getScoreSettingsForPlayer, ScoreSettings, WeightSetting } from "../config/scoreSettings";
import { PositionMap } from "../models/PositionMap";

export default class ScoreService {
  static calculateScore(
    player: PlayerOverview,
    team: Team,
    opponentFixtures: OpponentFixture[],
    futureFixtures: OpponentFixture[],
    gamesPlayed: number,
    previousScore?: ScoreDetails
  ) {
    const settings = getScoreSettingsForPlayer(player);
    const weights = settings.weights;
    const inputs: ScoreInputs = {
      form: this.getForm(player, gamesPlayed, previousScore),
      pointsPerGame: player.points_per_game,
      ictIndex: player.ict_index,
      teamStrength: team.strength,
      teamStrengthForPosition: this.teamStrengthForPosition(player, team, opponentFixtures),
      opponentStrength: this.getOpponentAverageStrength(opponentFixtures, settings),
      futureOpponentStrength: this.getOpponentAverageStrength(futureFixtures, settings),
      chanceOfPlaying:
        player.chance_of_playing_next_round === null ? 80 : player.chance_of_playing_next_round,
      numberOfGames: opponentFixtures.length,
      numberOfGamesInNext3Gameweeks: futureFixtures.length,
    };

    const weightedInputs = this.calculateWeightedInputs(inputs, settings);
    const score = Object.values(weightedInputs).reduce((total, value) => total + value, 0);

    const totalWeight = this.getTotalWeight(settings);

    const overallScore = (100 * score) / totalWeight;
    const scoreWithPositionPenalty = overallScore - settings.positionPenalty;

    return {
      score: scoreWithPositionPenalty >= 0 ? scoreWithPositionPenalty : 0,
      overallScore: overallScore,
      inputs: inputs,
      weightedInputs: weightedInputs,
      weights: weights,
    } as ScoreDetails;
  }

  private static getForm(
    player: PlayerOverview,
    gamesPlayed: number,
    previousScore?: ScoreDetails
  ) {
    if (gamesPlayed < 4 && previousScore) {
      return (player.form + 3 * previousScore.inputs.form) / 4;
    }
    return player.form;
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
          total +
          (player.element_type === PositionMap.GOALKEEPER ||
          player.element_type === PositionMap.DEFENDER
            ? fixture.isHome
              ? team.strength_defence_home
              : team.strength_defence_away
            : fixture.isHome
            ? team.strength_attack_home
            : team.strength_attack_away),
        0
      ) / fixtures.length
    );
  }

  private static getOpponentAverageStrength(fixtures: OpponentFixture[], settings: ScoreSettings) {
    if (fixtures.length === 0) {
      return (settings.weights.opponentStrength.max - settings.weights.opponentStrength.min) / 2;
    }
    return (
      fixtures.reduce(
        (total, fixture) =>
          total + fixture.opponent.strength + (!fixture.isHome ? settings.homeAdvantage : 0),
        0
      ) / fixtures.length
    );
  }

  private static calculateWeightedInputs(inputs: ScoreInputs, settings: ScoreSettings) {
    const weights = settings.weights;
    const weightedInputs = {} as ScoreInputs;
    weightedInputs.form = (inputs.form * weights.form.weight) / weights.form.max;

    weightedInputs.pointsPerGame =
      (inputs.pointsPerGame * weights.pointsPerGame.weight) / weights.pointsPerGame.max;

    weightedInputs.ictIndex = (inputs.ictIndex * weights.ictIndex.weight) / weights.ictIndex.max;

    weightedInputs.teamStrength =
      ((inputs.teamStrength - weights.teamStrength.min) * weights.teamStrength.weight) /
      (weights.teamStrength.max - weights.teamStrength.min);

    weightedInputs.teamStrengthForPosition =
      ((inputs.teamStrengthForPosition - weights.teamStrengthForPosition.min) *
        weights.teamStrengthForPosition.weight) /
      (weights.teamStrengthForPosition.max - weights.teamStrengthForPosition.min);

    weightedInputs.opponentStrength =
      ((weights.opponentStrength.max - inputs.opponentStrength) * weights.opponentStrength.weight) /
      (weights.opponentStrength.max - weights.opponentStrength.min);

    weightedInputs.futureOpponentStrength =
      ((weights.futureOpponentStrength.max - inputs.futureOpponentStrength) *
        weights.futureOpponentStrength.weight) /
      (weights.futureOpponentStrength.max - weights.futureOpponentStrength.min);

    weightedInputs.chanceOfPlaying =
      (inputs.chanceOfPlaying * weights.chanceOfPlaying.weight) / weights.chanceOfPlaying.max;

    weightedInputs.numberOfGames =
      (inputs.numberOfGames * weights.numberOfGames.weight) / weights.numberOfGames.max;

    weightedInputs.numberOfGamesInNext3Gameweeks =
      ((inputs.numberOfGamesInNext3Gameweeks - weights.numberOfGamesInNext3Gameweeks.min) *
        weights.numberOfGamesInNext3Gameweeks.weight) /
      (weights.numberOfGamesInNext3Gameweeks.max - weights.numberOfGamesInNext3Gameweeks.min);
    return weightedInputs;
  }

  private static getTotalWeight(settings: ScoreSettings) {
    return Object.values(settings.weights).reduce((total, weight) => total + weight.weight, 0);
  }
}
