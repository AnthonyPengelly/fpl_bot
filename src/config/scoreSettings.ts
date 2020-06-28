import { PositionMap } from "../models/PositionMap";

export interface ScoreSettings {
  weights: {
    form: { max: number; weight: number };
    pointsPerGame: { max: number; weight: number };
    ictIndex: { max: number; weight: number };
    teamStrength: { max: number; weight: number; min: number };
    teamStrengthForPosition: { max: number; weight: number; min: number };
    opponentStrength: { max: number; weight: number; min: number };
    futureOpponentStrength: { max: number; weight: number; min: number };
    chanceOfPlaying: { max: number; weight: number };
  };
  positionPenalty: number;
  homeAdvantage: number;
}

const defenderSettings: ScoreSettings = {
  weights: {
    form: { max: 8, weight: 23 },
    pointsPerGame: { max: 6, weight: 15 },
    ictIndex: { max: 450, weight: 10 },
    teamStrength: { max: 5, weight: 10, min: 2 },
    teamStrengthForPosition: { max: 1350, weight: 15, min: 950 },
    opponentStrength: { max: 5 + 2, weight: 15, min: 2 }, // home advantage to max opp strength
    futureOpponentStrength: { max: 5 + 2, weight: 12, min: 2 },
    chanceOfPlaying: { max: 100, weight: 50 },
  },
  positionPenalty: 2, // Defenders and goalkeepers are inherently less valuable in FPL
  homeAdvantage: 2,
};

const attackerSettings: ScoreSettings = {
  weights: {
    form: { max: 8, weight: 30 },
    pointsPerGame: { max: 6, weight: 15 },
    ictIndex: { max: 450, weight: 22 },
    teamStrength: { max: 5, weight: 5, min: 2 },
    teamStrengthForPosition: { max: 1350, weight: 5, min: 950 },
    opponentStrength: { max: 5 + 1, weight: 13, min: 2 }, // home advantage to max opp strength
    futureOpponentStrength: { max: 5 + 1, weight: 10, min: 2 },
    chanceOfPlaying: { max: 100, weight: 50 },
  },
  positionPenalty: 0,
  homeAdvantage: 1,
};

const commonInputsSettings = {
  weights: {
    numberOfGames: { max: 2, weight: 45 },
    numberOfGamesInNext3Gameweeks: { max: 6, weight: 30, min: 2 },
  },
};

export const getScoreSettingsForPlayer = (player: PlayerOverview): ScoreSettings =>
  player.element_type === PositionMap.GOALKEEPER || player.element_type === PositionMap.DEFENDER
    ? defenderSettings
    : attackerSettings;

export const getCommonInputsSettings = () => commonInputsSettings;
