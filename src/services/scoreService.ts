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
      pointsPerGame: parseFloat(player.points_per_game),
      ictIndex: player.ict_index_rank,
      teamStrength: team.strength,
      teamStrengthForPosition: this.teamStrengthForPosition(player, team, opponentFixtures),
      opponentStrength: this.getOpponentAverageStrength(opponentFixtures, settings),
      futureOpponentStrength: this.getOpponentAverageStrength(futureFixtures, settings),
      chanceOfPlaying:
        // I think any injuries/suspensions will be reported explicitly, so if it is null,
        // it's probably meant to be 100% chance of playing
        player.chance_of_playing_next_round === null ? 100 : player.chance_of_playing_next_round,
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
    const form = parseFloat(player.form);
    if (gamesPlayed < 4 && previousScore) {
      const previousForm =
        typeof previousScore.inputs.form === "string"
          ? parseFloat(previousScore.inputs.form)
          : previousScore.inputs.form;
      return (form + 3 * previousForm) / 4;
    }
    return form;
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
    weightedInputs.form = this.calculateCappedWeight(
      inputs.form,
      weights.form.weight,
      weights.form.max
    );
    weightedInputs.pointsPerGame = this.calculateCappedWeight(
      inputs.pointsPerGame,
      weights.pointsPerGame.weight,
      weights.pointsPerGame.max
    );
    weightedInputs.ictIndex = this.calculateCappedWeight(
      weights.ictIndex.max - inputs.ictIndex,
      weights.ictIndex.weight,
      weights.ictIndex.max
    );
    weightedInputs.teamStrength = this.calculateCappedWeight(
      inputs.teamStrength - weights.teamStrength.min,
      weights.teamStrength.weight,
      weights.teamStrength.max - weights.teamStrength.min
    );
    weightedInputs.teamStrengthForPosition = this.calculateCappedWeight(
      inputs.teamStrengthForPosition - weights.teamStrengthForPosition.min,
      weights.teamStrengthForPosition.weight,
      weights.teamStrengthForPosition.max - weights.teamStrengthForPosition.min
    );
    weightedInputs.opponentStrength = this.calculateCappedWeight(
      weights.opponentStrength.max - inputs.opponentStrength,
      weights.opponentStrength.weight,
      weights.opponentStrength.max - weights.opponentStrength.min
    );
    weightedInputs.futureOpponentStrength = this.calculateCappedWeight(
      weights.futureOpponentStrength.max - inputs.futureOpponentStrength,
      weights.futureOpponentStrength.weight,
      weights.futureOpponentStrength.max - weights.futureOpponentStrength.min
    );
    weightedInputs.chanceOfPlaying = this.calculateCappedWeight(
      inputs.chanceOfPlaying,
      weights.chanceOfPlaying.weight,
      weights.chanceOfPlaying.max
    );

    // Don't cap these two. If they exceed the max, then they deserve it!
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

  private static calculateCappedWeight(input: number, weight: number, max: number): number {
    if (input > max) {
      return weight;
    }
    return (input * weight) / max;
  }
}
