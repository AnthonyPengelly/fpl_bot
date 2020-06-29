import FplFetcher from "../fetchers/fplFetcher";
import PlayerScore from "../models/PlayerScore";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransferWithScores } from "../models/TransferWithScores";
import DisplayService from "./displayService";

export default class DraftService {
  constructor(private fplFetcher: FplFetcher) {}

  async getTopAvailablePlayers(allPlayers: PlayerScore[]) {
    const draftInfo = await this.fplFetcher.getMyDraftInfo();
    if (draftInfo.leagues.length === 0) {
      console.log("Not part of any draft leagues!");
      return;
    }
    const draftStatus = await this.fplFetcher.getDraftStatus(draftInfo.leagues[0].id);
    const availablePlayers = draftStatus.element_status.filter(
      (draftPlayer) => draftPlayer.owner === null
    );
    return allPlayers.filter((player) =>
      availablePlayers.find((draftPlayer) => draftPlayer.element === player.player.id)
    );
  }

  async recommendTransactions(
    players: PlayerScore[],
    picksWithScore: TeamPickWithScore[]
  ): Promise<TransferWithScores[]> {
    const availablePlayers = await this.getTopAvailablePlayers(players);
    if (!availablePlayers) {
      console.log("Not part of any draft leagues!");
      return [];
    }
    const recommendations = picksWithScore.reduce((array, pick) => {
      const transfers = this.recommendTransactionsForPlayer(availablePlayers, pick.playerScore);
      return array.concat(transfers);
    }, [] as TransferWithScores[]);
    const sortedRecommendations = recommendations.sort(
      (a, b) => b.scoreImprovement - a.scoreImprovement
    );
    const rejectedTransactions = sortedRecommendations.filter((x) => x.playersOut[0].value >= 7.5);
    const acceptedTransactions = sortedRecommendations.filter((x) => x.playersOut[0].value < 7.5);
    console.log("Transactions rejected due to high value of player out:");
    rejectedTransactions.forEach(DisplayService.displayTransfer);
    console.log();
    console.log("Transactions proposed:");
    acceptedTransactions.forEach(DisplayService.displayTransfer);
    console.log();
    return acceptedTransactions;
  }

  recommendTransactionsForPlayer(
    players: PlayerScore[],
    playerOut: PlayerScore
  ): TransferWithScores[] {
    return players
      .filter((player) => player.position.id === playerOut.position.id)
      .filter((player) => player.score > playerOut.score)
      .slice(0, 5)
      .map((player) => ({
        playersOut: [playerOut],
        playersIn: [player],
        scoreImprovement: player.score - playerOut.score,
      }));
  }
}
