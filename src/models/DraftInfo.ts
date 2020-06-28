interface DraftInfo {
  player: {
    email: string;
    entry_set: number[];
    first_name: string;
    id: number;
    last_name: string;
    region: number;
    region_code_long: string;
    region_code_short: string;
    region_name: string;
    username: string;
  };
  leagues: {
    id: number;
    name: string;
    scoring: string;
  }[];
  // Plus much more info about the player
}
