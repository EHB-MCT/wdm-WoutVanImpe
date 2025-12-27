export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Receipt {
  id: number;
  total_amount: number;
  purchase_date: string;
  store_name: string;
  payment_method: string;
  raw_ocr_text: string;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CategorySpending {
  name: string;
  value: number;
  [key: string]: string | number;
}