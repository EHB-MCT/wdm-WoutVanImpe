/**
 * Tesseract OCR API service
 * Handles image processing and text extraction
 */

import apiClient from './client';

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

export const ocrApi = {
	/**
	 * Process image with OCR
	 */
	async processImage(imageData: string, language = 'nld'): Promise<OcrResponse> {
		return apiClient.post<OcrResponse>('/api/ocr/process', {
			image: imageData,
			language,
		});
	},

	/**
	 * Extract receipt data from OCR text
	 */
	async extractReceipt(ocrText: string, language = 'nld'): Promise<ExtractedReceipt> {
		return apiClient.post<ExtractedReceipt>('/api/ocr/extract', {
			ocr_text: ocrText,
			language,
		});
	},
};