interface ScoreDetails {
  score: number;
  inputs: {
    form: number;
    ictIndex: number;
    teamStrength: number;
    teamStrengthForPosition: number;
    opponentStrength: number;
    futureOpponentStrength: number;
    chanceOfPlaying: number;
    numberOfGames: number;
    numberOfGamesInNext3Gameweeks: number;
  };
}
