import * as ScoreWeightings from "../config/scoreWeightings";
import { PositionMap } from "../models/PositionMap";

export default class ScoreService {
  static calculateScore(
    player: Player,
    team: Team,
    opponentFixtures: OpponentFixture[]
  ) {
    var score = 0;
    score +=
      (player.form * ScoreWeightings.Form.Weighting) / ScoreWeightings.Form.Max;
    score +=
      (player.points_per_game * ScoreWeightings.PointsPerGame.Weighting) /
      ScoreWeightings.PointsPerGame.Max;
    score +=
      (player.ict_index * ScoreWeightings.ICTIndex.Weighting) /
      ScoreWeightings.ICTIndex.Max;
    score +=
      (team.strength * ScoreWeightings.TeamStrength.Weighting) /
      ScoreWeightings.TeamStrength.Max;
    score = score * opponentFixtures.length;
    opponentFixtures.forEach((opponentFixture) => {
      score -=
        (opponentFixture.opponent.strength *
          ScoreWeightings.TeamStrength.Weighting) /
        ScoreWeightings.TeamStrength.Max;
      score +=
        (this.teamStrengthForPosition(player, team, opponentFixture.isHome) *
          ScoreWeightings.TeamStrengthForPosition.Weighting) /
        ScoreWeightings.TeamStrengthForPosition.Max;
    });
    score =
      (score * player.chance_of_playing_next_round) /
      ScoreWeightings.ChanceOfPlaying.Max;
    return score;
  }

  private static teamStrengthForPosition(
    player: Player,
    team: Team,
    isHome: boolean
  ) {
    if (
      player.element_type === PositionMap.GOALKEEPER ||
      PositionMap.DEFENDER
    ) {
      return isHome ? team.strength_defence_home : team.strength_defence_away;
    }
    return isHome ? team.strength_attack_home : team.strength_attack_away;
  }
}
