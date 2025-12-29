import apiClient from "./client";
import { Receipt, ReceiptItem } from "../../types/receipt";

export type { Receipt } from "../../types/receipt";

export interface CreateReceiptRequest {
	store_name: string;
	purchase_date: string;
	purchase_time?: string;
	payment_method: string;
	total_amount: number;
	raw_ocr_text?: string;
	items: ReceiptItem[];
	dangerous_metadata?: import("../../types/receipt").DangerousMetadata;
}

export interface UpdateReceiptRequest {
	store_name?: string;
	purchase_date?: string;
	purchase_time?: string;
	payment_method?: string;
	total_amount?: number;
	items: ReceiptItem[];
}

/**
 * Service for managing receipt data.
 */
export const receiptsApi = {
	async getAll(): Promise<Receipt[]> {
		return apiClient.get<Receipt[]>("/api/receipts");
	},

	async getById(id: number): Promise<Receipt> {
		return apiClient.get<Receipt>(`/api/receipts/${id}`);
	},

	async create(receiptData: CreateReceiptRequest): Promise<Receipt> {
		return apiClient.post<Receipt>("/api/receipts", receiptData);
	},

	async update(id: number, receiptData: UpdateReceiptRequest): Promise<Receipt> {
		return apiClient.put<Receipt>(`/api/receipts/${id}`, receiptData);
	},

	async delete(id: number): Promise<void> {
		return apiClient.delete<void>(`/api/receipts/${id}`);
	},
};
