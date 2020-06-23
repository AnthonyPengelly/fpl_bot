import FplFetcher from "../fetchers/fplFetcher";
import PlayersService from "./playersService";
import RecommendationService from "./recommendationService";
import OptimisationService from "./optimisationService";
import TeamValidator from "./teamValidator";
import { exit } from "process";
import PlayerScore from "../models/PlayerScore";
import DisplayService from "./displayService";
import { PositionMap } from "../models/PositionMap";
import { skeleton532Squad, fullSquad } from "../config/optimisationSettings";

export default class CliRunner {
  private fplFetcher?: FplFetcher;
  private playerService?: PlayersService;
  private recommendationService?: RecommendationService;
  private optimisationService?: OptimisationService;
  private teamValidator?: TeamValidator;
  private players: PlayerScore[] = [];

  public static TOP_PLAYERS_CMD = "top-players";
  public static RECOMMEND_SQUAD_CMD = "recommend-squad";
  public static RECOMMEND_TRANSFERS_CMD = "recommend-transfers";

  async init() {
    this.fplFetcher = new FplFetcher();
    const overview = await this.fplFetcher.getOverview();
    const nextEvent = overview.events.filter((event) => event.is_next)[0];
    const fixtures = await this.fplFetcher.getFixtures(nextEvent.id);
    this.playerService = new PlayersService(overview, fixtures);
    this.players = await this.playerService.getAllPlayerScores();
    this.teamValidator = new TeamValidator();
    this.optimisationService = new OptimisationService(this.teamValidator);
    this.recommendationService = new RecommendationService(
      this.optimisationService,
      this.players
    );
  }

  async run(command: string) {
    console.log(command);
    switch (command) {
      case CliRunner.TOP_PLAYERS_CMD:
        this.topPlayers();
        break;
      case CliRunner.RECOMMEND_SQUAD_CMD:
        this.recommendSquad();
        break;
      case CliRunner.RECOMMEND_TRANSFERS_CMD:
        this.recommendTransfers();
        break;
      default:
        console.error(
          `Please enter a command to begin. The currently supported commands are:
          ${CliRunner.TOP_PLAYERS_CMD}, ${CliRunner.RECOMMEND_SQUAD_CMD}, ${CliRunner.RECOMMEND_TRANSFERS_CMD}`
        );
        exit(1);
    }
  }

  private topPlayers() {
    const sortedPlayers = this.players.sort(this.compareScores);
    console.log("All Players:");
    DisplayService.displayPlayers(sortedPlayers.slice(0, 40));

    console.log("Goalkeepers");
    DisplayService.displayPlayers(
      sortedPlayers
        .filter((player) => player.position.id === PositionMap.GOALKEEPER)
        .slice(0, 10)
    );

    console.log("Defenders");
    DisplayService.displayPlayers(
      sortedPlayers
        .filter((player) => player.position.id === PositionMap.DEFENDER)
        .slice(0, 20)
    );

    console.log("Midfielders");
    DisplayService.displayPlayers(
      sortedPlayers
        .filter((player) => player.position.id === PositionMap.MIDFIELDER)
        .slice(0, 20)
    );

    console.log("Forwards");
    DisplayService.displayPlayers(
      sortedPlayers
        .filter((player) => player.position.id === PositionMap.FORWARD)
        .slice(0, 20)
    );

    const goalkeepers = sortedPlayers
      .filter((player) => player.position.singular_name_short === "GKP")
      .slice(0, 2);
    const defenders = sortedPlayers
      .filter((player) => player.position.singular_name_short === "DEF")
      .slice(0, 5);
    const midfielders = sortedPlayers
      .filter((player) => player.position.singular_name_short === "MID")
      .slice(0, 5);
    const forwards = sortedPlayers
      .filter((player) => player.position.singular_name_short === "FWD")
      .slice(0, 3);
    const bestSquad = goalkeepers.concat(defenders, midfielders, forwards);
    DisplayService.displaySquad(bestSquad, "Best Squad");
  }

  private recommendSquad() {
    const all15Positions = this.recommendationService!.recommendATeam(
      fullSquad,
      100
    );
    DisplayService.displaySquad(all15Positions, "Full Squad");

    const skeleton442 = this.recommendationService!.recommendATeam(
      skeleton532Squad,
      100
    );
    DisplayService.displaySquad(skeleton442, "Skeleton 442 Squad");

    const skeleton433 = this.recommendationService!.recommendATeam(
      skeleton532Squad,
      100
    );
    DisplayService.displaySquad(skeleton433, "Skeleton 433 Squad");

    const skeleton343 = this.recommendationService!.recommendATeam(
      skeleton532Squad,
      100
    );
    DisplayService.displaySquad(skeleton343, "Skeleton 343 Squad");

    const skeleton532 = this.recommendationService!.recommendATeam(
      skeleton532Squad,
      100
    );
    DisplayService.displaySquad(skeleton532, "Skeleton 532 Squad");
  }

  private recommendTransfers() {
    console.log("TODO");
  }

  private compareScores = (a: PlayerScore, b: PlayerScore) => b.score - a.score;
}
