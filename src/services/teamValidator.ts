import { PositionMap } from "../models/PositionMap";
import PlayerScore from "../models/PlayerScore";
import { OptimisationSettings } from "../config/optimisationSettings";

export default class TeamValidator {
  isValid = (players: PlayerScore[], settings: OptimisationSettings) => {
    if (players.length > settings.maxPlayers) {
      return false;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.GOALKEEPER)
        .length > settings.goalkeepers
    ) {
      return false;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.DEFENDER)
        .length > settings.defenders
    ) {
      return false;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.MIDFIELDER)
        .length > settings.midfielders
    ) {
      return false;
    }

    if (
      players.filter((player) => player.position.id === PositionMap.FORWARD)
        .length > settings.forwards
    ) {
      return false;
    }

    if (this.tooManyPlayersFromOneTeam(players, settings)) {
      return false;
    }

    return true;
  };

  private tooManyPlayersFromOneTeam = (
    players: PlayerScore[],
    settings: OptimisationSettings
  ) => {
    const playersPerTeam: { [index: number]: PlayerScore[] } = {};
    players.forEach((playerScore) => {
      playersPerTeam[playerScore.player.team] = playersPerTeam[
        playerScore.player.team
      ]
        ? playersPerTeam[playerScore.player.team].concat(playerScore)
        : [playerScore];
    });

    return (
      Object.values(playersPerTeam).filter(
        (players) => players.length > settings.maxPlayersPerTeam
      ).length !== 0
    );
  };
}
