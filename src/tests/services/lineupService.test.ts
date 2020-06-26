// Lots of inputs and expected outputs

import TeamPickWithScoreBuilder from "../builders/teamPickWithScoreBuilder";
import PlayerScoreBuilder from "../builders/playerScoreBuilder";
import { TeamPickWithScore } from "../../models/TeamPickWithScore";
import LineupService from "../../services/lineupService";
import FplFetcher from "../../fetchers/fplFetcher";

const fplFetcher = {} as FplFetcher;
const lineupService = new LineupService(fplFetcher);

const generatePlayers = (
  numberOfDefenders: number,
  numberOfMidfielders: number,
  numberOfForwards: number
) => {
  const goalkeeper = new TeamPickWithScoreBuilder()
    .withPlayerScore(
      new PlayerScoreBuilder().withPlayerId(1).withPositionId(1).withScore(100).build()
    )
    .build();
  const defenders = Array.from(Array(numberOfDefenders), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 2)
          .withPositionId(2)
          .withScore(100)
          .build()
      )
      .build()
  );
  const midfielders = Array.from(Array(numberOfMidfielders), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 2 + numberOfDefenders)
          .withPositionId(3)
          .withScore(100)
          .build()
      )
      .build()
  );
  const forwards = Array.from(Array(numberOfForwards), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 2 + numberOfDefenders + numberOfMidfielders)
          .withPositionId(4)
          .withScore(100)
          .build()
      )
      .build()
  );
  const goalkeeperSub = new TeamPickWithScoreBuilder()
    .withPlayerScore(
      new PlayerScoreBuilder().withPlayerId(12).withPositionId(1).withScore(1).build()
    )
    .build();
  const defenderSubs = Array.from(Array(5 - numberOfDefenders), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 13)
          .withPositionId(2)
          .withScore(1)
          .build()
      )
      .build()
  );
  const midfielderSubs = Array.from(Array(5 - numberOfMidfielders), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 13 + defenderSubs.length)
          .withPositionId(3)
          .withScore(1)
          .build()
      )
      .build()
  );
  const forwardSubs = Array.from(Array(3 - numberOfForwards), (_, i) =>
    new TeamPickWithScoreBuilder()
      .withPlayerScore(
        new PlayerScoreBuilder()
          .withPlayerId(i + 13 + defenderSubs.length + midfielderSubs.length)
          .withPositionId(4)
          .withScore(1)
          .build()
      )
      .build()
  );
  const squad = [goalkeeper, goalkeeperSub].concat(
    defenders,
    defenderSubs,
    midfielders,
    midfielderSubs,
    forwards,
    forwardSubs
  );
  squad.find((x) => x.playerScore.player.id === 5)!.playerScore.score = 150; // Captain
  squad.find((x) => x.playerScore.player.id === 6)!.playerScore.score = 120; // Vice
  return squad;
};

describe("lineupService", () => {
  test.each([
    ["442", generatePlayers(4, 4, 2)],
    ["433", generatePlayers(4, 3, 3)],
    ["451", generatePlayers(4, 5, 1)],
    ["541", generatePlayers(5, 4, 1)],
    ["532", generatePlayers(5, 3, 2)],
    ["343", generatePlayers(3, 4, 3)],
    ["352", generatePlayers(3, 5, 2)],
  ])(
    "Sets lineup to highest score, with a %s formation",
    (formation: string, players: TeamPickWithScore[]) => {
      const result = lineupService.recommendLineup(players);

      expect(result.captain.player.id).toBe(5);
      expect(result.viceCaptain.player.id).toBe(6);
      expect(result.starting11.map((x) => x.player.id)).toEqual(
        expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      );
      expect(result.orderedSubs.map((x) => x.player.id)).toEqual(
        expect.arrayContaining([12, 13, 14, 15])
      );
    }
  );

  test.each([
    ["118", generatePlayers(1, 1, 8)],
    ["127", generatePlayers(1, 2, 7)],
    ["136", generatePlayers(1, 3, 6)],
    ["145", generatePlayers(1, 4, 5)],
    ["154", generatePlayers(1, 5, 4)],
    ["163", generatePlayers(1, 6, 3)],
    ["172", generatePlayers(1, 7, 2)],
    ["181", generatePlayers(1, 8, 1)],
    ["217", generatePlayers(2, 1, 7)],
    ["226", generatePlayers(2, 2, 6)],
    ["235", generatePlayers(2, 3, 5)],
    ["244", generatePlayers(2, 4, 4)],
    ["253", generatePlayers(2, 5, 3)],
    ["262", generatePlayers(2, 6, 2)],
    ["271", generatePlayers(2, 7, 1)],
  ])(
    "Does not force an invalid lineup, with a %s formation",
    (formation: string, players: TeamPickWithScore[]) => {
      const result = lineupService.recommendLineup(players);

      expect(result.captain.player.id).toBe(5);
      expect(result.viceCaptain.player.id).toBe(6);
      expect(result.starting11.map((x) => x.player.id)).not.toEqual(
        expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      );
      expect(result.orderedSubs.map((x) => x.player.id)).not.toEqual(
        expect.arrayContaining([12, 13, 14, 15])
      );
    }
  );
});
