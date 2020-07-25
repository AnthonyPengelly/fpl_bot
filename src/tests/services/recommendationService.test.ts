import OptimisationService from "../../services/optimisationService";
import TransferService from "../../services/transferService";
import RecommendationService from "../../services/recommendationService";
import { TransferWithScores } from "../../models/TransferWithScores";
import PlayerScoreBuilder from "../builders/playerScoreBuilder";
import { DumpPlayerSettings } from '../../config/dumpPlayerSettings';

const playerIn1 = new PlayerScoreBuilder().build();
const playerIn2 = new PlayerScoreBuilder().build();
const playerOut1 = new PlayerScoreBuilder().build();
const playerOut2 = new PlayerScoreBuilder().build();

const optimisationService = {} as OptimisationService;
const recommendOneTransfer = jest.fn();
const recommendTwoTransfers = jest.fn();
const transferService = ({
  recommendOneTransfer: recommendOneTransfer,
  recommendTwoTransfers: recommendTwoTransfers,
} as unknown) as TransferService;

const recommendationService = new RecommendationService(optimisationService, transferService);

describe("recommendationService", () => {
  test("returns 1 transfer when it is optimal", () => {
    const myTeam = {
      transfers: {
        limit: 2,
      },
    } as MyTeam;
    const singleTransfer = {
      playersIn: [playerIn1],
      playersOut: [playerOut1],
      scoreImprovement: 20,
    } as TransferWithScores;
    const doubleTransfer = {
      playersIn: [playerIn1, playerIn2],
      playersOut: [playerOut1, playerOut2],
      scoreImprovement: 22,
    } as TransferWithScores;
    recommendOneTransfer.mockReturnValueOnce(singleTransfer);
    recommendTwoTransfers.mockReturnValueOnce(doubleTransfer);

    const result = recommendationService.recommendTransfers([], myTeam, [], DumpPlayerSettings.DontDump, false);

    expect(result).toBe(singleTransfer);
  });

  test("returns 2 transfers when it is still good and there are 2 available", () => {
    const myTeam = {
      transfers: {
        limit: 2,
      },
    } as MyTeam;
    const singleTransfer = {
      playersIn: [playerIn1],
      playersOut: [playerOut1],
      scoreImprovement: 20,
    } as TransferWithScores;
    const doubleTransfer = {
      playersIn: [playerIn1, playerIn2],
      playersOut: [playerOut1, playerOut2],
      scoreImprovement: 35,
    } as TransferWithScores;
    recommendOneTransfer.mockReturnValueOnce(singleTransfer);
    recommendTwoTransfers.mockReturnValueOnce(doubleTransfer);

    const result = recommendationService.recommendTransfers([], myTeam, [], DumpPlayerSettings.DontDump, false);

    expect(result).toBe(doubleTransfer);
  });

  test("returns 2 transfers when they are more than twice as good as 1", () => {
    const myTeam = {
      transfers: {
        limit: 1,
      },
    } as MyTeam;
    const singleTransfer = {
      playersIn: [playerIn1],
      playersOut: [playerOut1],
      scoreImprovement: 20,
    } as TransferWithScores;
    const doubleTransfer = {
      playersIn: [playerIn1, playerIn2],
      playersOut: [playerOut1, playerOut2],
      scoreImprovement: 45,
    } as TransferWithScores;
    recommendOneTransfer.mockReturnValueOnce(singleTransfer);
    recommendTwoTransfers.mockReturnValueOnce(doubleTransfer);

    const result = recommendationService.recommendTransfers([], myTeam, [], DumpPlayerSettings.DontDump, false);

    expect(result).toBe(doubleTransfer);
  });
});
