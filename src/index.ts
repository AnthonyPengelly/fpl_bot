import PlayersService from "./services/playersService";
import PlayerScore from "./models/PlayerScore";

console.log("Comparing players...");
let promise = PlayersService.getAllPlayers();
promise.then((players) => {
  players.sort(compareRoi);
  console.log("| ID\t| Value\t\t| Score\t| ROI\t| Position\t| Name");
  players.slice(0, 30).forEach(displayPlayerScore);

  console.log();
  console.log("Recommended Squad:");
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
  console.log(
    `£${goalkeepers
      .concat(defenders, midfielders, forwards)
      .reduce((total, player) => total + player.value, 0)
      .toFixed(2)}m`
  );
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
