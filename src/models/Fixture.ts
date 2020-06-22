interface Fixture {
  code: number;
  event: number;
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string;
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number;
  team_a_score: number;
  team_h: number;
  team_h_score: number;
  stats: any;
  team_h_difficulty: number; // difficulty for home team
  team_a_difficulty: number; // difficulty for away team
}
