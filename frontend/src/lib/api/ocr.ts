import apiClient from "./client";

/**
 * Payload structure for initiating OCR processing.
 */
export interface OcrRequest {
	/** Base64 encoded string of the receipt image. */
	image: string;
	/** Language code for OCR engine (default: "nld"). */
	language?: string;
}

/**
 * Response structure from the OCR engine.
 */
export interface OcrResponse {
	/** The raw text extracted from the image. */
	text: string;
	/** Optional confidence score (0-100) indicating OCR accuracy. */
	confidence?: number;
}

/**
 * Payload structure for the AI extraction step.
 */
export interface ExtractReceiptRequest {
	/** The raw text found during the OCR phase. */
	ocr_text: string;
	/** Context language to aid the AI parser. */
	language?: string;
}

/**
 * Structured data model representing a parsed receipt.
 * This is the output of the AI analysis.
 */
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
 * Manages the pipeline of converting raw images into structured receipt data via two distinct steps:
 * 1. Text extraction (OCR)
 * 2. Semantic parsing (AI)
 */
export const ocrApi = {
	/**
	 * Sends an image to the backend for Optical Character Recognition.
	 * @param {string} imageData - Base64 encoded image string.
	 * @param {string} [language="nld"] - Target language for recognition (defaults to Dutch).
	 * @returns {Promise<OcrResponse>} A promise resolving to the raw extracted text.
	 */
	async processImage(imageData: string, language = "nld"): Promise<OcrResponse> {
		return apiClient.post<OcrResponse>("/api/ocr/process", {
			image: imageData,
			language,
		});
	},

	/**
	 * Sends raw OCR text to the backend for AI-based structural analysis.
	 * Parses unstructured text into a typed receipt object.
	 * @param {string} ocrText - The raw text obtained from the previous step.
	 * @param {string} [language="nld"] - Context language.
	 * @returns {Promise<ExtractedReceipt>} A promise resolving to the structured receipt data.
	 */
	async extractReceipt(ocrText: string, language = "nld"): Promise<ExtractedReceipt> {
		return apiClient.post<ExtractedReceipt>("/api/ocr/extract", {
			ocr_text: ocrText,
			language,
		});
	},
};
