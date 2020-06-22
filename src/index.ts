import PlayersService from "./services/playersService";
import PlayerScore from "./models/PlayerScore";
import { PositionMap } from "./models/PositionMap";
import {
  RecommendationSetting,
  fullSquad,
  skeleton442Squad,
  skeleton343Squad,
  skeleton433Squad,
  skeleton532Squad,
} from "./config/recommendationSettings";

console.log("Comparing players...");
let promise = PlayersService.getAllPlayers();
promise.then((players) => {
  players.sort(compareRoi);
  console.log("| ID\t| Value\t\t| Score\t| ROI\t| Position\t| Name");
  players.slice(0, 30).forEach(displayPlayerScore);

  console.log();
  console.log("Recommended Squads");
  console.log("Biggest Scorers");
  const goalkeepers = players
    .filter((player) => player.position.singular_name_short === "GKP")
    .slice(0, 2);
  goalkeepers.forEach(displayPlayerScore);
  const defenders = players
    .filter((player) => player.position.singular_name_short === "DEF")
    .slice(0, 5);
  defenders.forEach(displayPlayerScore);
  const midfielders = players
    .filter((player) => player.position.singular_name_short === "MID")
    .slice(0, 5);
  midfielders.forEach(displayPlayerScore);
  const forwards = players
    .filter((player) => player.position.singular_name_short === "FWD")
    .slice(0, 3);
  forwards.forEach(displayPlayerScore);
  const all = goalkeepers.concat(defenders, midfielders, forwards);
  console.log("15 players");
  console.log(
    `Value £${all
      .reduce((total, player) => total + player.value, 0)
      .toFixed(2)}m`
  );
  console.log(
    `Score: ${all
      .reduce((total, player) => total + player.score, 0)
      .toFixed(2)}`
  );

  console.log();
  console.log("Full Squad");
  calculateBestTeam(players, fullSquad, 100);

  console.log();
  console.log("Skeleton 442 Squad");
  calculateBestTeam(players, skeleton442Squad, 100);

  console.log();
  console.log("Skeleton 433 Squad");
  calculateBestTeam(players, skeleton433Squad, 100);

  console.log();
  console.log("Skeleton 343 Squad");
  calculateBestTeam(players, skeleton343Squad, 100);

  console.log();
  console.log("Skeleton 532 Squad");
  calculateBestTeam(players, skeleton532Squad, 100);
});

const compareRoi = (a: PlayerScore, b: PlayerScore) => {
  if (a.score < b.score) {
    return 1;
  }
  if (a.score > b.score) {
    return -1;
  }
  return 0;
};

const displayPlayerScore = (playerScore: PlayerScore) => {
  console.log(
    `| ${playerScore.player.id}\t| £${playerScore.value.toFixed(
      2
    )}m\t| ${playerScore.score.toFixed(2)}\t| ${playerScore.roi.toFixed(
      2
    )}\t| ${playerScore.position.singular_name_short}\t\t| ${
      playerScore.player.web_name
    }`
  );
};

const calculateBestTeam = (
  players: PlayerScore[],
  settings: RecommendationSetting,
  fullBudget: number
) => {
  const selectedPlayers = maxKnapsack(players, settings, fullBudget).sort(
    (a, b) => a.position.id - b.position.id
  );
  selectedPlayers.forEach(displayPlayerScore);
  console.log(selectedPlayers.length + " players");
  console.log(
    `Value £${selectedPlayers
      .reduce((total, player) => total + player.value, 0)
      .toFixed(2)}m`
  );
  console.log(
    `Score: ${selectedPlayers
      .reduce((total, player) => total + player.score, 0)
      .toFixed(2)}`
  );
};

const maxKnapsack = (
  players: PlayerScore[],
  settings: RecommendationSetting,
  budget: number
) => {
  const W = (budget - settings.budgetOffset) * 100;
  let cache: PlayerScore[][][] = [];
  for (let g = 0; g < players.length + 1; g++) {
    cache[g] = [];
    for (let h = 0; h < W + 1; h++) {
      cache[g][h] = [];
    }
  }

  for (let i = 0; i < players.length + 1; i++) {
    for (let j = 0; j < W + 1; j++) {
      if (i === 0 || j === 0) cache[i][j] = [];
      else if (Math.round(players[i - 1].value * 100) <= j) {
        const included = cache[i - 1][
          j - Math.round(players[i - 1].value * 100)
        ].concat(players[i - 1]);
        const excluded = cache[i - 1][j];
        cache[i][j] =
          included.reduce(
            (total, player) => total + Math.round(player.score * 100),
            0
          ) >
            excluded.reduce(
              (total, player) => total + Math.round(player.score * 100),
              0
            ) && !breaksRules(included, settings)
            ? included
            : excluded;
      } else {
        cache[i][j] = cache[i - 1][j];
      }
    }
  }
  return cache[players.length][W];
};

// TODO players per squad
const breaksRules = (
  players: PlayerScore[],
  settings: RecommendationSetting
) => {
  if (players.length > settings.maxPlayers) {
    return true;
  }

  if (
    players.filter((player) => player.position.id === PositionMap.GOALKEEPER)
      .length > settings.goalkeepers
  ) {
    return true;
  }

  if (
    players.filter((player) => player.position.id === PositionMap.DEFENDER)
      .length > settings.defenders
  ) {
    return true;
  }

  if (
    players.filter((player) => player.position.id === PositionMap.MIDFIELDER)
      .length > settings.midfielders
  ) {
    return true;
  }

  if (
    players.filter((player) => player.position.id === PositionMap.FORWARD)
      .length > settings.forwards
  ) {
    return true;
  }

  return false;
};
