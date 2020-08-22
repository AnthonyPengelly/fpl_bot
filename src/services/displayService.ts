import PlayerScore from "../models/PlayerScore";
import { TransferWithScores } from "../models/TransferWithScores";
import { Lineup } from "../models/Lineup";

export default class DisplayService {
  static displaySquad(lineup: Lineup, squadName: string) {
    const allPlayers = lineup.starting11.concat(lineup.orderedSubs);
    console.log("");
    console.log(squadName);
    const sortedStarting11 = lineup.starting11.sort((a, b) => a.position.id - b.position.id);
    this.displayPlayers(sortedStarting11);
    const starting11Score = sortedStarting11.reduce((total, player) => total + player.score, 0);
    console.log(`Score: ${starting11Score.toFixed(2)}`);
    console.log(`Score per player: ${(starting11Score / sortedStarting11.length).toFixed(2)}`);
    console.log("");
    console.log("Subs");
    this.displayPlayers(lineup.orderedSubs);
    console.log(allPlayers.length + " players");
    const value = allPlayers.reduce((total, player) => total + player.value, 0);
    if (value) {
      console.log(`Value £${value.toFixed(2)}m`);
    }
    const squadScore = allPlayers.reduce((total, player) => total + player.score, 0);
    console.log(`Total Score: ${squadScore.toFixed(2)}`);
    console.log(`Score per player: ${(squadScore / allPlayers.length).toFixed(2)}`);
    console.log("");
    console.log(`Captain: ${lineup.captain.player.web_name}`);
    console.log(`Vice Captain: ${lineup.viceCaptain.player.web_name}`);
    console.log("");
  }

  static displayPlayers(players: PlayerScore[]) {
    const displayValue = !!players[0].value;
    this.displayHeader(displayValue);
    players.forEach((player) => this.displayPlayer(player, displayValue));
    console.log("");
  }

  static displayPlayer(playerScore: PlayerScore, displayValue: boolean = true) {
    console.log(
      `| ${playerScore.player.id}\t| ${
        displayValue ? `£${playerScore.value.toFixed(2)}m\t|` : ""
      } ${playerScore.score.toFixed(2)}\t| ${playerScore.position.singular_name_short}\t\t| ${
        playerScore.player.web_name
      }`
    );
  }

  static displayTransfer(transfer: TransferWithScores) {
    console.log("");
    console.log("Players Out:");
    DisplayService.displayPlayers(transfer.playersOut);
    console.log("");
    console.log("Players In:");
    DisplayService.displayPlayers(transfer.playersIn);
    console.log("");
    console.log(`Score improvement: ${transfer.scoreImprovement.toFixed(2)}`);
    console.log("");
  }

  static displayHeader(displayValue: boolean = true) {
    console.log(`| ID\t|${displayValue ? "Value\t\t|" : ""} Score\t| Position\t| Name`);
  }

  static displayTransactionHeader(displayValue: boolean = true) {
    console.log(`| ID\t|Improvement\t| Score\t| Position\t| Name`);
  }
}
