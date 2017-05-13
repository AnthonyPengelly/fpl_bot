interface Player {
    id: number;
    photo: string;
    web_name: string;
    team_code: number;
    status: string;
    code: number;
    first_name: string;
    second_name: string;
    squad_number: number;
    news: string;
    now_cost: number;
    chance_of_playing_this_round: number;
    chance_of_playing_next_round: number;
    value_form: string;
    value_season: string;
    cost_change_start: number;
    cost_change_event: number;
    cost_change_start_fall: number;
    cost_change_event_fall: number;
    in_dreamteam: boolean;
    dreamteam_count: number;
    selected_by_percent: string;
    form: number;
    transfers_out: number;
    transfers_in: number;
    transfers_out_event: number;
    transfers_in_event: number;
    loans_in: number;
    loans_out: number;
    loaned_in: number;
    loaned_out: number;
    total_points: number;
    event_points: number;
    points_per_game: string;
    ep_this: string;
    ep_next: string;
    special: boolean;
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
    element_type: number;
    team: number;
}