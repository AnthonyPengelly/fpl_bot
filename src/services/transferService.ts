import PlayerScore from "../models/PlayerScore";
import { TransferWithScores } from "../models/TransferWithScores";
import { TeamPickWithScore } from "../models/TeamPickWithScore";
import OptimisationService from "./optimisationService";
import { fullSquad } from "../config/optimisationSettings";
import FplFetcher from "../fetchers/fplFetcher";

interface TeamCount {
  [index: number]: number;
}

export default class TransferService {
  constructor(private fplFetcher: FplFetcher, private optimisationService: OptimisationService) {}

  recommendOneTransfer(
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    debug: boolean
  ): TransferWithScores {
    const options = picksWithScore.map((pickWithScore) => {
      const remainingTeam = picksWithScore.filter(
        (player) => player.playerScore.player.id !== pickWithScore.playerScore.player.id
      );
      const teamCount = this.countPlayersOnTeam(remainingTeam);
      const remainingBudget = (myTeam.transfers.bank + pickWithScore.pick.selling_price) / 10;
      const possiblePlayers = playerScores
        .filter((player) => player.position.id === pickWithScore.playerScore.position.id)
        .filter((player) => player.value <= remainingBudget)
        .filter((player) => !teamCount[player.player.team] || teamCount[player.player.team] < 3)
        .filter(
          (player) =>
            picksWithScore.filter((pick) => pick.playerScore.player.id === player.player.id)
              .length === 0
        );
      const suggestion = possiblePlayers.sort((a, b) => b.score - a.score)[0];
      const improvement = suggestion.score - pickWithScore.playerScore.score;
      this.debug(
        `Suggested ${suggestion.player.web_name} to replace ${
          pickWithScore.playerScore.player.web_name
        } for an improvement of ${improvement.toFixed(2)}`,
        debug
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
    playerScores: PlayerScore[],
    myTeam: MyTeam,
    picksWithScore: TeamPickWithScore[],
    debug: boolean
  ): TransferWithScores {
    const options: TransferWithScores[] = [];
    let failedSuggestions = 0;
    picksWithScore.forEach((pick1) => {
      picksWithScore.forEach((pick2) => {
        if (pick1.playerScore.player.id === pick2.playerScore.player.id) {
          return;
        }
        const remainingBudget =
          (myTeam.transfers.bank + pick1.pick.selling_price + pick2.pick.selling_price) / 10;
        const remainingTeam = picksWithScore
          .map((pick) => pick.playerScore)
          .filter(
            (player) =>
              player.player.id !== pick1.playerScore.player.id &&
              player.player.id !== pick2.playerScore.player.id
          );
        const possiblePlayers = playerScores
          .filter(
            (player) =>
              player.position.id === pick1.playerScore.position.id ||
              player.position.id === pick2.playerScore.position.id
          )
          .filter((player) => player.value <= remainingBudget - 4)
          .filter(
            (player) =>
              picksWithScore.filter((pick) => pick.playerScore.player.id === player.player.id)
                .length === 0
          );
        const suggestions = this.optimisationService.getOptimalTeamForSettings(
          possiblePlayers,
          fullSquad,
          remainingBudget,
          remainingTeam
        );
        if (!suggestions) {
          this.debug(
            `No suggestions to replace ${pick1.playerScore.player.web_name} and ${pick2.playerScore.player.web_name}`,
            debug
          );
          failedSuggestions++;
          return;
        }
        if (suggestions.length !== 2) {
          this.debug(
            `Only found ${suggestions.length} suggestions to replace ${pick1.playerScore.player.web_name} and ${pick2.playerScore.player.web_name}`,
            debug
          );
          failedSuggestions++;
          return;
        }
        const scoreImprovement =
          suggestions[0].score +
          suggestions[1].score -
          (pick1.playerScore.score + pick2.playerScore.score);
        this.debug(
          `Suggesting ${suggestions[0].player.web_name} and ${
            suggestions[1].player.web_name
          } to replace ${pick1.playerScore.player.web_name} and ${
            pick2.playerScore.player.web_name
          } for a ${scoreImprovement.toFixed(2)} score boost`,
          debug
        );
        options.push({
          playersOut: [pick1.playerScore, pick2.playerScore],
          playersIn: suggestions,
          scoreImprovement: scoreImprovement,
        });
      });
    });
    console.log();
    console.log(`Failed to suggest options for ${failedSuggestions} combinations`);
    console.log();
    return options.sort((a, b) => b.scoreImprovement - a.scoreImprovement)[0];
  }

  async performTransfers(
    transfer: TransferWithScores,
    nextEvent: Gameweek,
    myTeam: MyTeam,
    teamId: number
  ) {
    if (
      myTeam.transfers.limit &&
      transfer.playersIn.length > myTeam.transfers.limit - myTeam.transfers.made
    ) {
      console.log(
        `Transfers requested: ${transfer.playersIn.length} exceeds limit: ${
          myTeam.transfers.limit - myTeam.transfers.made
        }, postponing until next week`
      );
      return false;
    }
    if (transfer.scoreImprovement < 0) {
      console.log("Transfer has a negative value, not performing!");
      return false;
    }
    const transferRequest: TransferRequest = {
      chips: null,
      entry: teamId,
      event: nextEvent.id,
      transfers: transfer.playersIn.map((playerIn, index) => {
        const playerOut = transfer.playersOut[index];
        return {
          element_in: playerIn.player.id,
          element_out: playerOut.player.id,
          purchase_price: playerIn.value * 10,
          selling_price: myTeam.picks.find((pick) => pick.element === playerOut.player.id)!
            .selling_price,
        };
      }),
    };
    await this.fplFetcher!.performTransfers(transferRequest);
    return true;
  }

  private countPlayersOnTeam = (picksWithScore: TeamPickWithScore[]) => {
    const teams = picksWithScore.map((pick) => pick.playerScore.player.team);
    return teams.reduce(
      (total, teamId) => ({
        ...total,
        [teamId]: total[teamId] ? total[teamId] + 1 : 1,
      }),
      {} as TeamCount
    );
  };

  private debug(message: string, debug: boolean) {
    if (debug) {
      console.log(message);
    }
  }
}
