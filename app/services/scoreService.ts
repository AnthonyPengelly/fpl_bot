import FplFetcher from '../fetchers/fplFetcher';
import PlayerScore from '../models/PlayerScore';

export default class ScoreService {
    static async scoreAllPlayers() {
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
                this.calculatePoints(player, team, opponents)
            ));
        });
        return playerScores;
    }

    private static calculatePoints(player: Player, team: Team, opponents: Array<Team>) {
        console.log(player.web_name + " - " + team.name);
        console.log(opponents);
        return 10;
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
}