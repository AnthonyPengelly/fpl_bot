interface DraftStatus {
  element_status: {
    element: number;
    in_accepted_trade: boolean;
    owner: number | null;
    status: string;
  }[];
}
