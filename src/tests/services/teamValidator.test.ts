import TeamValidator from "../../services/teamValidator";
import { OptimisationSettings } from "../../config/optimisationSettings";
import PlayerScore from "../../models/PlayerScore";
import PlayerScoreBuilder from "../builders/playerScoreBuilder";

const validator = new TeamValidator();

const fullSquadSettings: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 2,
  defenders: 5,
  midfielders: 5,
  forwards: 3,
  budgetOffset: 0,
  maxPlayersPerTeam: 2,
};

const reducedSettings: OptimisationSettings = {
  maxPlayers: 4,
  goalkeepers: 1,
  defenders: 1,
  midfielders: 1,
  forwards: 1,
  budgetOffset: 0,
  maxPlayersPerTeam: 1,
};

describe("teamValidator", () => {
  test("Succeeds for a valid team", () => {
    const players = [
      createPlayer(1, 1),
      createPlayer(2, 1),
      createPlayer(3, 2),
      createPlayer(4, 2),
      createPlayer(5, 2),
      createPlayer(6, 2),
      createPlayer(7, 2),
      createPlayer(8, 3),
      createPlayer(9, 3),
      createPlayer(10, 3),
      createPlayer(11, 3),
      createPlayer(12, 3),
      createPlayer(13, 4),
      createPlayer(14, 4),
      createPlayer(15, 4),
    ];

    const result = validator.isValid(players, fullSquadSettings, []);

    expect(result).toBeTruthy();
  });

  test("Succeeds for a valid team with existing team", () => {
    const players = [createPlayer(1, 1)];
    const existingPlayers = [
      createPlayer(2, 1),
      createPlayer(3, 2),
      createPlayer(4, 2),
      createPlayer(5, 2),
      createPlayer(6, 2),
      createPlayer(7, 2),
      createPlayer(8, 3),
      createPlayer(9, 3),
      createPlayer(10, 3),
      createPlayer(11, 3),
      createPlayer(12, 3),
      createPlayer(13, 4),
      createPlayer(14, 4),
      createPlayer(15, 4),
    ];

    const result = validator.isValid(players, fullSquadSettings, existingPlayers);

    expect(result).toBeTruthy();
  });

  test("Fails when there are too many players", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(3, 2),
      createPlayer(4, 3),
      createPlayer(5, 4),
      createPlayer(6, 1),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many players including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 2), createPlayer(4, 3)];
    const existingPlayers = [createPlayer(5, 4), createPlayer(6, 1)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are duplicate players", () => {
    const players = [
      createPlayer(2, 1, 1),
      createPlayer(3, 2, 1),
      createPlayer(4, 3),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are duplicate players including current team", () => {
    const players = [createPlayer(2, 1, 1), createPlayer(3, 2)];
    const existingPlayers = [createPlayer(5, 4, 1), createPlayer(6, 1)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many goalkeepers", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(3, 1),
      createPlayer(4, 3),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many goalkeepers including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 2)];
    const existingPlayers = [createPlayer(5, 4), createPlayer(6, 1)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many defenders", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(3, 2),
      createPlayer(4, 2),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many defenders including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 2)];
    const existingPlayers = [createPlayer(5, 2), createPlayer(6, 4)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many midfielders", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(3, 3),
      createPlayer(4, 3),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many midfielders including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 3)];
    const existingPlayers = [createPlayer(5, 3), createPlayer(6, 4)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many forwards", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(3, 2),
      createPlayer(4, 4),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many forwards including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 4)];
    const existingPlayers = [createPlayer(5, 4), createPlayer(6, 3)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many players from 1 team", () => {
    const players = [
      createPlayer(2, 1),
      createPlayer(2, 2),
      createPlayer(4, 4),
      createPlayer(5, 4),
    ];

    const result = validator.isValid(players, reducedSettings, []);

    expect(result).toBeFalsy();
  });

  test("Fails when there are too many players from 1 team including current team", () => {
    const players = [createPlayer(2, 1), createPlayer(3, 2)];
    const existingPlayers = [createPlayer(2, 3), createPlayer(6, 4)];

    const result = validator.isValid(players, reducedSettings, existingPlayers);

    expect(result).toBeFalsy();
  });
});

const createPlayer = (team: number, position: number, id?: number): PlayerScore => {
  const builder = new PlayerScoreBuilder().withTeamId(team).withPositionId(position);
  if (id) {
    builder.withPlayerId(id);
  }
  return builder.build();
};
