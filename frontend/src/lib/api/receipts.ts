/**
 * Receipts API service
 * Handles receipt CRUD operations
 */

import apiClient from './client';

export interface ReceiptItem {
	id: number;
	name: string;
	category: string;
	quantity: number;
	price: number;
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

export interface CreateReceiptRequest {
	store_name: string;
	purchase_date: string;
	purchase_time: string;
	payment_method: string;
	total_amount: number;
	raw_ocr_text?: string;
	items: ReceiptItem[];
}

export interface UpdateReceiptRequest {
	store_name?: string;
	purchase_date?: string;
	purchase_time?: string;
	payment_method?: string;
	total_amount?: number;
	items: ReceiptItem[];
}

export const receiptsApi = {
	/**
	 * Get all receipts for current user
	 */
	async getAll(): Promise<Receipt[]> {
		return apiClient.get<Receipt[]>('/api/receipts');
	},

	/**
	 * Get single receipt by ID
	 */
	async getById(id: number): Promise<Receipt> {
		return apiClient.get<Receipt>(`/api/receipts/${id}`);
	},

	/**
	 * Create new receipt
	 */
	async create(receiptData: CreateReceiptRequest): Promise<Receipt> {
		return apiClient.post<Receipt>('/api/receipts', receiptData);
	},

	/**
	 * Update existing receipt
	 */
	async update(id: number, receiptData: UpdateReceiptRequest): Promise<Receipt> {
		return apiClient.put<Receipt>(`/api/receipts/${id}`, receiptData);
	},

	/**
	 * Delete receipt
	 */
	async delete(id: number): Promise<void> {
		return apiClient.delete<void>(`/api/receipts/${id}`);
	},
};