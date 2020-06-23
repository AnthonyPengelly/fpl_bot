import PlayerScore from "../models/PlayerScore";
import { TransferWithScores } from "../models/TransferWithScores";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import OptimisationService from "./optimisationService";
import { fullSquad } from "../config/optimisationSettings";

export default class TransferService {
  constructor(
    private optimisationService: OptimisationService,
    private playerScores: PlayerScore[]
  ) {}

  recommendOneTransfer(
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
        playersIn: [suggestion],
        playersOut: [pickWithScore.playerScore],
        scoreImprovement: improvement,
      };
    });
    return options.sort((a, b) => b.scoreImprovement - a.scoreImprovement)[0];
  }

  recommendTwoTransfers(
    teamWithScores: TeamPickWithScore[],
    myTeam: MyTeam
  ): TransferWithScores {
    const options: TransferWithScores[] = [];
    teamWithScores.forEach((pick1) => {
      teamWithScores.forEach((pick2) => {
        if (pick1.playerScore.player.id === pick2.playerScore.player.id) {
          return;
        }
        console.log(
          `Attempting to replace ${pick1.playerScore.player.web_name} and ${pick2.playerScore.player.web_name}`
        );
        const remainingBudget =
          (myTeam.transfers.bank +
            pick1.pick.selling_price +
            pick2.pick.selling_price) /
          10;
        const remainingTeam = teamWithScores
          .map((pick) => pick.playerScore)
          .filter(
            (player) =>
              player.player.id !== pick1.playerScore.player.id &&
              player.player.id !== pick2.playerScore.player.id
          );
        const possiblePlayers = this.playerScores
          .filter(
            (player) =>
              player.position.id === pick1.playerScore.position.id ||
              player.position.id === pick2.playerScore.position.id
          )
          .filter((player) => player.value <= remainingBudget - 4)
          .filter(
            (player) =>
              teamWithScores.filter(
                (pick) => pick.playerScore.player.id === player.player.id
              ).length === 0
          );
        const suggestions = this.optimisationService.getOptimalTeamForSettings(
          possiblePlayers,
          fullSquad,
          remainingBudget,
          remainingTeam
        );
        if (!suggestions) {
          console.warn("No suggestions");
          return;
        }
        if (suggestions.length !== 2) {
          console.warn(`Only found ${suggestions.length} suggestions`);
          return;
        }
        const scoreImprovement =
          suggestions[0].score +
          suggestions[1].score -
          (pick1.playerScore.score + pick2.playerScore.score);
        console.log(
          `Suggesting ${suggestions[0].player.web_name} and ${
            suggestions[1].player.web_name
          } for a ${scoreImprovement.toFixed(2)} score boost`
        );
        options.push({
          playersOut: [pick1.playerScore, pick2.playerScore],
          playersIn: suggestions,
          scoreImprovement: scoreImprovement,
        });
      });
    });
    return options.sort((a, b) => b.scoreImprovement - a.scoreImprovement)[0];
  }
}
