import { PositionMap } from "../models/PositionMap";
import PlayerScore from "../models/PlayerScore";
import { OptimisationSettings } from "../config/optimisationSettings";

export default class TeamValidator {
  isValid = (
    players: PlayerScore[],
    settings: OptimisationSettings,
    otherPlayersInTeam: PlayerScore[]
  ) => {
    const fullTeam = players.concat(otherPlayersInTeam);

    if (this.anyDuplicates(fullTeam)) {
      return false;
    }

    if (fullTeam.length > settings.maxPlayers) {
      return false;
    }

    if (
      fullTeam.filter((player) => player.position.id === PositionMap.GOALKEEPER).length >
      settings.goalkeepers
    ) {
      return false;
    }

    if (
      fullTeam.filter((player) => player.position.id === PositionMap.DEFENDER).length >
      settings.defenders
    ) {
      return false;
    }

    if (
      fullTeam.filter((player) => player.position.id === PositionMap.MIDFIELDER).length >
      settings.midfielders
    ) {
      return false;
    }

    if (
      fullTeam.filter((player) => player.position.id === PositionMap.FORWARD).length >
      settings.forwards
    ) {
      return false;
    }

    if (this.tooManyPlayersFromOneTeam(fullTeam, settings)) {
      return false;
    }

    return true;
  };

  private tooManyPlayersFromOneTeam = (players: PlayerScore[], settings: OptimisationSettings) => {
    const playersPerTeam: { [index: number]: PlayerScore[] } = {};
    players.forEach((playerScore) => {
      playersPerTeam[playerScore.player.team] = playersPerTeam[playerScore.player.team]
        ? playersPerTeam[playerScore.player.team].concat(playerScore)
        : [playerScore];
    });

    return (
      Object.values(playersPerTeam).filter((players) => players.length > settings.maxPlayersPerTeam)
        .length !== 0
    );
  };

  private anyDuplicates = (players: PlayerScore[]) => {
    const playersById: { [index: number]: PlayerScore[] } = {};
    players.forEach((playerScore) => {
      playersById[playerScore.player.id] = playersById[playerScore.player.id]
        ? playersById[playerScore.player.id].concat(playerScore)
        : [playerScore];
    });

    return Object.values(playersById).filter((players) => players.length > 1).length !== 0;
  };
}
