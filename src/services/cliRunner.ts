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
  dumpGkpSquad,
} from "../config/optimisationSettings";
import TransferService from "./transferService";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import LineupService from "./lineupService";
import DataRecorder from "./dataRecorder";
import DraftService from "./draftService";
import { DumpPlayerSettings } from "../config/dumpPlayerSettings";
import { Logger } from "./logger";
import TwitterService from "./twitterService";
import TwitterApiClient from "../fetchers/twitterApiClient";

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
  private displayService: DisplayService;
  private twitterService: TwitterService;

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
  public static TWEET_CMD = "tweet";
  public static DRAFT_TOP_PLAYERS = "draft-top-players";
  public static DRAFT_RECOMMEND_LINEUP_CMD = "draft-recommend-lineup";
  public static DRAFT_SET_LINEUP_CMD = "draft-set-lineup";
  public static DRAFT_RECOMMEND_TRANSACTIONS_CMD = "draft-recommend-transactions";
  public static DRAFT_PERFORM_TRANSACTIONS_CMD = "draft-perform-transactions";
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
    CliRunner.TWEET_CMD,
    CliRunner.DRAFT_TOP_PLAYERS,
    CliRunner.DRAFT_RECOMMEND_LINEUP_CMD,
    CliRunner.DRAFT_SET_LINEUP_CMD,
    CliRunner.DRAFT_RECOMMEND_TRANSACTIONS_CMD,
    CliRunner.DRAFT_PERFORM_TRANSACTIONS_CMD,
  ];

  constructor(private logger: Logger) {
    this.displayService = new DisplayService(logger);
    this.fplFetcher = new FplFetcher();
    this.dataRecorder = new DataRecorder();
    this.playerService = new PlayersService(this.dataRecorder, logger);
    this.teamValidator = new TeamValidator();
    this.optimisationService = new OptimisationService(this.teamValidator);
    this.lineupService = new LineupService(this.fplFetcher);
    this.transferService = new TransferService(
      this.fplFetcher,
      this.optimisationService,
      this.lineupService,
      logger
    );
    this.recommendationService = new RecommendationService(
      this.optimisationService,
      this.transferService,
      this.displayService,
      logger
    );
    this.draftService = new DraftService(this.fplFetcher, this.displayService, logger);
    const twitterApiClient = new TwitterApiClient();
    this.twitterService = new TwitterService(
      this.lineupService,
      this.recommendationService,
      twitterApiClient,
      this.logger
    );
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
        await this.runBot(players, myTeam, picksWithScore, nextEvent, teamId);
        break;
      case CliRunner.DRAFT_RUN_CMD:
        await this.runDraftBot(players, picksWithScore, nextEvent, teamId);
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
        await this.recommendTransfers(
          players,
          myTeam,
          picksWithScore,
          optionalParameter === "true",
          true
        );
        break;
      case CliRunner.RECOMMEND_LINEUP_CMD:
        this.recommendLineup(picksWithScore);
        break;
      case CliRunner.SET_LINEUP_CMD:
        await this.setLineup(picksWithScore, teamId, false);
        break;
      case CliRunner.PERFORM_TRANSFERS_CMD:
        await this.performTransfers(
          players,
          myTeam,
          picksWithScore,
          nextEvent,
          teamId,
          optionalParameter === "true"
        );
        break;
      case CliRunner.RECORD_DATA_CMD:
        await this.recordData(players, nextEvent.id);
        break;
      case CliRunner.TWEET_CMD:
        await this.twitterService.tweet(players, overview, myTeam, picksWithScore);
        break;
      case CliRunner.DRAFT_TOP_PLAYERS:
        await this.draftTopPlayers(players);
        break;
      case CliRunner.DRAFT_RECOMMEND_LINEUP_CMD:
        this.recommendLineup(picksWithScore);
        break;
      case CliRunner.DRAFT_SET_LINEUP_CMD:
        await this.setLineup(picksWithScore, teamId, true);
        break;
      case CliRunner.DRAFT_RECOMMEND_TRANSACTIONS_CMD:
        await this.recommendTransactions(players, picksWithScore, false);
        break;
      case CliRunner.DRAFT_PERFORM_TRANSACTIONS_CMD:
        await this.performTransactions(players, picksWithScore, teamId);
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
    this.logger.log("Running Bot...");
    const timeNow = moment();
    const deadlineTime = moment(nextEvent.deadline_time);
    const hoursTilDeadline = deadlineTime.diff(timeNow, "hours");
    if (hoursTilDeadline < 24) {
      this.logger.log(`Deadline in ${hoursTilDeadline} hours, performing transfers`);
      await this.performTransfers(players, myTeam, picksWithScore, nextEvent, teamId, false);
      await this.recordData(players, nextEvent.id);
      this.logger.setShouldSendEmail();
    } else {
      this.logger.log(
        `Deadline in ${hoursTilDeadline} hours, postponing transfers until later in the week. ` +
          "Showing recommended transfers"
      );
      await this.recommendTransfers(players, myTeam, picksWithScore, false, false);
    }
    this.logger.log("Updating lineup...");
    const myNewTeam = await this.fplFetcher.getMyTeam(teamId);
    const newPicksWithScore = this.mapTeamToTeamPickWithScore(myNewTeam, players);
    await this.setLineup(newPicksWithScore, teamId, false);

    this.logger.log("");
    this.topPlayers(players);
  }

  private async runDraftBot(
    players: PlayerScore[],
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek,
    teamId: number
  ) {
    this.logger.log("Running Draft Bot...");
    const timeNow = moment();
    const deadlineTime = moment(nextEvent.deadline_time);
    const hoursTilDeadline = deadlineTime.diff(timeNow, "hours");
    if (hoursTilDeadline < 24) {
      this.logger.log(`Deadline in ${hoursTilDeadline} hours, setting lineup`);
      await this.setLineup(picksWithScore, teamId, true);
      this.logger.setShouldSendEmail();
    } else if (hoursTilDeadline < 48) {
      this.logger.log(
        `Waiver deadline in ${hoursTilDeadline - 24} hours, showing recommended transactions.`
      );
      await this.recommendTransactions(players, picksWithScore, false);
      this.logger.setShouldSendEmail();
    } else {
      this.logger.log(
        `Waiver deadline in ${hoursTilDeadline - 24} hours, showing recommended transactions.`
      );
      await this.recommendTransactions(players, picksWithScore, false);
    }

    this.logger.log("");
    await this.draftTopPlayers(players);
  }

  private scorePlayer(players: PlayerScore[], playerId: number) {
    const player = players.find((x) => x.player.id === playerId)!;
    this.logger.log(JSON.stringify(player.scoreDetails, null, 2));
    this.logger.log("");
    this.displayService.displayPlayers([player]);
  }

  private topPlayers(players: PlayerScore[]) {
    this.logger.log("All Players:");
    this.displayService.displayPlayers(players.slice(0, 40));

    this.logger.log("Goalkeepers");
    this.displayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.GOALKEEPER).slice(0, 10)
    );

    this.logger.log("Defenders");
    this.displayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.DEFENDER).slice(0, 20)
    );

    this.logger.log("Midfielders");
    this.displayService.displayPlayers(
      players.filter((player) => player.position.id === PositionMap.MIDFIELDER).slice(0, 20)
    );

    this.logger.log("Forwards");
    this.displayService.displayPlayers(
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
    this.displaySquad(bestSquad, "Best Squad");
  }

  private recommendSquad(players: PlayerScore[], budget: number) {
    this.logger.log(`Recommending squads based on a budget of £${budget}m`);
    const all15Positions = this.recommendationService.recommendATeam(players, fullSquad, budget);
    if (all15Positions.length >= 11) {
      this.displaySquad(all15Positions, "Full Squad");
    }

    const dumpGkp = this.recommendationService.recommendATeam(players, dumpGkpSquad, budget);
    if (dumpGkp.length >= 11) {
      this.displaySquad(dumpGkp, "Dump Goalkeeper Squad");
    }

    const skeleton442 = this.recommendationService.recommendATeam(
      players,
      skeleton442Squad,
      budget
    );
    if (skeleton442.length >= 11) {
      this.displaySquad(skeleton442, "Skeleton 442 Squad");
    }

    const skeleton433 = this.recommendationService.recommendATeam(
      players,
      skeleton433Squad,
      budget
    );
    if (skeleton433.length >= 11) {
      this.displaySquad(skeleton433, "Skeleton 433 Squad");
    }

    const skeleton343 = this.recommendationService.recommendATeam(
      players,
      skeleton343Squad,
      budget
    );
    if (skeleton343.length >= 11) {
      this.displaySquad(skeleton343, "Skeleton 343 Squad");
    }

    const skeleton532 = this.recommendationService.recommendATeam(
      players,
      skeleton532Squad,
      budget
    );
    if (skeleton532.length >= 11) {
      this.displaySquad(skeleton532, "Skeleton 532 Squad");
    }
  }

  private wildcardSquad(playerScores: PlayerScore[], myTeam: MyTeam) {
    const totalSales = myTeam.picks.reduce((total, pick) => total + pick.selling_price, 0) / 10;
    const buyPriceDict = [] as number[];
    myTeam.picks.forEach(
      (pick) =>
        (buyPriceDict[pick.element] = playerScores.find((x) => x.player.id === pick.element)!.value)
    );
    const budget = totalSales + myTeam.transfers.bank / 10;
    this.setPlayersValueBasedOnTeamPick(
      playerScores,
      myTeam,
      (pick: FantasyPick) => pick.selling_price / 10
    );
    this.recommendSquad(playerScores, budget);
    this.setPlayersValueBasedOnTeamPick(
      playerScores,
      myTeam,
      (pick: FantasyPick) => buyPriceDict[pick.element]
    );
  }

  private async recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    useDumpPlayers: boolean,
    debug: boolean
  ) {
    return this.recommendationService.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      useDumpPlayers ? DumpPlayerSettings.DumpPlayers : DumpPlayerSettings.DumpGoalkeeper,
      debug
    );
  }

  private async performTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    nextEvent: Gameweek,
    teamId: number,
    useDumpPlayers: boolean
  ) {
    const recommendation = await this.recommendTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      useDumpPlayers,
      false
    );
    const didPerformTransfer = await this.transferService.performTransfers(
      recommendation,
      nextEvent,
      myTeam,
      teamId
    );
    if (didPerformTransfer) {
      this.logger.log("Successfully performed transfers");
    } else {
      this.logger.log("Did not perform transfer");
    }
  }

  private recommendLineup(picksWithScore: TeamPickWithScore[]) {
    const lineup = this.lineupService.recommendLineup(picksWithScore.map((p) => p.playerScore));
    this.displayService.displaySquad(lineup, "My Squad");
    return lineup;
  }

  private async setLineup(picksWithScore: TeamPickWithScore[], teamId: number, draft: boolean) {
    const lineup = this.recommendLineup(picksWithScore);
    await this.lineupService.setLineup(lineup, teamId, draft);
    this.logger.log("Successfully updated lineup");
  }

  private async recordData(players: PlayerScore[], nextEventId: number) {
    await this.dataRecorder.recordData(players, nextEventId);
  }

  private async draftTopPlayers(players: PlayerScore[]) {
    const availablePlayers = await this.draftService.getTopAvailablePlayers(players);
    if (availablePlayers) {
      this.logger.log("Available Players:");
      this.topPlayers(availablePlayers);
      this.logger.log("");
    }
    this.logger.log("Best Players:");
    this.topPlayers(players);
  }

  private async recommendTransactions(
    players: PlayerScore[],
    picksWithScore: TeamPickWithScore[],
    onlySuggestLowPriceTransactions: boolean
  ) {
    return await this.draftService.recommendTransactions(
      players,
      picksWithScore,
      onlySuggestLowPriceTransactions
    );
  }

  private async performTransactions(
    players: PlayerScore[],
    picksWithScore: TeamPickWithScore[],
    teamId: number
  ) {
    const transactions = await this.recommendTransactions(players, picksWithScore, true);
    await this.draftService.performTransactions(transactions, teamId);
    this.logger.log("Successfully set transactions");
  }

  private async getMyTeamId(draft: boolean) {
    if (draft) {
      const draftInfo = await this.fplFetcher.getMyDraftInfo();
      if (draftInfo.player.entry_set.length === 0) {
        this.logger.log("No draft entries!");
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

  private displaySquad(players: PlayerScore[], squadName: string) {
    const lineup = this.lineupService.recommendLineup(players);
    this.displayService.displaySquad(lineup, squadName);
  }

  private setPlayersValueBasedOnTeamPick(
    players: PlayerScore[],
    team: MyTeam,
    valueFetcher: (pick: FantasyPick) => number
  ) {
    players.forEach((player) => {
      const matchingPick = team.picks.find((pick) => pick.element === player.player.id);
      if (matchingPick) {
        player.value = valueFetcher(matchingPick);
      }
    });
  }
}
