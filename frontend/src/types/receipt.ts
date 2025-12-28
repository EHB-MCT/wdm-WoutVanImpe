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

// Additional interfaces moved from dashboard.ts to consolidate types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Receipt {
  id: number;
  total_amount: number;
  purchase_date: string;
  purchase_time?: string;
  store_name: string;
  payment_method: string;
  raw_ocr_text: string;
  items: ReceiptItem[];
}

export interface CategorySpending {
  name: string;
  value: number;
  [key: string]: string | number;
}