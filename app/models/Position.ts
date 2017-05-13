interface Position {
    id: number;
    singular_name: string;
    singular_name_short: string;
    plural_name: string;
    plural_name_short: string;
}

enum PositionMap {
    GOALKEEPER = 1,
    DEFENDER = 2,
    MIDFIELDER = 3,
    STRIKER = 4
}