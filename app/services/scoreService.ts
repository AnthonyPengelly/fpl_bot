import * as ScoreWeightings from "../config/scoreWeightings";

export default class ScoreService {
    static calculateScore(player: Player, team: Team, opponents: Array<Team>) {
        var score = 0;
        score += (player.form * ScoreWeightings.Form.Weighting / ScoreWeightings.Form.Max);
        score += (player.points_per_game * ScoreWeightings.PointsPerGame.Weighting 
            / ScoreWeightings.PointsPerGame.Max);
        score += (player.ict_index * ScoreWeightings.ICTIndex.Weighting / ScoreWeightings.ICTIndex.Max);
        score += (team.strength * ScoreWeightings.TeamStrength.Weighting / ScoreWeightings.TeamStrength.Max);
        return score;
    }

    private static calculateScoreForOpponents(opponents: Array<Team>, team: Team) {
        var score = 0;
        opponents.forEach((opponent) => {
            
        });
    }
}