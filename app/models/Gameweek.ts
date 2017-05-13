interface Gameweek {
    id: number;
    name: string;
    deadline_time: string;
    average_entry_score: number;
    finished: boolean;
    data_checked: boolean;
    highest_scoring_entry: number;
    deadline_time_epoch: number;
    deadline_time_game_offset: number;
    deadline_time_formatted: number;
    highest_score: number;
    is_previous:boolean;
    is_current: boolean;
    is_next: boolean;
}