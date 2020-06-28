import PlayerScore from "../models/PlayerScore";
import { TransferWithScores } from "../models/TransferWithScores";

export default class DisplayService {
  static displaySquad(players: PlayerScore[], squadName: string) {
    console.log();
    console.log(squadName);
    const sortedPlayers = players.sort((a, b) => a.position.id - b.position.id);
    this.displayPlayers(sortedPlayers);
    console.log(sortedPlayers.length + " players");
    const value = sortedPlayers.reduce((total, player) => total + player.value, 0);
    if (value) {
      console.log(`Value £${value.toFixed(2)}m`);
    }
    const squadScore = sortedPlayers.reduce((total, player) => total + player.score, 0);
    console.log(`Score: ${squadScore.toFixed(2)}`);
    console.log(`Score per player: ${(squadScore / sortedPlayers.length).toFixed(2)}`);
    console.log();
  }

  static displayPlayers(players: PlayerScore[]) {
    const displayValue = !!players[0].value;
    this.displayHeader(displayValue);
    players.forEach((player) => this.displayPlayer(player, displayValue));
    console.log();
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
    console.log();
    console.log("Players Out:");
    DisplayService.displayPlayers(transfer.playersOut);
    console.log();
    console.log("Players In");
    DisplayService.displayPlayers(transfer.playersIn);
    console.log();
    console.log(`Score improvement: ${transfer.scoreImprovement.toFixed(2)}`);
    console.log();
  }

  static displayHeader(displayValue: boolean = true) {
    console.log(`| ID\t|${displayValue ? "Value\t\t|" : ""} Score\t| Position\t| Name`);
  }
}
