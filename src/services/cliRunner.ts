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
import DataRecorder from "./dataRecorder";
import DraftService from "./draftService";
import PlayerScoreBuilder from "../tests/builders/playerScoreBuilder";

export default class CliRunner {
  private fplFetcher: FplFetcher;
  private playerService: PlayersService;
  private recommendationService: RecommendationService;
  private optimisationService: OptimisationService;
  private teamValidator: TeamValidator;
  private transferService: TransferService;
  private lineupService: LineupService;
  private dataRecorder: DataRecorder;
  private draftService: DraftService;

  public static RUN_CMD = "run";
  public static DRAFT_RUN_CMD = "draft-run";
  public static SCORE_PLAYER_CMD = "score-player";
  public static TOP_PLAYERS_CMD = "top-players";
  public static WILDCARD_SQUAD_CMD = "wildcard-squad";
  public static RECOMMEND_SQUAD_CMD = "recommend-squad";
  public static RECOMMEND_TRANSFERS_CMD = "recommend-transfers";
  public static RECOMMEND_LINEUP_CMD = "recommend-lineup";
  public static SET_LINEUP_CMD = "set-lineup";
  public static PERFORM_TRANSFERS_CMD = "perform-transfers";
  public static RECORD_DATA_CMD = "record-data";
  public static DRAFT_TOP_PLAYERS = "draft-top-players";
  public static DRAFT_RECOMMEND_LINEUP_CMD = "draft-recommend-lineup";
  public static DRAFT_SET_LINEUP_CMD = "draft-set-lineup";
  public static DRAFT_RECOMMEND_TRANSACTIONS_CMD = "draft-recommend-transactions";
  public static commands = [
    CliRunner.RUN_CMD,
    CliRunner.DRAFT_RUN_CMD,
    CliRunner.SCORE_PLAYER_CMD,
    CliRunner.TOP_PLAYERS_CMD,
    CliRunner.WILDCARD_SQUAD_CMD,
    CliRunner.RECOMMEND_SQUAD_CMD,
    CliRunner.RECOMMEND_TRANSFERS_CMD,
    CliRunner.RECOMMEND_LINEUP_CMD,
    CliRunner.SET_LINEUP_CMD,
    CliRunner.PERFORM_TRANSFERS_CMD,
    CliRunner.RECORD_DATA_CMD,
    CliRunner.DRAFT_TOP_PLAYERS,
    CliRunner.DRAFT_RECOMMEND_LINEUP_CMD,
    CliRunner.DRAFT_SET_LINEUP_CMD,
    CliRunner.DRAFT_RECOMMEND_TRANSACTIONS_CMD,
  ];

  constructor() {
    this.fplFetcher = new FplFetcher();
    this.dataRecorder = new DataRecorder();
    this.playerService = new PlayersService(this.dataRecorder);
    this.teamValidator = new TeamValidator();
    this.optimisationService = new OptimisationService(this.teamValidator);
    this.lineupService = new LineupService(this.fplFetcher);
    this.transferService = new TransferService(this.fplFetcher, this.optimisationService);
    this.recommendationService = new RecommendationService(
      this.optimisationService,
      this.transferService
    );
    this.draftService = new DraftService(this.fplFetcher);
  }

