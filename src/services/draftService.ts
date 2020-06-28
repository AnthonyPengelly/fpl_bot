import FplFetcher from "../fetchers/fplFetcher";
import PlayerScore from "../models/PlayerScore";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransactionPlayerIn, Transaction } from "../models/Transaction";

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
  ): Promise<Transaction[]> {
    const availablePlayers = await this.getTopAvailablePlayers(players);
    if (!availablePlayers) {
      console.log("Not part of any draft leagues!");
      return [];
    }
    const recommendations = picksWithScore
      .map((pick) => ({
        playerOut: pick.playerScore,
        playersIn: this.recommendTransactionsForPlayer(availablePlayers, pick.playerScore),
      }))
      .filter((x) => x.playersIn.length !== 0);
    return recommendations.sort((a, b) => b.playersIn[0].improvement - a.playersIn[0].improvement);
  }

  recommendTransactionsForPlayer(
    players: PlayerScore[],
    playerOut: PlayerScore
  ): TransactionPlayerIn[] {
    return players
      .filter((player) => player.position.id === playerOut.position.id)
      .filter((player) => player.score > playerOut.score)
      .slice(0, 10)
      .map((player) => ({
        player: player,
        improvement: player.score - playerOut.score,
      }));
  }
}
