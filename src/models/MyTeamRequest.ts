interface MyTeamRequest {
  chips: null;
  picks: {
    element: number;
    position: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
}
