import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import OptimisationService from "./optimisationService";
import TransferService from "./transferService";
import { TeamPickWithScore } from "../models/TeamPickWithScore";

export default class RecommendationService {
  constructor(
    private optimisationService: OptimisationService,
    private transferService: TransferService
  ) {}

  recommendATeam(
    playerScores: PlayerScore[],
    settings: OptimisationSettings,
    budget: number
  ) {
    return this.optimisationService.getOptimalTeamForSettings(
      playerScores,
      settings,
      budget
    );
  }

  recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[]
  ) {
    const singleTransfer = this.transferService.recommendOneTransfer(
      playerScores,
      myTeam,
      picksWithScore
    );
    const twoTransfers = this.transferService.recommendTwoTransfers(
      playerScores,
      myTeam,
      picksWithScore
    );
    const twoTransfersAreDouble =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 2;
    const twoTransfersAre150Percent =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 1.5;
    if (myTeam.transfers.limit === 1) {
      return twoTransfersAreDouble ? twoTransfers : singleTransfer;
    }
    // Limit is two or unlimited - go for 2 a bit more readily
    return twoTransfersAre150Percent ? twoTransfers : singleTransfer;
  }
}