  async run(command: string, optionalParameter: string) {
    const draft = command.startsWith("draft-");
    const overview = await this.fplFetcher.getOverview();
    if (draft) {
      await this.updateOverviewIdsFromDraftOverview(overview);
    }
    const nextEvent = overview.events.filter((event) => event.is_next)[0];
    const fixtures = await this.fplFetcher.getFixtures();
    const players = await this.playerService.getAllPlayerScores(overview, fixtures, nextEvent.id);

    const teamId = await this.getMyTeamId(draft);
    if (!teamId) {
      return;
    }
    const myTeam = draft
      ? await this.fplFetcher.getMyDraftTeam(teamId)
      : await this.fplFetcher.getMyTeam(teamId);
    const picksWithScore = this.mapTeamToTeamPickWithScore(myTeam, players);

    switch (command) {
      case CliRunner.RUN_CMD:
        this.runBot(players, myTeam, picksWithScore, nextEvent, teamId);
        break;
      case CliRunner.DRAFT_RUN_CMD:
        this.runDraftBot(players, picksWithScore, nextEvent);
        break;
      case CliRunner.SCORE_PLAYER_CMD:
        this.scorePlayer(players, parseInt(optionalParameter));
        break;
      case CliRunner.TOP_PLAYERS_CMD:
        this.topPlayers(players);
        break;
      case CliRunner.WILDCARD_SQUAD_CMD:
        this.wildcardSquad(players, myTeam);
        break;
      case CliRunner.RECOMMEND_SQUAD_CMD:
        this.recommendSquad(players, optionalParameter ? parseInt(optionalParameter) : 100);
        break;
      case CliRunner.RECOMMEND_TRANSFERS_CMD:
        this.recommendTransfers(players, myTeam, picksWithScore, true);
        break;
      case CliRunner.RECOMMEND_LINEUP_CMD:
        this.recommendLineup(picksWithScore);
        break;
      case CliRunner.SET_LINEUP_CMD:
        this.setLineup(picksWithScore, teamId, false);
        break;
      case CliRunner.PERFORM_TRANSFERS_CMD:
        this.performTransfers(players, myTeam, picksWithScore, nextEvent, teamId);
        break;
      case CliRunner.RECORD_DATA_CMD:
        this.recordData(players, nextEvent.id);
        break;
      case CliRunner.DRAFT_TOP_PLAYERS:
        this.draftTopPlayers(players);
        break;
      case CliRunner.DRAFT_RECOMMEND_LINEUP_CMD:
        this.recommendLineup(picksWithScore);
        break;
      case CliRunner.DRAFT_SET_LINEUP_CMD:
        this.setLineup(picksWithScore, teamId, true);
        break;
      case CliRunner.DRAFT_RECOMMEND_TRANSACTIONS_CMD:
        this.recommendTransactions(players, picksWithScore);
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
    nextEvent: Gameweek,
    teamId: number
  ) {
    console.log("Running Bot...");
    const timeNow = moment();
    const deadlineTime = moment(nextEvent.deadline_time);
    const hoursTilDeadline = deadlineTime.diff(timeNow, "hours");
    if (hoursTilDeadline < 24) {
      console.log(`Deadline in ${hoursTilDeadline} hours, performing transfers`);
      await this.performTransfers(players, myTeam, picksWithScore, nextEvent, teamId);
      this.recordData(players, nextEvent.id);
    } else {
      console.log(
        `Deadline in ${hoursTilDeadline} hours, postponing transfers until later in the week. ` +
          "Showing recommended transfers"
      );
      await this.recommendTransfers(players, myTeam, picksWithScore, false);
    }
    console.log("Updating lineup...");
    const myNewTeam = await this.fplFetcher.getMyTeam(teamId);
    const newPicksWithScore = this.mapTeamToTeamPickWithScore(myNewTeam, players);
    await this.setLineup(newPicksWithScore, teamId, false);

    console.log();
    this.topPlayers(players);
  }

  private async runDraftBot(
    players: PlayerScore[],
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek
  ) {
    console.log("Running Draft Bot...");
    const timeNow = moment();
    const deadlineTime = moment(nextEvent.deadline_time);
    const hoursTilDeadline = deadlineTime.diff(timeNow, "hours");
    if (hoursTilDeadline < 24) {
      console.log(`Deadline in ${hoursTilDeadline} hours, consider the following lineup`);
      this.recommendLineup(picksWithScore);
      console.log();
      console.log("SEND EMAIL"); // can be checked by a script to consider sending emails
    } else if (hoursTilDeadline < 48) {
      console.log(
        `Waiver deadline in ${hoursTilDeadline - 24} hours, consider the following changes`
      );
      await this.recommendTransactions(players, picksWithScore);
      console.log();
      console.log("SEND EMAIL"); // can be checked by a script to consider sending emails
    } else {
      console.log(
        `Waiver deadline in ${hoursTilDeadline - 24} hours, showing recommended transactions.`
      );
      await this.recommendTransactions(players, picksWithScore);
    }

    console.log();
    this.draftTopPlayers(players);
  }

  private scorePlayer(players: PlayerScore[], playerId: number) {
    const player = players.find((x) => x.player.id === playerId)!;
    console.log(player.scoreDetails);
    console.log();
    DisplayService.displayPlayers([player]);
  }

  private topPlayers(players: PlayerScore[]) {
    console.log("All Players:");
    DisplayService.displayPlayers(players.slice(0, 40));

    console.log("Goalkeepers");
    DisplayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.GOALKEEPER).slice(0, 10)
    );

