import FplFetcher from "../fetchers/fplFetcher";
import PlayerScore from "../models/PlayerScore";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransferWithScores } from "../models/TransferWithScores";
import DisplayService from "./displayService";
import { Logger } from "./logger";

export default class DraftService {
  constructor(
    private fplFetcher: FplFetcher,
    private displayService: DisplayService,
    private logger: Logger
  ) {}

  async getTopAvailablePlayers(allPlayers: PlayerScore[]) {
    const draftInfo = await this.fplFetcher.getMyDraftInfo();
    if (draftInfo.leagues.length === 0) {
      this.logger.log("Not part of any draft leagues!");
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
      this.logger.log("Not part of any draft leagues!");
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
    this.logger.log("Transactions rejected due to high value of player out:");
    rejectedTransactions.forEach(this.displayService.displayTransfer);
    this.logger.log("");
    this.logger.log("");
    this.logger.log("");
    this.logger.log("Transactions proposed:");
    acceptedTransactions.forEach(this.displayService.displayTransfer);
    this.logger.log("");
    return acceptedTransactions;
  }

  async performTransactions(transactions: TransferWithScores[], teamId: number) {
    if (transactions.length === 0) {
      this.logger.log("No transactions");
      return;
    }

    const waivers = transactions.map((transaction, index) => ({
      element_out: transaction.playersOut[0].player.id,
      element_in: transaction.playersIn[0].player.id,
      priority: index + 1,
    }));

    await this.fplFetcher.performTransactions(waivers, teamId);
  }

  private recommendTransactionsForPlayer(
    players: PlayerScore[],
    playerOut: PlayerScore
  ): TransferWithScores[] {
    return players
      .filter((player) => player.position.id === playerOut.position.id)
      .filter((player) => player.score > playerOut.score + 5)
      .slice(0, 5)
      .map((player) => ({
        playersOut: [playerOut],
        playersIn: [player],
        scoreImprovement: player.score - playerOut.score,
      }));
  }
}
