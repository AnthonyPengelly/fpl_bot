import { PositionMap } from "../models/PositionMap";

const defenderWeightings = {
  form: { max: 8, weight: 20 },
  ictIndex: { max: 450, weight: 10 },
  teamStrength: { max: 5, weight: 15, min: 2 },
  teamStrengthForPosition: { max: 1500, weight: 20, min: 950 },
  opponentStrength: { max: 5, weight: 20, min: 2 },
  futureOpponentStrength: { max: 5, weight: 15, min: 2 },
  chanceOfPlaying: { max: 100, weight: 50 },
};

const attackerWeightings = {
  form: { max: 8, weight: 25 },
  ictIndex: { max: 450, weight: 25 },
  teamStrength: { max: 5, weight: 15, min: 2 },
  teamStrengthForPosition: { max: 1500, weight: 10, min: 950 },
  opponentStrength: { max: 5, weight: 15, min: 2 },
  futureOpponentStrength: { max: 5, weight: 10, min: 2 },
  chanceOfPlaying: { max: 100, weight: 50 },
};

const commonWeightings = {
  numberOfGames: { max: 2, weight: 45 },
  numberOfGamesInNext3Gameweeks: { max: 6, weight: 30, min: 2 },
};

export const getWeightingsForPlayer = (player: PlayerOverview) =>
  player.element_type === PositionMap.GOALKEEPER ||
  player.element_type === PositionMap.DEFENDER
    ? defenderWeightings
    : attackerWeightings;

export const getCommonWeightings = () => commonWeightings;