    console.log("Defenders");
    DisplayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.DEFENDER).slice(0, 20)
    );

    console.log("Midfielders");
    DisplayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.MIDFIELDER).slice(0, 20)
    );

    console.log("Forwards");
    DisplayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.FORWARD).slice(0, 20)
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

  private recommendSquad(players: PlayerScore[], budget: number) {
    console.log(`Recommending squads based on a budget of £${budget}m`);
    const all15Positions = this.recommendationService.recommendATeam(players, fullSquad, budget);
    DisplayService.displaySquad(all15Positions, "Full Squad");

    const skeleton442 = this.recommendationService.recommendATeam(
      players,
      skeleton442Squad,
      budget
    );
    DisplayService.displaySquad(skeleton442, "Skeleton 442 Squad");

    const skeleton433 = this.recommendationService.recommendATeam(
      players,
      skeleton433Squad,
      budget
    );
    DisplayService.displaySquad(skeleton433, "Skeleton 433 Squad");

    const skeleton343 = this.recommendationService.recommendATeam(
      players,
      skeleton343Squad,
      budget
    );
    DisplayService.displaySquad(skeleton343, "Skeleton 343 Squad");

    const skeleton532 = this.recommendationService.recommendATeam(
      players,
      skeleton532Squad,
      budget
    );
    DisplayService.displaySquad(skeleton532, "Skeleton 532 Squad");
  }

  private wildcardSquad(playerScores: PlayerScore[], myTeam: MyTeam) {
    const totalSales = myTeam.picks.reduce((total, pick) => total + pick.selling_price, 0) / 10;
    const budget = totalSales + myTeam.transfers.bank / 10;
    this.recommendSquad(playerScores, budget);
  }

  private async recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    debug: boolean
  ) {
    return this.recommendationService.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      debug
    );
  }

  private async performTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek,
    teamId: number
  ) {
    const recommendation = await this.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      false
    );
    const didPerformTransfer = await this.transferService.performTransfers(
      recommendation,
      nextEvent,
      myTeam,
      teamId
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
    DisplayService.displaySquad([...lineup.starting11, ...lineup.orderedSubs], "My Squad");
    return lineup;
  }

  private async setLineup(picksWithScore: TeamPickWithScore[], teamId: number, draft: boolean) {
    const lineup = this.recommendLineup(picksWithScore);
    await this.lineupService.setLineup(lineup, teamId, draft);
    console.log("Successfully updated lineup");
  }

  private async recordData(players: PlayerScore[], nextEventId: number) {
    await this.dataRecorder.recordData(players, nextEventId);
  }

  private async draftTopPlayers(players: PlayerScore[]) {
    const availablePlayers = await this.draftService.getTopAvailablePlayers(players);
    if (availablePlayers) {
      console.log("Available Players:");
      this.topPlayers(availablePlayers);
      console.log();
    }
    console.log("Best Players:");
    this.topPlayers(players);
  }

  private async recommendTransactions(players: PlayerScore[], picksWithScore: TeamPickWithScore[]) {
    const recommendations = await this.draftService.recommendTransactions(players, picksWithScore);
    console.log("Recommended Transactions");
    recommendations.forEach(DisplayService.displayTransaction);
  }

  private async getMyTeamId(draft: boolean) {
    if (draft) {
      const draftInfo = await this.fplFetcher.getMyDraftInfo();
      if (draftInfo.player.entry_set.length === 0) {
        console.log("No draft entries!");
        return;
      }
      return draftInfo.player.entry_set[0];
    }

    const myDetails = await this.fplFetcher.getMyDetails();
    return myDetails.player.entry;
  }

  private mapTeamToTeamPickWithScore(myTeam: MyTeam, players: PlayerScore[]): TeamPickWithScore[] {
    return myTeam.picks.map((pick) => ({
      pick: pick,
      playerScore: players.find((player) => player.player.id === pick.element)!,
    }));
  }

  private async updateOverviewIdsFromDraftOverview(overview: Overview) {
    const draftOverview = await this.fplFetcher.getDraftOverview();
    overview.elements.forEach((element) => {
      element.id = draftOverview.elements.find((x) => x.code === element.code)?.id!;
    });
    overview.elements = overview.elements.filter((x) => x.id);
  }
}
