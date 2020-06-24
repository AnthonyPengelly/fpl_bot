import moment from "moment";
import FplFetcher from "../fetchers/fplFetcher";
import PlayersService from "./playersService";
import RecommendationService from "./recommendationService";
import OptimisationService from "./optimisationService";
import TeamValidator from "./teamValidator";
import { exit } from "process";
import PlayerScore from "../models/PlayerScore";
import DisplayService from "./displayService";
import { PositionMap } from "../models/PositionMap";
import {
  skeleton532Squad,
  fullSquad,
  skeleton433Squad,
  skeleton442Squad,
  skeleton343Squad,
} from "../config/optimisationSettings";
import TransferService from "./transferService";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import LineupService from "./lineupService";

export default class CliRunner {
  private fplFetcher: FplFetcher;
  private playerService: PlayersService;
  private recommendationService: RecommendationService;
  private optimisationService: OptimisationService;
  private teamValidator: TeamValidator;
  private transferService: TransferService;
  private lineupService: LineupService;

  public static RUN_CMD = "run";
  public static SCORE_PLAYER = "score-player";
  public static TOP_PLAYERS_CMD = "top-players";
  public static RECOMMEND_SQUAD_CMD = "recommend-squad";
  public static RECOMMEND_TRANSFERS_CMD = "recommend-transfers";
  public static RECOMMEND_LINEUP_CMD = "recommend-lineup";
  public static SET_LINEUP_CMD = "set-lineup";
  public static PERFORM_TRANSFERS_CMD = "perform-transfers";
  public static commands = [
    CliRunner.RUN_CMD,
    CliRunner.SCORE_PLAYER,
    CliRunner.TOP_PLAYERS_CMD,
    CliRunner.RECOMMEND_SQUAD_CMD,
    CliRunner.RECOMMEND_TRANSFERS_CMD,
    CliRunner.RECOMMEND_LINEUP_CMD,
    CliRunner.SET_LINEUP_CMD,
    CliRunner.PERFORM_TRANSFERS_CMD,
  ];

  constructor() {
    this.fplFetcher = new FplFetcher();
    this.playerService = new PlayersService();
    this.teamValidator = new TeamValidator();
    this.optimisationService = new OptimisationService(this.teamValidator);
    this.lineupService = new LineupService(this.fplFetcher);
    this.transferService = new TransferService(
      this.fplFetcher,
      this.optimisationService
    );
    this.recommendationService = new RecommendationService(
      this.optimisationService,
      this.transferService
    );
  }

  async init() {}

  async run(command: string, playerId: string) {
    const overview = await this.fplFetcher.getOverview();
    const nextEvent = overview.events.filter((event) => event.is_next)[0];
    const fixtures = await this.fplFetcher.getFixtures();
    const players = await this.playerService.getAllPlayerScores(
      overview,
      fixtures,
      nextEvent.id
    );
    const myTeam = await this.fplFetcher.getMyTeam();
    const picksWithScore = this.mapTeamToTeamPickWithScore(myTeam, players);

    switch (command) {
      case CliRunner.RUN_CMD:
        this.runBot(players, myTeam, picksWithScore, nextEvent);
        break;
      case CliRunner.SCORE_PLAYER:
        this.scorePlayer(players, parseInt(playerId));
        break;
      case CliRunner.TOP_PLAYERS_CMD:
        this.topPlayers(players);
        break;
      case CliRunner.RECOMMEND_SQUAD_CMD:
        this.recommendSquad(players);
        break;
      case CliRunner.RECOMMEND_TRANSFERS_CMD:
        this.recommendTransfers(players, myTeam, picksWithScore);
        break;
      case CliRunner.RECOMMEND_LINEUP_CMD:
        this.recommendLineup(picksWithScore);
        break;
      case CliRunner.SET_LINEUP_CMD:
        this.setLineup(picksWithScore);
        break;
      case CliRunner.PERFORM_TRANSFERS_CMD:
        this.performTransfers(players, myTeam, picksWithScore, nextEvent);
        break;
      default:
        console.error(
          "Please enter a command to begin. The currently supported commands are: " +
            `${CliRunner.commands.join(", ")}`
        );
        exit(1);
    }
  }

