export default class PlayerScore {
  constructor(
    public player: PlayerOverview,
    public position: Position,
    public value: number,
    public score: number,
    public scoreDetails: ScoreDetails
  ) {}
}
