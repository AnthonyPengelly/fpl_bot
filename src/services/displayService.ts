import PlayerScore from "../models/PlayerScore";

export default class DisplayService {
  static displaySquad(players: PlayerScore[], squadName: string) {
    console.log();
    console.log(squadName);
    const sortedPlayers = players.sort((a, b) => a.position.id - b.position.id);
    this.displayPlayers(sortedPlayers);
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
  }

  static displayPlayers(players: PlayerScore[]) {
    this.displayHeader();
    players.forEach((player) => this.displayPlayer(player));
    console.log();
  }

  static displayPlayer(playerScore: PlayerScore) {
    console.log(
      `| ${playerScore.player.id}\t| £${playerScore.value.toFixed(
        2
      )}m\t| ${playerScore.score.toFixed(2)}\t| ${
        playerScore.position.singular_name_short
      }\t\t| ${playerScore.player.web_name}`
    );
  }

  static displayHeader() {
    console.log("| ID\t| Value\t\t| Score\t| Position\t| Name");
  }
}
