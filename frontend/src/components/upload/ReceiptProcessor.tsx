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
  setHasError: (hasError: boolean) => void;
  setErrorMessage: (message: string) => void;
}

export function ReceiptProcessor({ 
  imgInputRef, 
  setFoundText, 
  setEditableData, 
  setProcessingStep, 
  setProcessingProgress,
  setHasError,
  setErrorMessage
}: ReceiptProcessorProps) {
  
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFoundText("");
    setEditableData(null);
    setErrorMessage("");
    setHasError(false);
    
    try {
      // Step 1: Upload and validate file
      const file = imgInputRef.current?.files?.[0];
      if (!file) {
        throw new Error("Geen bestand geselecteerd");
      }

      setProcessingStep("uploading");
      setProcessingProgress(10);

      // Step 2: OCR Processing
      setProcessingStep("ocr-processing");
      setProcessingProgress(25);

      const ocrText = await processOCR(file);
      setFoundText(ocrText);
      
      setProcessingStep("ocr-complete");
      setProcessingProgress(50);

      // Step 3: AI Processing
      setProcessingStep("ai-processing");
      setProcessingProgress(60);

      const extractedData = await extractReceiptData(ocrText);
      
      if (extractedData) {
        setEditableData(extractedData);
        setProcessingStep("ai-complete");
        setProcessingProgress(90);
        
        // Small delay to show completion state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProcessingStep("success");
        setProcessingProgress(100);
      } else {
        setProcessingStep("ai-complete");
        setProcessingProgress(90);
        console.warn("Failed to extract structured data, showing OCR text only");
        
        // Still consider it successful but with OCR only
        setTimeout(() => setProcessingStep("success"), 500);
      }
    } catch (error) {
      console.error("Processing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Onbekende fout opgetreden";
      
      setHasError(true);
      setErrorMessage(errorMessage);
      setProcessingStep("error");
      setFoundText(`Error: ${errorMessage}`);
    }
  };

  const retryProcess = async (): Promise<void> => {
    // Reset error state and retry
    setHasError(false);
    setErrorMessage("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleSubmit(new Event("submit") as any);
  };

  return { handleSubmit, retryProcess };
}