import moment from "moment";
import { DumpPlayerSettings } from "../config/dumpPlayerSettings";
import { dumpGkpSquad } from "../config/optimisationSettings";
import TwitterApiClient from "../fetchers/twitterApiClient";
import { Lineup } from "../models/Lineup";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransferWithScores } from "../models/TransferWithScores";
import LineupService from "./lineupService";
import { Logger } from "./logger";
import RecommendationService from "./recommendationService";

export default class TwitterService {
  constructor(
    private lineupService: LineupService,
    private recommendationService: RecommendationService,
    private twitterApiClient: TwitterApiClient,
    private logger: Logger
  ) {}

  async tweet(
    players: PlayerScore[],
    overview: Overview,
    fixtures: Fixture[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    currentGameweekPicksWithScore: TeamPickWithScore[]
  ): Promise<void> {
    const currentGameweek = overview.events.filter((event) => event.is_current)[0];
    const nextGameweek = overview.events.filter((event) => event.is_next)[0];
    if ((!currentGameweek || currentGameweek.finished) && !nextGameweek) {
      this.logger.log("No upcoming gameweeks");
    }
    const timeNow = moment();
    const deadlineTime = moment(nextGameweek.deadline_time);
    const daysTilDeadline = deadlineTime.diff(timeNow, "hours") / 24;
    const daysSincePreviousGameweekFinished = this.daysSincePreviousGameweekFinished(
      currentGameweek,
      fixtures
    );
    if (!currentGameweek?.finished) {
      return await this.gameweekProgress(currentGameweekPicksWithScore);
    }
    if (
      currentGameweek?.finished &&
      daysSincePreviousGameweekFinished &&
      daysSincePreviousGameweekFinished < 1
    ) {
      await this.gameweekResult(currentGameweekPicksWithScore);
      // Don't return - Allow another tweet too
    }
    if (daysTilDeadline < 1) {
      await this.myTeam(picksWithScore);
      await this.topPlayers(players);
      return await this.wildcardSquad(players);
    }
    if (daysTilDeadline < 2) {
      await this.myTransfers(players, myTeam, picksWithScore);
      return await this.bestSquad(players);
    }
    if (daysTilDeadline < 3) {
      await this.budgetOptions(players);
      return await this.midPriceOptions(players);
    }
    if (daysTilDeadline < 4) {
      await this.bestMidfielders(players);
      return await this.bestForwards(players);
    }
    if (daysTilDeadline < 5) {
      await this.bestDefenders(players);
      return await this.bestGoalkeepers(players);
    }
    if (daysTilDeadline < 6) {
      return await this.topPlayers(players);
    }
    if (daysTilDeadline < 7) {
      return await this.wildcardSquad(players);
    }
    if (daysTilDeadline < 8) {
      return await this.bestSquad(players);
    }
    if (daysTilDeadline < 9) {
      return await this.budgetOptions(players);
    }
    if (daysTilDeadline < 10) {
      return await this.midPriceOptions(players);
    }
    if (daysTilDeadline < 11) {
      return await this.bestMidfielders(players);
    }
    if (daysTilDeadline < 12) {
      return await this.bestForwards(players);
    }
    if (daysTilDeadline < 13) {
      return await this.bestDefenders(players);
    }
    if (daysTilDeadline < 14) {
      return await this.bestGoalkeepers(players);
    }
    this.logger.log(`No gameweek for ${daysTilDeadline} days, not tweeting`);
  }

  private async gameweekProgress(currentGameweekPicksWithScore: TeamPickWithScore[]) {
    this.logger.log("tweet progress");
    await this.tweetGameweekProgress(currentGameweekPicksWithScore, "Progress so far");
  }

  private async gameweekResult(currentGameweekPicksWithScore: TeamPickWithScore[]) {
    this.logger.log("tweet result");
    await this.tweetGameweekProgress(currentGameweekPicksWithScore, "Did you beat me this week?");
  }

  private async myTeam(picksWithScore: TeamPickWithScore[]) {
    this.logger.log("tweet my team");
    const lineup = this.lineupService.recommendLineup(
      picksWithScore.map((pick) => pick.playerScore)
    );
    await this.tweetLineup(lineup, "Here's my team for this week - fingers crossed!");
  }

  private async myTransfers(
    players: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[]
  ) {
    this.logger.log("tweet my transfers");
    const transfer = this.recommendationService.recommendTransfers(
      players,
      myTeam,
      picksWithScore,
      DumpPlayerSettings.DumpGoalkeeper,
      false
    );
    await this.tweetTransfer(transfer);
  }

  private async bestSquad(players: PlayerScore[]) {
    this.logger.log("tweet best squad for the gameweek");
    await this.tweetBestSquad(players);
  }

  private async topPlayers(players: PlayerScore[]) {
    this.logger.log("tweet top players");
    await this.tweetPlayers(players.slice(0, 8), "These are my top picks for this week");
  }

  private async wildcardSquad(players: PlayerScore[]) {
    this.logger.log("tweet best squad for £100m");
    const squad = this.recommendationService.recommendATeam(players, dumpGkpSquad, 100);
    if (squad.length === 15) {
      const lineup = this.lineupService.recommendLineup(squad);
      await this.tweetLineup(lineup, "Top squad for £100m imo, wildcard anyone?");
    }
  }

  private async midPriceOptions(players: PlayerScore[]) {
    this.logger.log("tweet best players under £8m");
    await this.tweetPlayers(
      players.filter((player) => player.value <= 8).slice(0, 8),
      "These mid-price options (< £8m) are looking good!"
    );
  }

  private async budgetOptions(players: PlayerScore[]) {
    this.logger.log("tweet best players under £6m");
    await this.tweetPlayers(
      players.filter((player) => player.value <= 6).slice(0, 8),
      "I'm tipping these budget options (< £6m)"
    );
  }

  private async bestMidfielders(players: PlayerScore[]) {
    this.logger.log("tweet best midfielders");
    await this.tweetPlayers(
      players.filter((player) => player.position.id === PositionMap.MIDFIELDER).slice(0, 8),
      "The top Midfielders going into the next GW"
    );
  }

  private async bestForwards(players: PlayerScore[]) {
    this.logger.log("tweet best forwards");
    await this.tweetPlayers(
      players.filter((player) => player.position.id === PositionMap.FORWARD).slice(0, 8),
      "The top Forwards going into the next GW"
    );
  }

  private async bestDefenders(players: PlayerScore[]) {
    this.logger.log("tweet best defenders");
    await this.tweetPlayers(
      players.filter((player) => player.position.id === PositionMap.DEFENDER).slice(0, 8),
      "The top Defenders going into the next GW"
    );
  }

  private async bestGoalkeepers(players: PlayerScore[]) {
    this.logger.log("tweet best goalkeepers");
    await this.tweetPlayers(
      players.filter((player) => player.position.id === PositionMap.GOALKEEPER).slice(0, 8),
      "The top Goalkeepers going into the next GW"
    );
  }

  private async tweetGameweekProgress(picks: TeamPickWithScore[], message: string) {
    const sortedPicks = picks.sort((a, b) => a.pick.position - b.pick.position);
    const score = sortedPicks.reduce(
      (acc, pick) => acc + pick.pick.multiplier * pick.playerScore.player.event_points,
      0
    );
    const pickedPlayers = sortedPicks.filter((pick) => pick.pick.multiplier > 0);
    const subbedPlayers = sortedPicks.filter((pick) => pick.pick.multiplier === 0);
    const tweet = `${message} - ${score}pts\n\n${pickedPlayers
      .map((pick) =>
        this.getPlayerTextwithScore(
          pick.playerScore,
          pick.pick.multiplier * pick.playerScore.player.event_points,
          pick.pick.is_captain,
          pick.pick.is_vice_captain
        )
      )
      .join("\n")}\n\n${subbedPlayers
      .map((pick) =>
        this.getPlayerTextwithScore(pick.playerScore, pick.playerScore.player.event_points)
      )
      .join("\n")}\n\n#FPL`;
    this.logger.log(tweet);
    this.logger.log(`length: ${tweet.length}`);
    await this.twitterApiClient.tweet(tweet);
  }

  private async tweetBestSquad(players: PlayerScore[]): Promise<void> {
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
    const lineup = this.lineupService.recommendLineup(
      goalkeepers.concat(defenders, midfielders, forwards)
    );
    await this.tweetLineup(lineup, "I reckon this is the best squad for this week $$$");
  }

  private async tweetTransfer(transfer: TransferWithScores): Promise<void> {
    const tweet =
      `I'm probably making this transfer next - how 'bout you?\n\nIN:\n` +
      `${transfer.playersIn
        .map((player) => this.getPlayerText(player, true))
        .join("\n")}\n\nOUT:\n` +
      `${transfer.playersOut.map((player) => this.getPlayerText(player, true)).join("\n")}\n\n#FPL`;

    this.logger.log(tweet);
    this.logger.log(`length: ${tweet.length}`);
    await this.twitterApiClient.tweet(tweet);
  }

  private async tweetPlayers(players: PlayerScore[], message: string): Promise<void> {
    const tweet =
      `${message}\n\n` +
      `${players
        .map((player, i) => this.getPlayerText(player, true, false, false, i + 1))
        .join("\n")}\n\n#FPL`;

    this.logger.log(tweet);
    this.logger.log(`length: ${tweet.length}`);
    await this.twitterApiClient.tweet(tweet);
  }

  private async tweetLineup(lineup: Lineup, message: string): Promise<void> {
    const allPlayers = lineup.starting11.concat(lineup.orderedSubs);
    const value = allPlayers.reduce((total, player) => total + player.value, 0);
    const sorted11 = lineup.starting11.sort((a, b) => a.position.id - b.position.id);
    const tweet =
      `${message}\n\nStarting Lineup:\n` +
      `${sorted11
        .map((player) =>
          this.getPlayerText(
            player,
            false,
            player.player.id === lineup.captain.player.id,
            player.player.id === lineup.viceCaptain.player.id
          )
        )
        .join("\n")}\n\nSubs:\n` +
      `${lineup.orderedSubs
        .map((player) => this.getPlayerText(player, false))
        .join("\n")}\n\n£${value.toFixed(1)}m\n#FPL`;

    this.logger.log(tweet);
    this.logger.log(`length: ${tweet.length}`);
    await this.twitterApiClient.tweet(tweet);
  }

  private getPlayerText(
    player: PlayerScore,
    showPrice: boolean,
    isCaptain: boolean = false,
    isVice: boolean = false,
    index?: number
  ): string {
    const captainToken = isCaptain ? " (c)" : isVice ? " (v)" : "";
    return `${index ? index + ". " : ""}${player.player.web_name}${captainToken}${
      showPrice ? ` - £${player.value.toFixed(1)}m` : ""
    }`;
  }

  private getPlayerTextwithScore(
    player: PlayerScore,
    score: number,
    isCaptain: boolean = false,
    isVice: boolean = false
  ): string {
    const captainToken = isCaptain ? "(c)" : isVice ? "(v)" : "";
    return `${score} ${player.player.web_name}${captainToken}`;
  }

  private daysSincePreviousGameweekFinished(
    gameweek: Gameweek | undefined,
    fixtures: Fixture[]
  ): number | undefined {
    if (!gameweek) {
      return;
    }
    const previousFixtures = fixtures.filter((fixture) => fixture.event === gameweek.id);
    const latestFixture = previousFixtures.sort((a, b) =>
      moment(b.kickoff_time).diff(moment(a.kickoff_time))
    )[0];
    const timeNow = moment();
    const kickoffTime = moment(latestFixture.kickoff_time);
    return timeNow.diff(kickoffTime, "hours") / 24;
  }
}
