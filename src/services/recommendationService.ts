import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import OptimisationService from "./optimisationService";
import TransferService from "./transferService";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import { TransferWithScores } from "../models/TransferWithScores";
import DisplayService from "./displayService";

export default class RecommendationService {
  constructor(
    private optimisationService: OptimisationService,
    private transferService: TransferService
  ) {}

  recommendATeam(playerScores: PlayerScore[], settings: OptimisationSettings, budget: number) {
    return this.optimisationService.getOptimalTeamForSettings(playerScores, settings, budget);
  }

  recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    debug: boolean
  ) {
    const singleTransfer = this.transferService.recommendOneTransfer(
      playerScores,
      myTeam,
      picksWithScore,
      debug
    );
    const twoTransfers = this.transferService.recommendTwoTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      debug
    );
    const twoTransfersAreDouble =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 2;
    const twoTransfersAre150Percent =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 1.5;
    if (myTeam.transfers.limit === 1) {
      return this.returnTransferAndLogRejected(twoTransfersAreDouble, singleTransfer, twoTransfers);
    }
    // Limit is two or unlimited - go for 2 a bit more readily
    return this.returnTransferAndLogRejected(
      twoTransfersAre150Percent,
      singleTransfer,
      twoTransfers
    );
  }

  private returnTransferAndLogRejected(
    recommendTwoTransfers: boolean,
    singleTransfer: TransferWithScores,
    doubleTransfer: TransferWithScores
  ) {
    console.log("Rejected transfer option:");
    DisplayService.displayTransfer(recommendTwoTransfers ? singleTransfer : doubleTransfer);
    console.log("Recommended transfer option:");
    DisplayService.displayTransfer(recommendTwoTransfers ? doubleTransfer : singleTransfer);

    return recommendTwoTransfers ? doubleTransfer : singleTransfer;
  }
}
