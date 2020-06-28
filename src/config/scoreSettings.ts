import { PositionMap } from "../models/PositionMap";

export interface WeightSettingWithMin {
  max: number;
  weight: number;
  min: number;
}

export interface WeightSetting {
  max: number;
  weight: number;
}

export interface ScoreSettings {
  weights: {
    form: WeightSetting;
    pointsPerGame: WeightSetting;
    ictIndex: WeightSetting;
    teamStrength: WeightSettingWithMin;
    teamStrengthForPosition: WeightSettingWithMin;
    opponentStrength: WeightSettingWithMin;
    futureOpponentStrength: WeightSettingWithMin;
    chanceOfPlaying: WeightSetting;
    numberOfGames: WeightSetting;
    numberOfGamesInNext3Gameweeks: WeightSettingWithMin;
  };
  positionPenalty: number;
  homeAdvantage: number;
}

const commonInputsSettings = {
  numberOfGames: { max: 2, weight: 45 },
  numberOfGamesInNext3Gameweeks: { max: 6, weight: 30, min: 2 },
};

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
    ...commonInputsSettings,
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
    ...commonInputsSettings,
  },
  positionPenalty: 0,
  homeAdvantage: 1,
};

export const getScoreSettingsForPlayer = (player: PlayerOverview): ScoreSettings =>
  player.element_type === PositionMap.GOALKEEPER || player.element_type === PositionMap.DEFENDER
    ? defenderSettings
    : attackerSettings;
