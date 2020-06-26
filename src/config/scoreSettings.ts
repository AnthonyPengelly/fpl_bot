import { PositionMap } from "../models/PositionMap";

const defenderSettings = {
  weights: {
    form: { max: 8, weight: 20 },
    ictIndex: { max: 450, weight: 10 },
    teamStrength: { max: 5, weight: 15, min: 2 },
    teamStrengthForPosition: { max: 1350, weight: 20, min: 950 },
    opponentStrength: { max: 5, weight: 20, min: 2 },
    futureOpponentStrength: { max: 5, weight: 15, min: 2 },
    chanceOfPlaying: { max: 100, weight: 50 },
  },
  positionPenalty: 2, // Defenders and goalkeepers are inherently less valuable in FPL
};

const attackerSettings = {
  weights: {
    form: { max: 8, weight: 25 },
    ictIndex: { max: 450, weight: 25 },
    teamStrength: { max: 5, weight: 15, min: 2 },
    teamStrengthForPosition: { max: 1350, weight: 10, min: 950 },
    opponentStrength: { max: 5, weight: 15, min: 2 },
    futureOpponentStrength: { max: 5, weight: 10, min: 2 },
    chanceOfPlaying: { max: 100, weight: 50 },
  },
  positionPenalty: 0,
};

const commonInputsSettings = {
  weights: {
    numberOfGames: { max: 2, weight: 45 },
    numberOfGamesInNext3Gameweeks: { max: 6, weight: 30, min: 2 },
  },
};

export const getScoreSettingsForPlayer = (player: PlayerOverview) =>
  player.element_type === PositionMap.GOALKEEPER || player.element_type === PositionMap.DEFENDER
    ? defenderSettings
    : attackerSettings;

export const getCommonInputsSettings = () => commonInputsSettings;
