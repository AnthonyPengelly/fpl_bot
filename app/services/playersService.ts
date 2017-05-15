import FplFetcher from '../fetchers/fplFetcher';
import ScoreService from './scoreService';
import PlayerScore from '../models/PlayerScore';

export default class PlayersService {
    static async getAllPlayers() {
        var playerScores = Array<PlayerScore>();
        var overview =  await FplFetcher.getOverview();
        var teams = this.indexTeams(overview.teams);

        overview.elements.forEach(player => {
            var team = teams[player.team];
            var opponents = this.getOpponents(team, teams);
            playerScores.push(new PlayerScore(
                player.id,
                player.web_name,
                player.now_cost / 10,
                ScoreService.calculateScore(player, team, opponents)
            ));
        });
        return playerScores.sort(this.compare);
    }

    private static getOpponents(team: Team, teams: Array<Team>) {
        var opponents = Array<Team>();
        team.next_event_fixture.forEach((fixture) => {
            opponents.push(teams[fixture.opponent]);
        })
        return opponents;
    }

    private static indexTeams(teams: Array<Team>) {
        var indexedTeams = Array<Team>();
        teams.forEach(team => {
            indexedTeams[team.id] = team;
        })
        return indexedTeams;
    }

    private static compare(a: PlayerScore, b: PlayerScore) {
        if (a.score < b.score) {
            return 1;
        }
        if (a.score > b.score) {
            return -1;
        }
        return 0;
    }
}