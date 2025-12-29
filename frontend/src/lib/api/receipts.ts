import apiClient from "./client";
import { Receipt, ReceiptItem } from "../../types/receipt";

export type { Receipt } from "../../types/receipt";

/**
 * Payload structure for creating a new receipt transaction.
 */
export interface CreateReceiptRequest {
	store_name: string;
	purchase_date: string;
	purchase_time?: string;
	payment_method: string;
	total_amount: number;
	/** Raw text extracted via OCR, saved for reference or debugging. */
	raw_ocr_text?: string;
	/** List of line items on the receipt. */
	items: ReceiptItem[];
	/** Optional AI-detected flags for potentially dangerous or highlighted items. */
	dangerous_metadata?: import("../../types/receipt").DangerousMetadata;
}

/**
 * Payload structure for updating an existing receipt.
 * Allows partial updates for top-level fields, but usually requires the full items list.
 */
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
 * Provides standard CRUD operations for receipt transactions interacting with the backend API.
 */
export const receiptsApi = {
	/**
	 * Retrieves all receipts associated with the authenticated user.
	 * @returns {Promise<Receipt[]>} A promise resolving to an array of receipts.
	 */
	async getAll(): Promise<Receipt[]> {
		return apiClient.get<Receipt[]>("/api/receipts");
	},

	/**
	 * Retrieves a specific receipt by its unique identifier.
	 * @param {number} id - The ID of the receipt to fetch.
	 * @returns {Promise<Receipt>} A promise resolving to the receipt object.
	 */
	async getById(id: number): Promise<Receipt> {
		return apiClient.get<Receipt>(`/api/receipts/${id}`);
	},

	/**
	 * Creates a new receipt record in the database.
	 * @param {CreateReceiptRequest} receiptData - The payload containing receipt details.
	 * @returns {Promise<Receipt>} The created receipt object returned from the server.
	 */
	async create(receiptData: CreateReceiptRequest): Promise<Receipt> {
		return apiClient.post<Receipt>("/api/receipts", receiptData);
	},

	/**
	 * Updates an existing receipt record.
	 * @param {number} id - The ID of the receipt to update.
	 * @param {UpdateReceiptRequest} receiptData - The payload containing updated fields.
	 * @returns {Promise<Receipt>} The updated receipt object.
	 */
	async update(id: number, receiptData: UpdateReceiptRequest): Promise<Receipt> {
		return apiClient.put<Receipt>(`/api/receipts/${id}`, receiptData);
	},

	/**
	 * Permanently removes a receipt record.
	 * @param {number} id - The ID of the receipt to delete.
	 * @returns {Promise<void>} A promise that resolves upon successful deletion.
	 */
	async delete(id: number): Promise<void> {
		return apiClient.delete<void>(`/api/receipts/${id}`);
	},
};
