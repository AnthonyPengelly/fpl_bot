export interface OptimisationSettings {
  maxPlayers: number;
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  maxPlayersPerTeam: number;
}

export const fullSquad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 2,
  defenders: 5,
  midfielders: 5,
  forwards: 3,
  maxPlayersPerTeam: 3,
};

export const dumpGkpSquad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 1,
  defenders: 5,
  midfielders: 5,
  forwards: 3,
  maxPlayersPerTeam: 3,
};

export const skeleton442Squad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 1,
  defenders: 4,
  midfielders: 4,
  forwards: 2,
  maxPlayersPerTeam: 3,
};

export const skeleton433Squad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 1,
  defenders: 4,
  midfielders: 3,
  forwards: 3,
  maxPlayersPerTeam: 3,
};

export const skeleton343Squad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 1,
  defenders: 3,
  midfielders: 4,
  forwards: 3,
  maxPlayersPerTeam: 3,
};

export const skeleton532Squad: OptimisationSettings = {
  maxPlayers: 15,
  goalkeepers: 1,
  defenders: 5,
  midfielders: 3,
  forwards: 2,
  maxPlayersPerTeam: 3,
};
