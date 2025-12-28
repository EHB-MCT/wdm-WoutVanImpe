"use client";

import { ReceiptData } from "@/types/receipt";
import { extractReceiptData, processOCR } from "@/lib/receiptExtraction";
import { ProcessingStep } from "./EnhancedLoadingStates";

interface ReceiptProcessorProps {
	imgInputRef: React.RefObject<HTMLInputElement | null>;
	setFoundText: (text: string) => void;
	setEditableData: (data: ReceiptData | null) => void;
	setProcessingStep: (step: ProcessingStep) => void;
	setProcessingProgress: (progress: number) => void;
	setErrorMessage: (message: string) => void;
}

/**
 * Encapsulates the receipt processing logic (Validation -> OCR -> AI Extraction).
 * Returns the submit handler for the upload form.
 */
export function ReceiptProcessor({ imgInputRef, setFoundText, setEditableData, setProcessingStep, setProcessingProgress, setErrorMessage }: ReceiptProcessorProps) {
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
