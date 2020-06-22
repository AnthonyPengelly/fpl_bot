import FplFetcher from "../fetchers/fplFetcher";
import ScoreService from "./scoreService";
import PlayerScore from "../models/PlayerScore";

export default class PlayersService {
  constructor(private fplFetcher: FplFetcher) {}

  async getAllPlayerScores() {
    const playerScores: PlayerScore[] = [];
    const overview = await this.fplFetcher.getOverview();
    const nextEvent = overview.events.filter((event) => event.is_next)[0];
    const fixtures = await this.fplFetcher.getFixtures(nextEvent.id);
    const teams = this.indexTeams(overview.teams);

    overview.elements.forEach((player) => {
      const team = teams[player.team];
      const opponents = this.getOpponents(team, teams, fixtures);
      const score = ScoreService.calculateScore(player, team, opponents);
      playerScores.push(
        new PlayerScore(
          player,
          overview.element_types.filter((e) => e.id === player.element_type)[0],
          player.now_cost / 10,
          score,
          (score / player.now_cost) * 100
        )
      );
    });
    return playerScores;
  }

  private getOpponents(team: Team, teams: Team[], fixtures: Fixture[]) {
    const homeFixtures = fixtures.filter(
      (fixture) => fixture.team_h === team.id
    );
    const awayFixtures = fixtures.filter(
      (fixture) => fixture.team_a === team.id
    );
    const homeOpponentIds = homeFixtures.map((fixture) => fixture.team_a);
    const awayOpponentIds = awayFixtures.map((fixture) => fixture.team_h);
    const homeOpponents = homeOpponentIds
      .map((id) => teams.filter((team) => team.id === id)[0])
      .map((opponent) => ({ opponent, isHome: true })) as OpponentFixture[];
    const awayOpponents = awayOpponentIds
      .map((id) => teams.filter((team) => team.id === id)[0])
      .map((opponent) => ({ opponent, isHome: false })) as OpponentFixture[];
    return homeOpponents.concat(awayOpponents);
  }

  private indexTeams(teams: Array<Team>) {
    var indexedTeams = Array<Team>();
    teams.forEach((team) => {
      indexedTeams[team.id] = team;
    });
    return indexedTeams;
  }
}
