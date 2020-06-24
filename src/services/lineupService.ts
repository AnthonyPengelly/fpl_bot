import { TeamPickWithScore } from "../models/TeamPickWithScore";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";
import { Lineup } from "../models/Lineup";
import FplFetcher from "../fetchers/fplFetcher";

export default class LineupService {
  constructor(private fplFetcher: FplFetcher) {}

  recommendLineup(picksWithScore: TeamPickWithScore[]): Lineup {
    const sortedPlayers = picksWithScore.sort(
      (a, b) => b.playerScore.score - a.playerScore.score
    );
    const starting11: PlayerScore[] = [];
    const goalkeepers = sortedPlayers.filter(
      (player) => player.playerScore.position.id === PositionMap.GOALKEEPER
    );
    const defenders = sortedPlayers.filter(
      (player) => player.playerScore.position.id === PositionMap.DEFENDER
    );
    const midfielders = sortedPlayers.filter(
      (player) => player.playerScore.position.id === PositionMap.MIDFIELDER
    );
    const forwards = sortedPlayers.filter(
      (player) => player.playerScore.position.id === PositionMap.FORWARD
    );
    starting11.push(goalkeepers[0].playerScore);
    starting11.push(
      ...defenders.slice(0, 3).map((player) => player.playerScore)
    );
    starting11.push(
      ...midfielders.slice(0, 3).map((player) => player.playerScore)
    );
    starting11.push(forwards[0].playerScore);
    const omitedPlayers = sortedPlayers.filter(
      (player) =>
        !starting11.find((x) => x.player.id === player.playerScore.player.id)
    );
    starting11.push(
      ...omitedPlayers
        .filter((x) => x.playerScore.position.id !== PositionMap.GOALKEEPER)
        .slice(0, 3)
        .map((player) => player.playerScore)
    );
    const substitutes = sortedPlayers.filter(
      (player) =>
        !starting11.find((x) => x.player.id === player.playerScore.player.id)
    );
    const orderedSubstitutes = substitutes.filter(
      (player) => player.playerScore.position.id === PositionMap.GOALKEEPER
    );
    orderedSubstitutes.push(
      ...substitutes.filter(
        (player) => player.playerScore.position.id !== PositionMap.GOALKEEPER
      )
    );
    return {
      starting11: starting11,
      orderedSubs: orderedSubstitutes.map((player) => player.playerScore),
      captain: sortedPlayers[0].playerScore,
      viceCaptain: sortedPlayers[1].playerScore,
    };
  }

  async setLineup(lineup: Lineup) {
    const picks = lineup.starting11.map((player, index) => ({
      element: player.player.id,
      position: index,
      is_captain: lineup.captain.player.id === player.player.id,
      is_vice_captain: lineup.viceCaptain.player.id === player.player.id,
    }));
    picks.push(
      ...lineup.orderedSubs.map((player, index) => ({
        element: player.player.id,
        position: index + 11,
        is_captain: false,
        is_vice_captain: false,
      }))
    );
    await this.fplFetcher.setLineup({ chips: null, picks: picks });
  }
}
