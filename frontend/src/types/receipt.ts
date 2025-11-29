export interface ReceiptItem {
  name: string | null;
  category: string | null;
  quantity: number | null;
  price: number | null;
}

export interface ReceiptData {
  store_name: string | null;
  date: string | null;
  time: string | null;
  total_price: number | null;
  payment_method: string | null;
  items: ReceiptItem[];
}