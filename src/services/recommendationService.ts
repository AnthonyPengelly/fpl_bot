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
    const initialSquad = this.optimisationService.getOptimalTeamForSettings(
      playerScores.slice(0, 150),
      settings,
      budget
    );
    if (!initialSquad) {
      console.log(`Unable to recommend squad for budget £${budget}m and settings: `);
      console.log(settings);
      return [];
    }

    let recommendedTransfer: TransferWithScores;
    let attempts = 0;
    let newSquad = initialSquad;
    do {
      recommendedTransfer = this.recommendTransferUsingExistSquad(
        playerScores,
        newSquad,
        settings,
        budget,
        false
      );
      if (
        !recommendedTransfer ||
        recommendedTransfer.playersIn.length < 1 ||
        recommendedTransfer.scoreImprovement < 0.2
      ) {
        break;
      }
      console.log(
        `${recommendedTransfer.playersIn[0].player.web_name} in to replace ${recommendedTransfer.playersOut[0].player.web_name}`
      );

      newSquad = this.rebuildSquadBasedOnTransfer(newSquad, recommendedTransfer);
      attempts++;
    } while (attempts < 50);
    return newSquad;
  }

  recommendTransfers(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    useDumpPlayers: boolean,
    debug: boolean
  ) {
    const singleTransfer = this.transferService.recommendOneTransfer(
      playerScores,
      myTeam,
      picksWithScore,
      useDumpPlayers,
      debug
    );
    const twoTransfers = this.transferService.recommendTwoTransfers(
      playerScores,
      myTeam,
      picksWithScore,
      useDumpPlayers,
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

  private recommendTransferUsingExistSquad(
    playerScores: PlayerScore[],
    squad: PlayerScore[],
    settings: OptimisationSettings,
    budget: number,
    useDumpPlayers: boolean,
  ) {
    const value = squad.reduce((total, player) => player.value + total, 0);
    const myTeam = {
      transfers: { bank: (budget - settings.budgetOffset - value) * 10 },
    } as MyTeam;
    const teamWithScores: TeamPickWithScore[] = squad.map((player) => ({
      pick: { selling_price: player.value * 10, element: player.player.id } as FantasyPick,
      playerScore: player,
    }));
    return this.transferService.recommendOneTransfer(playerScores, myTeam, teamWithScores, useDumpPlayers, false);
  }

  private rebuildSquadBasedOnTransfer(squad: PlayerScore[], transfer: TransferWithScores) {
    const newSquad = squad.filter((x) => x.player.id !== transfer.playersOut[0].player.id);
    newSquad.push(transfer.playersIn[0]);
    return newSquad;
  }
}
