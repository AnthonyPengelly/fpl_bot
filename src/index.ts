import PlayersService from "./services/playersService";
import PlayerScore from "./models/PlayerScore";
import {
  fullSquad,
  skeleton442Squad,
  skeleton343Squad,
  skeleton433Squad,
  skeleton532Squad,
} from "./config/recommendationSettings";
import RecommendationService from "./services/recommendationService";
import FplFetcher from "./fetchers/fplFetcher";

console.log("Comparing players...");
const fplFetcher = new FplFetcher();
fplFetcher.getMyTeam().then((myTeam) => console.log(JSON.stringify(myTeam)));
const playerService = new PlayersService(fplFetcher);
playerService.getAllPlayerScores().then((players) => {
  players.sort(compareScores);
  console.log("| ID\t| Value\t\t| Score\t| ROI\t| Position\t| Name");
  players.slice(0, 30).forEach(displayPlayerScore);

  console.log();
  console.log("Recommended Squads");
  const goalkeepers = players
    .filter((player) => player.position.singular_name_short === "GKP")
    .slice(0, 2);
  const defenders = players
    .filter((player) => player.position.singular_name_short === "DEF")
    .slice(0, 5);
  const midfielders = players
    .filter((player) => player.position.singular_name_short === "MID")
    .slice(0, 5);
  const forwards = players
    .filter((player) => player.position.singular_name_short === "FWD")
    .slice(0, 3);
  const all = goalkeepers.concat(defenders, midfielders, forwards);
  displaySquad(all, "Draft Squad");

  const recommendationService = new RecommendationService(players);

  const all15Positions = recommendationService.recommendATeam(fullSquad, 100);
  displaySquad(all15Positions, "Full Squad");

  const skeleton442 = recommendationService.recommendATeam(
    skeleton442Squad,
    100
  );
  displaySquad(skeleton442, "Skeleton 442 Squad");

  const skeleton433 = recommendationService.recommendATeam(
    skeleton433Squad,
    100
  );
  displaySquad(skeleton433, "Skeleton 433 Squad");

  const skeleton343 = recommendationService.recommendATeam(
    skeleton343Squad,
    100
  );
  displaySquad(skeleton343, "Skeleton 343 Squad");

  const skeleton532 = recommendationService.recommendATeam(
    skeleton532Squad,
    100
  );
  displaySquad(skeleton532, "Skeleton 532 Squad");
});

const compareScores = (a: PlayerScore, b: PlayerScore) => b.score - a.score;

const displaySquad = (players: PlayerScore[], squadName: string) => {
  console.log();
  console.log(squadName);
  const sortedPlayers = players.sort((a, b) => a.position.id - b.position.id);
  sortedPlayers.forEach(displayPlayerScore);
  console.log(sortedPlayers.length + " players");
  console.log(
    `Value £${sortedPlayers
      .reduce((total, player) => total + player.value, 0)
      .toFixed(2)}m`
  );
  const squadScore = sortedPlayers.reduce(
    (total, player) => total + player.score,
    0
  );
  console.log(`Score: ${squadScore.toFixed(2)}`);
  console.log(
    `Score per player: ${(squadScore / sortedPlayers.length).toFixed(2)}`
  );
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
