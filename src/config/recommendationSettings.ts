export interface RecommendationSetting {
  maxPlayers: number;
  goalkeepers: number;
  defenders: number;
  midfielders: number;
  forwards: number;
  budgetOffset: number;
  maxPlayersPerTeam: number;
}

export const fullSquad: RecommendationSetting = {
  maxPlayers: 15,
  goalkeepers: 2,
  defenders: 5,
  midfielders: 5,
  forwards: 3,
  budgetOffset: 0,
  maxPlayersPerTeam: 4,
};

export const skeleton442Squad: RecommendationSetting = {
  maxPlayers: 11,
  goalkeepers: 1,
  defenders: 4,
  midfielders: 4,
  forwards: 2,
  budgetOffset: 4 * 4.7,
  maxPlayersPerTeam: 4,
};

export const skeleton433Squad: RecommendationSetting = {
  maxPlayers: 11,
  goalkeepers: 1,
  defenders: 4,
  midfielders: 3,
  forwards: 3,
  budgetOffset: 4 * 4.7,
  maxPlayersPerTeam: 4,
};

export const skeleton343Squad: RecommendationSetting = {
  maxPlayers: 11,
  goalkeepers: 1,
  defenders: 3,
  midfielders: 4,
  forwards: 3,
  budgetOffset: 4 * 4.7,
  maxPlayersPerTeam: 4,
};

export const skeleton532Squad: RecommendationSetting = {
  maxPlayers: 11,
  goalkeepers: 1,
  defenders: 5,
  midfielders: 3,
  forwards: 2,
  budgetOffset: 4 * 4.7,
  maxPlayersPerTeam: 4,
};
