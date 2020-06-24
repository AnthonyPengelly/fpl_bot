import { PositionMap } from "../models/PositionMap";

const defenderWeightings = {
  form: { max: 8, weight: 3 },
  ictIndex: { max: 450, weight: 1 },
  teamStrength: { max: 5, weight: 2, min: 2 },
  teamStrengthForPosition: { max: 1500, weight: 2, min: 950 },
  opponentStrength: { max: 5, weight: 2, min: 2 },
  futureOpponentStrength: { max: 5, weight: 1.5, min: 2 },
};

const attackerWeightings = {
  form: { max: 8, weight: 3 },
  ictIndex: { max: 450, weight: 2 },
  teamStrength: { max: 5, weight: 1, min: 2 },
  teamStrengthForPosition: { max: 1500, weight: 1, min: 950 },
  opponentStrength: { max: 5, weight: 1, min: 2 },
  futureOpponentStrength: { max: 5, weight: 0.75, min: 2 },
};

const commonWeightings = {
  numberOfGames: { max: 2, weight: 10 },
  numberOfGamesInNext3Gameweeks: { max: 6, weight: 5 },
};

export const getWeightingsForPlayer = (player: PlayerOverview) =>
  player.element_type === PositionMap.GOALKEEPER ||
  player.element_type === PositionMap.DEFENDER
    ? defenderWeightings
    : attackerWeightings;

export const getCommonWeightings = () => commonWeightings;
