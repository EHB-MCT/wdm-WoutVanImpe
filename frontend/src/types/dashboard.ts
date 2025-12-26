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
  items: ReceiptItem[];
}

export interface ReceiptItem {
  id: number;
  product_name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface CategorySpending {
  name: string;
  value: number;
  [key: string]: string | number;
}