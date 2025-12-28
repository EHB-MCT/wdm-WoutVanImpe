import apiClient from "./client";

export interface OcrRequest {
	image: string;
	language?: string;
}

export interface OcrResponse {
	text: string;
	confidence?: number;
}

export interface ExtractReceiptRequest {
	ocr_text: string;
	language?: string;
}

export interface ExtractedReceipt {
	store_name?: string;
	date?: string;
	time?: string;
	total_price?: number;
	payment_method?: string;
	items?: Array<{
		name?: string;
		category?: string;
		price?: number;
		quantity?: number;
	}>;
}

/**
 * API service for OCR and AI data extraction.
 */
export const ocrApi = {
	async processImage(imageData: string, language = "nld"): Promise<OcrResponse> {
		return apiClient.post<OcrResponse>("/api/ocr/process", {
			image: imageData,
			language,
		});
	},

	async extractReceipt(ocrText: string, language = "nld"): Promise<ExtractedReceipt> {
		return apiClient.post<ExtractedReceipt>("/api/ocr/extract", {
			ocr_text: ocrText,
			language,
		});
	},
};