  private async runBot(
    players: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek
  ) {
    console.log("Running Bot...");
    const timeNow = moment();
    const deadlineTime = moment(nextEvent.deadline_time);
    const hoursTilDeadline = deadlineTime.diff(timeNow, "hours");
    if (hoursTilDeadline < 24) {
      console.log(
        `Deadline in ${hoursTilDeadline} hours, performing transfers`
      );
      await this.performTransfers(players, myTeam, picksWithScore, nextEvent);
    } else {
      console.log(
        `Deadline in ${hoursTilDeadline} hours, postponing transfers until later in the week`
      );
    }
    console.log("Updating lineup...");
    const myNewTeam = await this.fplFetcher.getMyTeam();
    const newPicksWithScore = this.mapTeamToTeamPickWithScore(
      myNewTeam,
      players
    );
    await this.setLineup(newPicksWithScore);
  }

  private scorePlayer(players: PlayerScore[], playerId: number) {
    const player = players.find((x) => x.player.id === playerId)!;
    DisplayService.displayPlayers([player]);
  }

  private topPlayers(players: PlayerScore[]) {
    console.log("All Players:");
    DisplayService.displayPlayers(players.slice(0, 40));

    console.log("Goalkeepers");
    DisplayService.displayPlayers(
      players
        .filter((player) => player.position.id === PositionMap.GOALKEEPER)
        .slice(0, 10)
    );

    console.log("Defenders");
    DisplayService.displayPlayers(
      players
        .filter((player) => player.position.id === PositionMap.DEFENDER)
        .slice(0, 20)
    );

    console.log("Midfielders");
    DisplayService.displayPlayers(
      players
        .filter((player) => player.position.id === PositionMap.MIDFIELDER)
        .slice(0, 20)
    );

    console.log("Forwards");
    DisplayService.displayPlayers(
      players
        .filter((player) => player.position.id === PositionMap.FORWARD)
        .slice(0, 20)
    );

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
    const bestSquad = goalkeepers.concat(defenders, midfielders, forwards);
    DisplayService.displaySquad(bestSquad, "Best Squad");
  }

  private recommendSquad(players: PlayerScore[]) {
    const all15Positions = this.recommendationService.recommendATeam(
      players,
      fullSquad,
      100
    );
    DisplayService.displaySquad(all15Positions, "Full Squad");

    const skeleton442 = this.recommendationService.recommendATeam(
      players,
      skeleton442Squad,
      100
    );
    DisplayService.displaySquad(skeleton442, "Skeleton 442 Squad");

    const skeleton433 = this.recommendationService.recommendATeam(
      players,
      skeleton433Squad,
      100
    );
    DisplayService.displaySquad(skeleton433, "Skeleton 433 Squad");

    const skeleton343 = this.recommendationService.recommendATeam(
      players,
      skeleton343Squad,
      100
    );
    DisplayService.displaySquad(skeleton343, "Skeleton 343 Squad");

    const skeleton532 = this.recommendationService.recommendATeam(
      players,
      skeleton532Squad,
      100
    );
    DisplayService.displaySquad(skeleton532, "Skeleton 532 Squad");
  }

  private async recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[]
  ) {
    const recommendation = this.recommendationService.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore
    );
    console.log("Players Out:");
    DisplayService.displayPlayers(recommendation.playersOut);
    console.log();
    console.log("Players In");
    DisplayService.displayPlayers(recommendation.playersIn);
    console.log();
    console.log(
      `Score improvement: ${recommendation.scoreImprovement.toFixed(2)}`
    );
    return recommendation;
  }

  private async performTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek
  ) {
    const recommendation = await this.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore
    );
    const didPerformTransfer = await this.transferService.performTransfers(
      recommendation,
      nextEvent,
      myTeam
    );
    if (didPerformTransfer) {
      console.log("Successfully performed transfers");
    } else {
      console.log("Did not perform transfer");
    }
  }

  private recommendLineup(picksWithScore: TeamPickWithScore[]) {
    const lineup = this.lineupService.recommendLineup(picksWithScore);
    DisplayService.displaySquad(lineup.starting11, "Starting XI");
    console.log();
    console.log("Subs (Ordered)");
    DisplayService.displayPlayers(lineup.orderedSubs);
    console.log(`Captain: ${lineup.captain.player.web_name}`);
    console.log(`Vice Captain: ${lineup.viceCaptain.player.web_name}`);
    return lineup;
  }

  private async setLineup(picksWithScore: TeamPickWithScore[]) {
    const lineup = this.recommendLineup(picksWithScore);
    await this.lineupService.setLineup(lineup);
    console.log("Successfully updated lineup");
  }

  private mapTeamToTeamPickWithScore(
    myTeam: MyTeam,
    players: PlayerScore[]
  ): TeamPickWithScore[] {
    return myTeam.picks.map((pick) => ({
      pick: pick,
      playerScore: players.find((player) => player.player.id === pick.element)!,
    }));
  }
}
