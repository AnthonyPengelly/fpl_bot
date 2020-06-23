import { OptimisationSettings } from "../config/optimisationSettings";
import PlayerScore from "../models/PlayerScore";
import OptimisationService from "./optimisationService";
import { TransferWithScores } from "../models/TransferWithScores";

interface TeamPickWithScore {
  pick: FantasyPick;
  playerScore: PlayerScore;
}

export default class RecommendationService {
  constructor(
    private optimisationService: OptimisationService,
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
    return this.recommendOneTransfer(teamPickWithScore, myTeam);
  }

  private recommendOneTransfer(
    teamWithScores: TeamPickWithScore[],
    myTeam: MyTeam
  ): TransferWithScores {
    const options = teamWithScores.map((pickWithScore) => {
      console.log(
        `Attempting to replace ${pickWithScore.playerScore.player.web_name}`
      );
      const remainingBudget =
        (myTeam.transfers.bank + pickWithScore.pick.selling_price) / 10;
      const possiblePlayers = this.playerScores
        .filter(
          (player) =>
            player.position.id === pickWithScore.playerScore.position.id
        )
        .filter((player) => player.value <= remainingBudget)
        .filter(
          (player) =>
            teamWithScores.filter(
              (pick) => pick.playerScore.player.id === player.player.id
            ).length === 0
        );
      const suggestion = possiblePlayers.sort((a, b) => b.score - a.score)[0];
      const improvement = suggestion.score - pickWithScore.playerScore.score;
      console.log(
        `Suggested ${suggestion.player.web_name} to replace ${
          pickWithScore.playerScore.player.web_name
        } for an improvement of ${improvement.toFixed(2)}`
      );
      return {
        playerIn: suggestion,
        playerOut: pickWithScore.playerScore,
        scoreImprovement: improvement,
      };
    });
    return options.sort((a, b) => b.scoreImprovement - a.scoreImprovement)[0];
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
