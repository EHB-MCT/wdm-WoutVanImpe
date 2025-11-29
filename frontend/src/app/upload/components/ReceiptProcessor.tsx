"use client";
import { ReceiptData } from "@/types/receipt";
import { extractReceiptData, processOCR } from "../utils/receiptExtraction";

interface ReceiptProcessorProps {
	imgInputRef: React.RefObject<HTMLInputElement | null>;
	setFoundText: (text: string) => void;
	setEditableData: (data: ReceiptData | null) => void;
	setIsLoading: (loading: boolean) => void;
}

export default function ReceiptProcessor({ imgInputRef, setFoundText, setEditableData, setIsLoading }: ReceiptProcessorProps) {
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setFoundText("");
		setEditableData(null);

		try {
			// Step 1: Get OCR text
			const file = imgInputRef.current?.files?.[0];
			if (!file) {
				throw new Error("No file selected");
			}

			const ocrText = await processOCR(file);
			setFoundText(ocrText);

			// Step 2: Extract structured data with Ollama
			const extractedData = await extractReceiptData(ocrText);
			if (extractedData) {
				setEditableData(extractedData);
			} else {
				console.warn("Failed to extract structured data, showing OCR text only");
			}
		} catch (error) {
			console.error("Processing error:", error);
			setFoundText(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
		} finally {
			setIsLoading(false);
		}
	};

	return { handleSubmit };
}
