import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import OptimisationService from "./optimisationService";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import TransferService from "./transferService";

export default class RecommendationService {
  constructor(
    private optimisationService: OptimisationService,
    private transferService: TransferService,
    private playerScores: PlayerScore[]
  ) {}

  recommendATeam(settings: OptimisationSettings, budget: number) {
    return this.optimisationService.getOptimalTeamForSettings(
      this.playerScores,
      settings,
      budget
    );
  }

  recommendTransfers(myTeam: MyTeam) {
    const teamPickWithScore = this.mapTeamToTeamPickWithScore(myTeam);
    const singleTransfer = this.transferService.recommendOneTransfer(
      teamPickWithScore,
      myTeam
    );
    const twoTransfers = this.transferService.recommendTwoTransfers(
      teamPickWithScore,
      myTeam
    );
    const twoTransfersAreDouble =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 2;
    const twoTransfersAre150Percent =
      twoTransfers.scoreImprovement > singleTransfer.scoreImprovement * 1.5;
    console.log(myTeam.transfers.limit);
    if (myTeam.transfers.limit === 1) {
      return twoTransfersAreDouble ? twoTransfers : singleTransfer;
    }
    // Limit is two - go for 2 a bit more readily
    return twoTransfersAre150Percent ? twoTransfers : singleTransfer;
  }

  private mapTeamToTeamPickWithScore(myTeam: MyTeam): TeamPickWithScore[] {
    return myTeam.picks.map((pick) => ({
      pick: pick,
      playerScore: this.playerScores.find(
        (player) => player.player.id === pick.element
      )!,
    }));
  }
}
