import { TeamPickWithScore } from "../models/TeamPickWithScore";
import PlayerScore from "../models/PlayerScore";
import { PositionMap } from "../models/PositionMap";
import { Lineup } from "../models/Lineup";
import FplFetcher from "../fetchers/fplFetcher";

export default class LineupService {
  constructor(private fplFetcher: FplFetcher) {}

  recommendLineup(picksWithScore: PlayerScore[]): Lineup {
    const sortedPlayers = picksWithScore.sort((a, b) => b.score - a.score);
    const starting11: PlayerScore[] = [];
    const goalkeepers = sortedPlayers.filter(
      (player) => player.position.id === PositionMap.GOALKEEPER
    );
    const defenders = sortedPlayers.filter((player) => player.position.id === PositionMap.DEFENDER);
    const midfielders = sortedPlayers.filter(
      (player) => player.position.id === PositionMap.MIDFIELDER
    );
    const forwards = sortedPlayers.filter((player) => player.position.id === PositionMap.FORWARD);
    starting11.push(goalkeepers[0]);
    starting11.push(...defenders.slice(0, 3));
    starting11.push(...midfielders.slice(0, 3));
    starting11.push(forwards[0]);
    const omitedPlayers = sortedPlayers.filter(
      (player) => !starting11.find((x) => x.player.id === player.player.id)
    );
    starting11.push(
      ...omitedPlayers
        .filter((x) => x.position.id !== PositionMap.GOALKEEPER)
        .slice(0, 3)
        .map((player) => player)
    );
    const substitutes = sortedPlayers.filter(
      (player) => !starting11.find((x) => x.player.id === player.player.id)
    );
    const orderedSubstitutes = substitutes.filter(
      (player) => player.position.id === PositionMap.GOALKEEPER
    );
    orderedSubstitutes.push(
      ...substitutes.filter((player) => player.position.id !== PositionMap.GOALKEEPER)
    );
    return {
      starting11: starting11,
      orderedSubs: orderedSubstitutes,
      captain: sortedPlayers[0],
      viceCaptain: sortedPlayers[1],
    };
  }

  async setLineup(lineup: Lineup, teamId: number, draft: boolean) {
    const picks = lineup.starting11.map((player, index) => ({
      element: player.player.id,
      position: index + 1,
      is_captain: !draft && lineup.captain.player.id === player.player.id,
      is_vice_captain: !draft && lineup.viceCaptain.player.id === player.player.id,
    }));
    picks.push(
      ...lineup.orderedSubs.map((player, index) => ({
        element: player.player.id,
        position: index + 12,
        is_captain: false,
        is_vice_captain: false,
      }))
    );
    if (draft) {
      await this.fplFetcher.setDraftLineup({ chips: null, picks: picks }, teamId);
    } else {
      await this.fplFetcher.setLineup({ chips: null, picks: picks }, teamId);
    }
  }
}
