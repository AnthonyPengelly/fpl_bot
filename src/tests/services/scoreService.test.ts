import { getScoreSettingsForPlayer, getCommonInputsSettings } from "../../config/scoreSettings";
import ScoreService from "../../services/scoreService";

const basePlayer = {
  form: 0,
  ict_index: 0,
  chance_of_playing_next_round: 0,
  element_type: 1,
  points_per_game: 0,
} as PlayerOverview;

const scoreSettings = getScoreSettingsForPlayer(basePlayer);
const commonInputsSettings = getCommonInputsSettings();
const maxScore = Object.values(scoreSettings.weights).reduce(
  (total, weight) => total + weight.weight,
  0
);
const maxCommonInputsScore = Object.values(commonInputsSettings.weights).reduce(
  (total, weight) => total + weight.weight,
  0
);
const totalWeight = maxScore + maxCommonInputsScore;

const baseTeam = {
  strength: scoreSettings.weights.teamStrength.min,
  strength_defence_home: scoreSettings.weights.teamStrengthForPosition.min,
  strength_defence_away: scoreSettings.weights.teamStrengthForPosition.min,
  strength_attack_home: scoreSettings.weights.teamStrengthForPosition.min,
  strength_attack_away: scoreSettings.weights.teamStrengthForPosition.min,
  strength_overall_home: scoreSettings.weights.teamStrengthForPosition.min,
  strength_overall_away: scoreSettings.weights.teamStrengthForPosition.min,
} as Team;

const getOpponent = (strength: number, isHome: boolean): OpponentFixture => ({
  opponent: { ...baseTeam, strength: strength },
  isHome: isHome,
});

describe("scoreService", () => {
  test("Calculates form correctly", () => {
    const player = { ...basePlayer, form: scoreSettings.weights.form.max };
    const expectedScoreFromPlayer = (100 * scoreSettings.weights.form.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      player,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });
  test("Calculates points per game correctly", () => {
    const player = { ...basePlayer, points_per_game: scoreSettings.weights.pointsPerGame.max };
    const expectedScoreFromPlayer =
      (100 * scoreSettings.weights.pointsPerGame.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      player,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates ict correctly", () => {
    const player = { ...basePlayer, ict_index: scoreSettings.weights.ictIndex.max };
    const expectedScoreFromPlayer = (100 * scoreSettings.weights.ictIndex.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      player,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates team strength correctly", () => {
    const team = { ...baseTeam, strength: scoreSettings.weights.teamStrength.max };
    const expectedScoreFromPlayer = (100 * scoreSettings.weights.teamStrength.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      team,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates strength for position correctly", () => {
    const team = {
      ...baseTeam,
      strength_defence_away: scoreSettings.weights.teamStrengthForPosition.max,
    };
    const expectedScoreFromPlayer =
      (100 * scoreSettings.weights.teamStrengthForPosition.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      team,
      [
        getOpponent(
          scoreSettings.weights.opponentStrength.max - scoreSettings.homeAdvantage,
          false
        ),
      ],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates chance of playing correctly", () => {
    const player = {
      ...basePlayer,
      chance_of_playing_next_round: scoreSettings.weights.chanceOfPlaying.max,
    };
    const expectedScoreFromPlayer =
      (100 * scoreSettings.weights.chanceOfPlaying.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      player,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates opponent strength correctly", () => {
    const expectedScoreFromPlayer =
      (100 * scoreSettings.weights.opponentStrength.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.min, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates opponent strength for away matches correctly", () => {
    const opponentWeight =
      ((scoreSettings.weights.opponentStrength.max -
        scoreSettings.weights.opponentStrength.min -
        scoreSettings.homeAdvantage) *
        scoreSettings.weights.opponentStrength.weight) /
      (scoreSettings.weights.opponentStrength.max - scoreSettings.weights.opponentStrength.min);
    const expectedScoreFromPlayer = (100 * opponentWeight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.min, false)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates future opponent strength correctly", () => {
    const expectedScoreFromPlayer =
      (100 * scoreSettings.weights.futureOpponentStrength.weight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.min, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates future opponent strength for away games correctly", () => {
    const opponentWeight =
      ((scoreSettings.weights.futureOpponentStrength.max -
        scoreSettings.weights.futureOpponentStrength.min -
        scoreSettings.homeAdvantage) *
        scoreSettings.weights.futureOpponentStrength.weight) /
      (scoreSettings.weights.futureOpponentStrength.max -
        scoreSettings.weights.futureOpponentStrength.min);
    const expectedScoreFromPlayer = (100 * opponentWeight) / totalWeight;
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / 2 / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.min, false)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromPlayer + expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates number of games correctly", () => {
    const expectedScoreFromGames =
      (100 * commonInputsSettings.weights.numberOfGames.weight) / totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      Array.from(Array(commonInputsSettings.weights.numberOfGames.max), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      ),
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.min), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });

  test("Calculates number of games in next 3 gameweeks correctly", () => {
    const expectedScoreFromGames =
      (100 *
        (commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.weight +
          commonInputsSettings.weights.numberOfGames.weight / 2)) /
      totalWeight;

    const result = ScoreService.calculateScore(
      basePlayer,
      baseTeam,
      [getOpponent(scoreSettings.weights.opponentStrength.max, true)],
      Array.from(Array(commonInputsSettings.weights.numberOfGamesInNext3Gameweeks.max), () =>
        getOpponent(scoreSettings.weights.futureOpponentStrength.max, true)
      )
    );

    expect(result.score.toFixed(3)).toBe(
      (expectedScoreFromGames - scoreSettings.positionPenalty).toFixed(3)
    );
  });
});
