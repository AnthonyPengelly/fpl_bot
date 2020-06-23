interface TransferRequest {
  chips: null;
  entry: number;
  event: number;
  transfers: {
    element_in: number;
    element_out: number;
    purchase_price: number;
    selling_price: number;
  }[];
}
