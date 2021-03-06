import ScoreService from "./scoreService";
import PlayerScore from "../models/PlayerScore";
import DataRecorder from "./dataRecorder";
import { Logger } from './logger';

export default class PlayersService {
  constructor(private dataRecorder: DataRecorder, private logger: Logger) {}

  async getAllPlayerScores(overview: Overview, fixtures: Fixture[], nextEventId: number) {
    const teams = this.indexTeams(overview.teams);
    this.logger.log(`Scoring ${overview.elements.length} players`);
    const fixturesPlayed = fixtures.filter((x) => x.finished);
    const gameweeksPlayed = new Set(fixturesPlayed.map((x) => x.event)).size;
    const previousData = await this.dataRecorder.getLatestScores();

    const scorePromises = overview.elements.map(async (player) => {
      const team = teams[player.team];
      try {
        const opponents = this.getOpponents(
          team,
          teams,
          this.getGameweekFixtures(team, fixtures, nextEventId)
        );
        const futureOpponents = this.getOpponents(
          team,
          teams,
          this.getFutureGameweekFixtures(team, fixtures, nextEventId)
        );
        const scoreDetails = ScoreService.calculateScore(
          player,
          team,
          opponents,
          futureOpponents,
          gameweeksPlayed,
          previousData?.playerData.find((x) => x.code === player.code)?.scoreDetails
        );
        return new PlayerScore(
          player,
          overview.element_types.filter((e) => e.id === player.element_type)[0],
          player.now_cost / 10,
          scoreDetails.score,
          scoreDetails
        );
      } catch (e) {
        this.logger.log(`Failed to score ${player.web_name}`);
        return;
      }
    });
    const playerScores = await Promise.all(scorePromises);
    return (playerScores.filter((player) => player) as PlayerScore[]).sort(this.compareScores);
  }

  private getOpponents(team: Team, teams: Team[], fixtures: Fixture[]) {
    const homeFixtures = fixtures.filter((fixture) => fixture.team_h === team.id);
    const awayFixtures = fixtures.filter((fixture) => fixture.team_a === team.id);
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

  private getGameweekFixtures(team: Team, fixtures: Fixture[], nextEventId: number) {
    return fixtures.filter(
      (fixture) =>
        fixture.event === nextEventId && (fixture.team_h === team.id || fixture.team_a === team.id)
    );
  }

  private getFutureGameweekFixtures(team: Team, fixtures: Fixture[], nextEventId: number) {
    return fixtures.filter(
      (fixture) =>
        fixture.event > nextEventId &&
        fixture.event <= nextEventId + 3 &&
        (fixture.team_h === team.id || fixture.team_a === team.id)
    );
  }

  private indexTeams(teams: Team[]) {
    var indexedTeams: Team[] = [];
    teams.forEach((team) => {
      indexedTeams[team.id] = team;
    });
    return indexedTeams;
  }

  private compareScores = (a: PlayerScore, b: PlayerScore) => b.score - a.score;
}
