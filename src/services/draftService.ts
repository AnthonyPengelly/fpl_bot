import FplFetcher from "../fetchers/fplFetcher";
import PlayerScore from "../models/PlayerScore";

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
}
