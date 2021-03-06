interface PlayerResult {
  id: number;
  kickoff_time: string;
  kickoff_time_formatted: string;
  team_h_score: number;
  team_a_score: number;
  was_home: boolean;
  round: number;
  total_points: number;
  value: number;
  transfers_balance: number;
  selected: number;
  transfers_in: number;
  transfers_out: number;
  loaned_in: number;
  loaned_out: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  ea_index: number;
  open_play_crosses: number;
  big_chances_created: number;
  clearances_blocks_interceptions: number;
  recoveries: number;
  key_passes: number;
  tackles: number;
  winning_goals: number;
  attempted_passes: number;
  completed_passes: number;
  penalties_conceded: number;
  big_chances_missed: number;
  errors_leading_to_goal: number;
  errors_leading_to_goal_attempt: number;
  tackled: number;
  offside: number;
  target_missed: number;
  fouls: number;
  dribbles: number;
  element: number;
  fixture: number;
  opponent_team: number;
}
