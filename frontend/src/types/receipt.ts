export interface ReceiptItem {
  id: number;
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
  raw_ocr_text: string | null;
  items: ReceiptItem[];
}