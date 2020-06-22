export default class PlayerScore {
  constructor(
    public player: Player,
    public position: Position,
    public value: number,
    public score: number,
    public roi: number
  ) {}
}
