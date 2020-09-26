import moment from "moment";
import { DumpPlayerSettings } from "../config/dumpPlayerSettings";
import { dumpGkpSquad } from "../config/optimisationSettings";
import { Lineup } from "../models/Lineup";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransferWithScores } from "../models/TransferWithScores";
import LineupService from "./lineupService";
import RecommendationService from "./recommendationService";

export default class TwitterService {
  constructor(
    private lineupService: LineupService,
    private recommendationService: RecommendationService
  ) {}

  async tweet(
    players: PlayerScore[],
    overview: Overview,
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[]
  ): Promise<void> {
    const currentGameweek = overview.events.filter((event) => event.is_current)[0];
    const nextGameweek = overview.events.filter((event) => event.is_next)[0];
    if (!currentGameweek && !nextGameweek) {
      console.log("No upcoming gameweeks");
    }
    const timeNow = moment();
    const deadlineTime = moment(nextGameweek.deadline_time);
    const daysTilDeadline = deadlineTime.diff(timeNow, "hours") / 24;
    if (currentGameweek) {
      console.log("tweet progress - not yet implemented");
      return;
    }
    if (daysTilDeadline < 1) {
      console.log("tweet my team");
      const lineup = this.lineupService.recommendLineup(
        picksWithScore.map((pick) => pick.playerScore)
      );
      await this.tweetLineup(lineup, "Here's my team for this week - fingers crossed!");
      return;
    }
    if (daysTilDeadline < 2) {
      console.log("tweet my transfers");
      const transfer = this.recommendationService.recommendTransfers(
        players,
        myTeam,
        picksWithScore,
        DumpPlayerSettings.DumpGoalkeeper,
        false
      );
      await this.tweetTransfer(transfer);
      return;
    }
    if (daysTilDeadline < 3) {
      console.log("tweet best squad for the gameweek");
      await this.tweetBestSquad(players);
      return;
    }
    if (daysTilDeadline < 4) {
      console.log("tweet top players");
      await this.tweetPlayers(players.slice(0, 8), "These are my top picks for this week");
      return;
    }
    if (daysTilDeadline < 5) {
      console.log("tweet best squad for £100m");
      const squad = this.recommendationService.recommendATeam(players, dumpGkpSquad, 100);
      if (squad.length === 15) {
        const lineup = this.lineupService.recommendLineup(squad);
        await this.tweetLineup(lineup, "Top squad for £100m imo, wildcard anyone?");
      }
      return;
    }
    if (daysTilDeadline < 6) {
      console.log("tweet best players under £8m");
      await this.tweetPlayers(
        players.filter((player) => player.value <= 8).slice(0, 8),
        "These mid-price options (< £8m) are looking good!"
      );
      return;
    }
    if (daysTilDeadline < 7) {
      console.log("tweet best players under £6m");
      await this.tweetPlayers(
        players.filter((player) => player.value <= 6).slice(0, 8),
        "I'm tipping these budget options (< £6m)"
      );
      return;
    }
    if (daysTilDeadline < 8) {
      console.log("tweet best midfielders");
      await this.tweetPlayers(
        players.filter((player) => player.position.id === PositionMap.MIDFIELDER).slice(0, 8),
        "The top Midfielders going into the next GW"
      );
      return;
    }
    if (daysTilDeadline < 9) {
      console.log("tweet best forwards");
      await this.tweetPlayers(
        players.filter((player) => player.position.id === PositionMap.FORWARD).slice(0, 8),
        "The top Forwards going into the next GW"
      );
      return;
    }
    if (daysTilDeadline < 10) {
      console.log("tweet best defenders");
      await this.tweetPlayers(
        players.filter((player) => player.position.id === PositionMap.DEFENDER).slice(0, 8),
        "The top Defenders going into the next GW"
      );
      return;
    }
    if (daysTilDeadline < 11) {
      console.log("tweet best goalkeepers");
      await this.tweetPlayers(
        players.filter((player) => player.position.id === PositionMap.GOALKEEPER).slice(0, 8),
        "The top Goalkeepers going into the next GW"
      );
      return;
    }
    console.log(`No gameweek for ${daysTilDeadline} days, not tweeting`);
  }

  private tweetBestSquad(players: PlayerScore[]): Promise<void> {
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
    return this.tweetLineup(lineup, "I reckon this is the best squad for this week $$$");
  }

  private async tweetTransfer(transfer: TransferWithScores): Promise<void> {
    const tweet =
      `I'm probably making this transfer next - how 'bout you?\n\nIN:\n` +
      `${transfer.playersIn
        .map((player) => this.getPlayerText(player, true))
        .join("\n")}\n\nOUT:\n` +
      `${transfer.playersOut.map((player) => this.getPlayerText(player, true)).join("\n")}\n\n#FPL`;

    console.log(tweet);
    console.log(`length: ${tweet.length}`);
  }

  private async tweetPlayers(players: PlayerScore[], message: string): Promise<void> {
    const tweet =
      `${message}\n\n` +
      `${players.map((player) => this.getPlayerText(player, true)).join("\n")}\n\n#FPL`;

    console.log(tweet);
    console.log(`length: ${tweet.length}`);
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

    console.log(tweet);
    console.log(`length: ${tweet.length}`);
  }

  private getPlayerText(
    player: PlayerScore,
    showPrice: boolean,
    isCaptain: boolean = false,
    isVice: boolean = false
  ): string {
    const captainToken = isCaptain ? " (c)" : isVice ? " (v)" : "";
    return `${player.player.web_name}${captainToken}${
      showPrice ? ` - £${player.value.toFixed(1)}m` : ""
    }`;
  }
}
