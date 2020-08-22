import FplFetcher from "../../fetchers/fplFetcher";
import TransferService from "../../services/transferService";
import OptimisationService from "../../services/optimisationService";
import PlayerScore from "../../models/PlayerScore";
import PlayerScoreBuilder from "../builders/playerScoreBuilder";
import TeamPickWithScoreBuilder from "../builders/teamPickWithScoreBuilder";
import { fullSquad } from "../../config/optimisationSettings";
import { DumpPlayerSettings } from "../../config/dumpPlayerSettings";
import { Logger } from "../../services/logger";

const fplFetcher = {} as FplFetcher;

const mockGetOptimalTeamForSettings = jest.fn();

const optimisationService = ({
  getOptimalTeamForSettings: mockGetOptimalTeamForSettings,
} as unknown) as OptimisationService;

const transferService = new TransferService(fplFetcher, optimisationService, new Logger());

describe("transferService", () => {
  beforeEach(() => {
    mockGetOptimalTeamForSettings.mockReturnValue([]);
  });

  test("Chooses the best available player for position and worst existing player", () => {
    const bestPlayer = new PlayerScoreBuilder().withPositionId(2).withScore(100).build();
    const betterPlayerInDifferentPosition = new PlayerScoreBuilder()
      .withPositionId(3)
      .withScore(150)
      .build();
    const players = [
      bestPlayer,
      betterPlayerInDifferentPosition,
      new PlayerScoreBuilder().withPositionId(2).withScore(10).build(),
    ];
    const worstExistingPick = getPlayerPick(
      0,
      new PlayerScoreBuilder().withPositionId(2).withScore(1).build()
    );
    const picks = [
      worstExistingPick,
      getPlayerPick(0, new PlayerScoreBuilder().withPositionId(2).withScore(100).build()),
    ];
    const myTeam = { picks: [], chips: [], transfers: { bank: 10 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(worstExistingPick.playerScore.player.id);
    expect(result.scoreImprovement).toBe(99);
  });

  test("Chooses the highest scoring player within budget", () => {
    const bestPlayerWithinBudget = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(10)
      .build();
    const bestPlayerOutOfBudget = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(150)
      .withValue(15)
      .build();
    const otherPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(10)
      .withValue(10)
      .build();
    const players = [bestPlayerWithinBudget, bestPlayerOutOfBudget, otherPlayer];
    const existingWeakPlayer = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).build()
    );
    const existingGoodPlayer = getPlayerPick(
      100, // a factor of 10 different from value. This is the equivalent of '10'
      new PlayerScoreBuilder().withPositionId(2).withScore(200).withValue(5).build()
    );
    const picks = [existingWeakPlayer, existingGoodPlayer];
    const myTeam = { picks: [], chips: [], transfers: { bank: 50 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayerWithinBudget.player.id);
    expect(result.playersOut[0].player.id).toBe(existingWeakPlayer.playerScore.player.id);
    expect(result.scoreImprovement).toBe(99);
  });

  test("Replaces a higher scoring player to afford the best player", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .build();
    const otherPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(10)
      .withValue(10)
      .build();
    const players = [bestPlayer, otherPlayer];
    const existingWeakPlayer = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).build()
    );
    const existingGoodPlayer = getPlayerPick(
      100, // a factor of 10 different from value. This is the equivalent of '10'
      new PlayerScoreBuilder().withPositionId(2).withScore(50).withValue(5).build()
    );
    const picks = [existingWeakPlayer, existingGoodPlayer];
    const myTeam = { picks: [], chips: [], transfers: { bank: 50 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(existingGoodPlayer.playerScore.player.id);
    expect(result.scoreImprovement).toBe(50);
  });

  test("Does not suggest player when team count would be too high", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .withTeamId(3)
      .build();
    const otherPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(10)
      .withValue(10)
      .withTeamId(2)
      .build();
    const players = [bestPlayer, otherPlayer];
    const existingPlayer1 = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(2).withValue(5).withTeamId(3).build()
    );
    const existingPlayer2 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(2).withValue(5).withTeamId(3).build()
    );
    const existingPlayer3 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(2).withValue(5).withTeamId(3).build()
    );
    const existingPlayer4 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).withTeamId(3).build()
    );
    const picks = [existingPlayer1, existingPlayer2, existingPlayer3, existingPlayer4];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(otherPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer4.playerScore.player.id);
    expect(result.scoreImprovement).toBe(9);
  });

  test("Replaces a player from the same team to allow a better player", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .withTeamId(3)
      .build();
    const otherPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(10)
      .withValue(10)
      .withTeamId(1)
      .build();
    const players = [bestPlayer, otherPlayer];
    const existingGoodPlayerFromTheSameTeam = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(50).withValue(5).withTeamId(3).build()
    );
    const existingPlayer2 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(51).withValue(5).withTeamId(3).build()
    );
    const existingPlayer3 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(51).withValue(5).withTeamId(3).build()
    );
    const existingPlayer4 = getPlayerPick(
      100,
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).withTeamId(2).build()
    );
    const picks = [
      existingGoodPlayerFromTheSameTeam,
      existingPlayer2,
      existingPlayer3,
      existingPlayer4,
    ];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(
      existingGoodPlayerFromTheSameTeam.playerScore.player.id
    );
    expect(result.scoreImprovement).toBe(50);
  });

  test("Ignores dump players", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .withTeamId(5)
      .build();
    const players = [bestPlayer];
    const existingPlayer = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(50).withValue(100).withTeamId(5).build()
    );
    const dumpGkp = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).withValue(1).withTeamId(1).build()
    );
    const dumpDef = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(1).withTeamId(2).build()
    );
    const dumpMid = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(3).withScore(1).withValue(1).withTeamId(3).build()
    );
    const dumpFwd = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(4).withScore(1).withValue(1).withTeamId(4).build()
    );
    const picks = [existingPlayer, dumpGkp, dumpDef, dumpMid, dumpFwd];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DumpPlayers,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer.playerScore.player.id);
    expect(result.scoreImprovement).toBe(50);
  });

  test("Ignores dump goalkeeper", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .withTeamId(5)
      .build();
    const players = [bestPlayer];
    const existingPlayer = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(50).withValue(100).withTeamId(5).build()
    );
    const dumpGkp = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).withValue(1).withTeamId(1).build()
    );
    const picks = [existingPlayer, dumpGkp];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendOneTransfer(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DumpGoalkeeper,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer.playerScore.player.id);
    expect(result.scoreImprovement).toBe(50);
  });

  test("Gets 2 transfers with the highest value", () => {
    const bestPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .build();
    const otherGoodPlayer = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(90)
      .withValue(10)
      .build();
    const players = [bestPlayer, otherGoodPlayer];
    mockGetOptimalTeamForSettings.mockReturnValue([bestPlayer, otherGoodPlayer]);
    const existingWeakPlayer = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).build()
    );
    const otherExistingWeakPlayer = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).build()
    );
    const greatExistingPlayer = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(100).withValue(5).build()
    );
    const picks = [existingWeakPlayer, otherExistingWeakPlayer, greatExistingPlayer];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendTwoTransfers(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DontDump,
      false
    );

    expect(result.playersIn[0].player.id).toBe(bestPlayer.player.id);
    expect(result.playersOut[0].player.id).toBe(existingWeakPlayer.playerScore.player.id);
    expect(result.playersIn[1].player.id).toBe(otherGoodPlayer.player.id);
    expect(result.playersOut[1].player.id).toBe(otherExistingWeakPlayer.playerScore.player.id);
    expect(result.scoreImprovement).toBe(188);
  });

  test("Ignores dump players for double transfers", () => {
    const goodPlayer1 = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .build();
    const goodPlayer2 = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(90)
      .withValue(10)
      .build();
    const players = [goodPlayer1, goodPlayer2];
    mockGetOptimalTeamForSettings.mockReturnValue([goodPlayer1, goodPlayer2]);
    const existingPlayer1 = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(50).withValue(5).build()
    );
    const existingPlayer2 = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(40).withValue(5).build()
    );
    const dumpGkp = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).withValue(1).withTeamId(1).build()
    );
    const dumpDef = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(1).withTeamId(2).build()
    );
    const dumpMid = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(3).withScore(1).withValue(1).withTeamId(3).build()
    );
    const dumpFwd = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(4).withScore(1).withValue(1).withTeamId(4).build()
    );
    const picks = [existingPlayer1, existingPlayer2, dumpGkp, dumpDef, dumpMid, dumpFwd];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendTwoTransfers(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DumpPlayers,
      false
    );

    expect(result.playersIn[0].player.id).toBe(goodPlayer1.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer1.playerScore.player.id);
    expect(result.playersIn[1].player.id).toBe(goodPlayer2.player.id);
    expect(result.playersOut[1].player.id).toBe(existingPlayer2.playerScore.player.id);
    expect(result.scoreImprovement).toBe(100);
  });

  test("Ignores dump goalkeeper for double transfers", () => {
    const goodPlayer1 = new PlayerScoreBuilder()
      .withPositionId(1)
      .withScore(100)
      .withValue(15)
      .build();
    const goodPlayer2 = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(90)
      .withValue(10)
      .build();
    const players = [goodPlayer1, goodPlayer2];
    mockGetOptimalTeamForSettings.mockReturnValue([goodPlayer1, goodPlayer2]);
    const existingPlayer1 = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(1).withScore(50).withValue(5).build()
    );
    const existingPlayer2 = getPlayerPick(
      50,
      new PlayerScoreBuilder().withPositionId(2).withScore(40).withValue(5).build()
    );
    const dumpGkp = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).withValue(1).withTeamId(1).build()
    );
    const picks = [existingPlayer1, existingPlayer2, dumpGkp];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendTwoTransfers(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DumpGoalkeeper,
      false
    );

    expect(result.playersIn[0].player.id).toBe(goodPlayer1.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer1.playerScore.player.id);
    expect(result.playersIn[1].player.id).toBe(goodPlayer2.player.id);
    expect(result.playersOut[1].player.id).toBe(existingPlayer2.playerScore.player.id);
    expect(result.scoreImprovement).toBe(100);
  });

  test("Calls optimisation service with players within budget and for suitable positions", () => {
    const correctPlayer1 = new PlayerScoreBuilder()
      .withPositionId(2)
      .withScore(100)
      .withValue(15)
      .build();
    const correctPlayer2 = new PlayerScoreBuilder()
      .withPositionId(3)
      .withScore(90)
      .withValue(10)
      .build();
    const wrongPosition = new PlayerScoreBuilder().withPositionId(4).build();
    const tooExpensive = new PlayerScoreBuilder().withPositionId(2).withValue(800).build();
    const players = [correctPlayer1, correctPlayer2, wrongPosition, tooExpensive];
    mockGetOptimalTeamForSettings.mockReturnValue([correctPlayer1, correctPlayer2]);
    const existingPlayer1 = getPlayerPick(
      50, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(2).withScore(1).withValue(5).build()
    );
    const existingPlayer2 = getPlayerPick(
      100, // a factor of 10 different from value. This is the equivalent of '5'
      new PlayerScoreBuilder().withPositionId(3).withScore(1).withValue(5).build()
    );
    const dumpGkp = getPlayerPick(
      1,
      new PlayerScoreBuilder().withPositionId(1).withScore(1).withValue(1).withTeamId(1).build()
    );
    const picks = [existingPlayer1, existingPlayer2, dumpGkp];
    const myTeam = { picks: [], chips: [], transfers: { bank: 500 } as TransferInfo } as MyTeam;

    const result = transferService.recommendTwoTransfers(
      players,
      myTeam,
      picks,
      DumpPlayerSettings.DumpGoalkeeper,
      false
    );

    expect(result.playersIn[0].player.id).toBe(correctPlayer1.player.id);
    expect(result.playersOut[0].player.id).toBe(existingPlayer1.playerScore.player.id);
    expect(result.playersIn[1].player.id).toBe(correctPlayer2.player.id);
    expect(result.playersOut[1].player.id).toBe(existingPlayer2.playerScore.player.id);
    expect(result.scoreImprovement).toBe(188);
    expect(mockGetOptimalTeamForSettings).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          player: expect.objectContaining({ id: correctPlayer1.player.id }),
        }),
        expect.objectContaining({
          player: expect.objectContaining({ id: correctPlayer2.player.id }),
        }),
      ]),
      fullSquad,
      65,
      expect.arrayContaining([
        expect.objectContaining({
          player: expect.objectContaining({ id: dumpGkp.playerScore.player.id }),
        }),
      ])
    );
  });
});

const getPlayerPick = (sellPrice: number, playerScore: PlayerScore) =>
  new TeamPickWithScoreBuilder().withSellPrice(sellPrice).withPlayerScore(playerScore).build();
