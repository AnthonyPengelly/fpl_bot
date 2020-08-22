import PlayerScore from "../models/PlayerScore";
import { TransferWithScores } from "../models/TransferWithScores";
import { Lineup } from "../models/Lineup";
import { Logger } from "./logger";

export default class DisplayService {
  constructor(private logger: Logger) {}

  displaySquad(lineup: Lineup, squadName: string) {
    const allPlayers = lineup.starting11.concat(lineup.orderedSubs);
    this.logger.log("");
    this.logger.log(squadName);
    const sortedStarting11 = lineup.starting11.sort((a, b) => a.position.id - b.position.id);
    this.displayPlayers(sortedStarting11);
    const starting11Score = sortedStarting11.reduce((total, player) => total + player.score, 0);
    this.logger.log(`Score: ${starting11Score.toFixed(2)}`);
    this.logger.log(`Score per player: ${(starting11Score / sortedStarting11.length).toFixed(2)}`);
    this.logger.log("");
    this.logger.log("Subs");
    this.displayPlayers(lineup.orderedSubs);
    this.logger.log(allPlayers.length + " players");
    const value = allPlayers.reduce((total, player) => total + player.value, 0);
    if (value) {
      this.logger.log(`Value £${value.toFixed(2)}m`);
    }
    const squadScore = allPlayers.reduce((total, player) => total + player.score, 0);
    this.logger.log(`Total Score: ${squadScore.toFixed(2)}`);
    this.logger.log(`Score per player: ${(squadScore / allPlayers.length).toFixed(2)}`);
    this.logger.log("");
    this.logger.log(`Captain: ${lineup.captain.player.web_name}`);
    this.logger.log(`Vice Captain: ${lineup.viceCaptain.player.web_name}`);
    this.logger.log("");
  }

  displayPlayers(players: PlayerScore[]) {
    const displayValue = !!players[0].value;
    this.displayHeader(displayValue);
    players.forEach((player) => this.displayPlayer(player, displayValue));
    this.logger.log("");
  }

  displayPlayer(playerScore: PlayerScore, displayValue: boolean = true) {
    this.logger.log(
      `| ${playerScore.player.id}\t| ${
        displayValue ? `£${playerScore.value.toFixed(2)}m\t|` : ""
      } ${playerScore.score.toFixed(2)}\t| ${playerScore.position.singular_name_short}\t\t| ${
        playerScore.player.web_name
      }`
    );
  }

  displayTransfer(transfer: TransferWithScores) {
    this.logger.log("");
    this.logger.log("Players Out:");
    this.displayPlayers(transfer.playersOut);
    this.logger.log("");
    this.logger.log("Players In:");
    this.displayPlayers(transfer.playersIn);
    this.logger.log("");
    this.logger.log(`Score improvement: ${transfer.scoreImprovement.toFixed(2)}`);
    this.logger.log("");
  }

  displayHeader(displayValue: boolean = true) {
    this.logger.log(`| ID\t|${displayValue ? "Value\t\t|" : ""} Score\t| Position\t| Name`);
  }

  displayTransactionHeader(displayValue: boolean = true) {
    this.logger.log(`| ID\t|Improvement\t| Score\t| Position\t| Name`);
  }
}
