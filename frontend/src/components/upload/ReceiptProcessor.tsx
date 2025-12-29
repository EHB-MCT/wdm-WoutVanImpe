"use client";

import { ReceiptData } from "@/types/receipt";
import { extractReceiptData, processOCR } from "@/lib/receiptExtraction";
import { ProcessingStep } from "./EnhancedLoadingStates";

/**
 * Interface defining the state setters and refs required by the processor.
 */
interface ReceiptProcessorProps {
	/** Reference to the file input element to retrieve the selected image. */
	imgInputRef: React.RefObject<HTMLInputElement | null>;
	/** State setter for the raw text extracted via OCR. */
	setFoundText: (text: string) => void;
	/** State setter for the structured data parsed by AI. */
	setEditableData: (data: ReceiptData | null) => void;
	/** State setter for the current visual step in the loading indicator. */
	setProcessingStep: (step: ProcessingStep) => void;
	/** State setter for the numeric progress bar (0-100). */
	setProcessingProgress: (progress: number) => void;
	/** State setter for displaying error messages to the user. */
	setErrorMessage: (message: string) => void;
}

/**
 * Logic controller for the receipt processing workflow.
 * Orchestrates the transition between file upload, Optical Character Recognition (OCR),
 * and AI-based data extraction by managing state updates at every stage.
 * @param {ReceiptProcessorProps} props - The state handlers and refs needed to drive the UI.
 * @returns {Object} An object containing the `handleSubmit` event handler.
 */
export function ReceiptProcessor({ imgInputRef, setFoundText, setEditableData, setProcessingStep, setProcessingProgress, setErrorMessage }: ReceiptProcessorProps) {
	/**
	 * Asynchronous handler for the form submission event.
	 * Executes the processing pipeline:
	 * 1. Validates file existence.
	 * 2. Performs OCR to get raw text.
	 * 3. Sends text to AI for structured parsing.
	 * 4. Updates progress and status states throughout the lifecycle.
	 * @param {React.FormEvent} e - The form submission event.
	 * @returns {Promise<void>} A promise that resolves when processing is complete or rejects on error.
	 */
	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();

		const file = imgInputRef.current?.files?.[0];
		if (!file) {
			throw new Error("Geen bestand geselecteerd");
		}

		setProcessingStep("uploading");
		setProcessingProgress(10);

		try {
			// 1. Extract raw text via Tesseract
			setProcessingStep("ocr-processing");
			setProcessingProgress(30);

			const ocrText = await processOCR(file);

			setFoundText(ocrText);
			setProcessingStep("ocr-complete");
			setProcessingProgress(50);

			// 2. Parse text into structured data via AI
			setProcessingStep("ai-processing");
			setProcessingProgress(70);

			const extractedData = await extractReceiptData(ocrText);

			setEditableData(extractedData ?? null);
			setProcessingStep("ai-complete");
			setProcessingProgress(90);

			// 3. Finalize
			setProcessingStep("success");
			setProcessingProgress(100);
		} catch (error) {
			console.error("Processing error:", error);

			const message = error instanceof Error ? error.message : "Onbekende fout opgetreden";
			setErrorMessage(message);
			setProcessingStep("error");

			throw error;
		}
	};

	return { handleSubmit };
}
