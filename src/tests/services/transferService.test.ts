import FplFetcher from "../../fetchers/fplFetcher";
import TransferService from "../../services/transferService";
import OptimisationService from "../../services/optimisationService";
import PlayerScore from "../../models/PlayerScore";
import { TeamPickWithScore } from "../../models/TeamPickWithScore";
import PlayerScoreBuilder from "../builders/playerScoreBuilder";
import TeamPickWithScoreBuilder from "../builders/teamPickWithScoreBuilder";

const fplFetcher = {} as FplFetcher;

const optimisationService = ({
  getOptimalTeamForSettings: jest.fn(),
} as unknown) as OptimisationService;

const transferService = new TransferService(fplFetcher, optimisationService);

describe("optimisationService", () => {
  test("Chooses the best available player and worst existing player", () => {
    const bestPlayer = new PlayerScoreBuilder().withPositionId(1).withScore(100).build();
    const players = [bestPlayer, new PlayerScoreBuilder().withPositionId(1).withScore(10).build()];
    const worstExistingPick = getPlayerPick(
      0,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).build()
    );
    const picks = [
      worstExistingPick,
      getPlayerPick(0, new PlayerScoreBuilder().withPositionId(1).withScore(100).build()),
    ];
    const myTeam = { picks: [], chips: [], transfers: { bank: 10 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(players, myTeam, picks, false);

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(worstExistingPick.playerScore.player.id);
  });
});
// Gets highest player within budget

// Replaces a more expensive player to afford best player

// Gets highest 2 transfers

// Replaces a high scorer for an overall improvement when using 2 transfers

const getPlayerPick = (sellPrice: number, playerScore: PlayerScore) =>
  new TeamPickWithScoreBuilder().withSellPrice(sellPrice).withPlayerScore(playerScore).build();
