import PlayerScore from "../../models/PlayerScore";
import { TeamPickWithScore } from "../../models/TeamPickWithScore";
import PlayerScoreBuilder from "./playerScoreBuilder";

export default class TeamPickWithScoreBuilder {
  private teamPickWithScore: TeamPickWithScore;

  constructor() {
    const playerScore = new PlayerScoreBuilder().build();
    this.teamPickWithScore = {
      playerScore: playerScore,
      pick: { element: playerScore.player.id, selling_price: 5 } as FantasyPick,
    };
  }

  withPlayerScore(playerScore: PlayerScore) {
    this.teamPickWithScore.playerScore = playerScore;
    return this;
  }

  withSellPrice(price: number) {
    this.teamPickWithScore.pick.selling_price = price;
    return this;
  }

  build() {
    return this.teamPickWithScore;
  }
}
