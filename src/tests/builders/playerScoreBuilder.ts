import PlayerScore from "../../models/PlayerScore";

export default class PlayerScoreBuilder {
  private playerScore: PlayerScore;

  constructor() {
    this.playerScore = new PlayerScore(
      {
        id: Math.ceil(Math.random() * 1000000),
        team: Math.ceil(Math.random() * 1000000),
      } as PlayerOverview,
      {
        id: Math.ceil(Math.random() * 1000000),
      } as Position,
      0,
      0,
      {} as ScoreDetails
    );
  }

  withPlayerId(id: number) {
    this.playerScore.player.id = id;
    return this;
  }

  withTeamId(id: number) {
    this.playerScore.player.team = id;
    return this;
  }

  withPositionId(id: number) {
    this.playerScore.position.id = id;
    return this;
  }

  withValue(value: number) {
    this.playerScore.value = value;
    return this;
  }

  withScore(score: number) {
    this.playerScore.score = score;
    return this;
  }

  build() {
    return this.playerScore;
  }
}
