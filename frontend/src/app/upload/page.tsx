"use client";

import { useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { ReceiptForm } from "@/components/dashboard/ReceiptForm";
import { ReceiptItemsList } from "@/components/dashboard/ReceiptItemsList";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { EnhancedLoadingStates, ProcessingStep } from "@/components/upload/EnhancedLoadingStates";
import { OCRTextDisplay } from "@/components/upload/OCRTextDisplay";
import { ValidationModal } from "@/components/upload/ValidationModal";
import { Button } from "@/components/ui/Button";
import { ReceiptProcessor } from "@/components/upload/ReceiptProcessor";
import { generateUniqueId } from "@/lib/utils";
import { removeExpiredTokens, isUserAuthenticated } from "@/lib/auth";
import { ValidationResult, validateReceiptData } from "@/lib/receiptValidation";
import { safeParseNumber, safeParseInt } from "@/lib/receiptUtils";
import { receiptsApi, type CreateReceiptRequest } from "@/lib/api/receipts";
import { categoriesApi } from "@/lib/api/categories";
import styles from "@/styles/pages/Upload.module.css";
import componentStyles from "@/styles/components/Receipt.module.css";

/**
 * Upload page component for receipt scanning workflow.
 * Provides interface for uploading images, OCR processing, and receipt data editing.
 * @returns {JSX.Element} Upload page.
 */
export default function Home() {
    const imgInputRef = useRef<HTMLInputElement | null>(null);
    
    const [imgPreview, setImgPreview] = useState<string>("");
    const [foundText, setFoundText] = useState<string>("");
    const [editableData, setEditableData] = useState<ReceiptData | null>(null);
    const [imgSubmitted, setImgSubmitted] = useState<boolean>(false);

    const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
    const [processingProgress, setProcessingProgress] = useState<number>(0);
    const [processingError, setProcessingError] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [showValidationModal, setShowValidationModal] = useState<boolean>(false);
    const [categories, setCategories] = useState<string[]>([]);

    const handleChange = () => {
        const file = imgInputRef.current?.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setImgPreview(objectUrl);
            
            // Reset processing state when new file is selected
            setProcessingStep("idle");
            setProcessingProgress(0);
            setProcessingError("");
        }
    };

    const { handleSubmit } = ReceiptProcessor({
        imgInputRef,
        setFoundText,
        setEditableData,
        setProcessingStep,
        setProcessingProgress,
        setErrorMessage: setProcessingError,
    });

    const calculateTotalFromItems = (items: ReceiptItem[]): number => {
        return items.reduce((total, item) => {
            const price = safeParseNumber(item.price);
            const quantity = safeParseInt(item.quantity, 1);
            return total + price * quantity;
        }, 0);
    };

    const updateEditableData = (field: keyof ReceiptData, value: string | number | null) => {
        if (!editableData) return;

        const newData = {
            ...editableData,
            [field]: value,
        };

        if (field === "items" && newData.items) {
            newData.total_price = calculateTotalFromItems(newData.items);
        }

        setEditableData(newData);

        const newValidation = validateReceiptData(newData);
        setValidation(newValidation);
    };

    const updateItem = (index: number, field: keyof ReceiptItem, value: string | number | null) => {
        if (!editableData?.items) return;
        
        const updatedItems = [...editableData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value,
        };
        
        const newData = {
            ...editableData,
            items: updatedItems,
        };

        newData.total_price = calculateTotalFromItems(updatedItems);

        setEditableData(newData);

        const newValidation = validateReceiptData(newData);
        setValidation(newValidation);
    };

    const addNewItem = () => {
        if (!editableData) return;
        
        const newItem: ReceiptItem = {
            id: generateUniqueId(),
            name: null,
            category: null,
            quantity: 1,
            price: null,
        };
        
        const updatedItems = [newItem, ...(editableData.items || [])];
        const newData = {
            ...editableData,
            items: updatedItems,
        };

        newData.total_price = calculateTotalFromItems(updatedItems);

        setEditableData(newData);

        const newValidation = validateReceiptData(newData);
        setValidation(newValidation);
    };

    const removeItem = (index: number) => {
        if (!editableData?.items) return;
        
        const updatedItems = editableData.items.filter((_, i) => i !== index);
        const newData = {
            ...editableData,
            items: updatedItems,
        };

        newData.total_price = calculateTotalFromItems(updatedItems);

        setEditableData(newData);

        const newValidation = validateReceiptData(newData);
        setValidation(newValidation);
    };

    const resetForm = () => {
        setImgPreview("");
        setFoundText("");
        setEditableData(null);
        setImgSubmitted(false);
        setValidation(null);
        setProcessingStep("idle");
        setProcessingProgress(0);
        setProcessingError("");
        setIsSaving(false);
        
        // Clear the file input
        if (imgInputRef.current) {
            imgInputRef.current.value = "";
        }
    };

    const proceedWithSave = async () => {
        if (!editableData) return;

        setShowValidationModal(false);
        setIsSaving(true);
        try {
            removeExpiredTokens();
            if (!isUserAuthenticated()) {
                throw new Error("Je moet ingelogd zijn om bonnen op te slaan.");
            }

            const receiptPayload: CreateReceiptRequest = {
                store_name: editableData.store_name || "",
                purchase_date: editableData.date || "",
                purchase_time: editableData.time || undefined,
                payment_method: editableData.payment_method || "",
                total_amount: editableData.total_price || 0,
                raw_ocr_text: foundText || undefined,
                items: editableData.items || [],
                dangerous_metadata: editableData.dangerous_metadata,
            };

            await receiptsApi.create(receiptPayload);

            setValidation({
                isValid: true,
                errors: [],
                warnings: [],
                success: "Bon succesvol opgeslagen!",
            });
            setShowValidationModal(true);
            
            // Reset form after successful save
            setTimeout(() => {
                resetForm();
                setShowValidationModal(false);
            }, 2000); // Show success message for 2 seconds, then reset
        } catch (error) {
            console.error("Save error:", error);
            setValidation({
                isValid: false,
                errors: [{ field: "Save Error", message: error instanceof Error ? error.message : "Onbekende fout" }],
                warnings: [],
            });
            setShowValidationModal(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!editableData) return;

        const validationResult = validateReceiptData(editableData);
        setValidation(validationResult);
        setShowValidationModal(true);

        // Actual save is triggered by the "Continue" button in the modal via proceedWithSave
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setImgSubmitted(true);
        setShowValidationModal(false);
        setProcessingStep("idle");
        setProcessingProgress(0);
        setProcessingError("");
        handleSubmit(e);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await categoriesApi.getAll();
                setCategories(categoriesData.map((cat) => cat.name));
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (editableData) {
            // Ensure data consistency between items and total price on load
            const calculatedTotal = editableData.items ? calculateTotalFromItems(editableData.items) : 0;
            const dataWithCorrectTotal = {
                ...editableData,
                total_price: calculatedTotal,
            };

            if (editableData.total_price !== calculatedTotal) {
                setEditableData(dataWithCorrectTotal);
            }

            const initialValidation = validateReceiptData(dataWithCorrectTotal);
            setValidation(initialValidation);
        }
    }, [editableData]);

    return (
        <AuthGuard>
            <div className={styles.ocrPage}>
                <h1 className={styles.pageTitle}>Upload your tickets here!</h1>

                {imgSubmitted && (() => {
                    const enhancedLoadingState = (
                        <EnhancedLoadingStates 
                            currentStep={processingStep} 
                            progress={processingProgress} 
                            errorMessage={processingError} 
                        />
                    );
                    
                    const editableDataState = (
                        <div>
                            <div className={styles.editReceiptHeader}>
                                <strong>Edit Receipt Data:</strong>
                            </div>

                            <div className={componentStyles.receiptFormSection}>
                                <ReceiptForm 
                                    editableData={editableData} 
                                    updateEditableData={updateEditableData} 
                                />

                                <ReceiptItemsList 
                                    editableData={editableData} 
                                    updateItem={updateItem} 
                                    addNewItem={addNewItem} 
                                    removeItem={removeItem} 
                                    categories={categories} 
                                />
                            </div>

                            <OCRTextDisplay foundText={foundText} />

                            <div className={styles.saveButtonContainer}>
                                <Button 
                                    onClick={handleSave} 
                                    disabled={isSaving} 
                                    variant="primary" 
                                    className={styles.saveButton}
                                >
                                    {isSaving ? "Saving..." : "Save Receipt"}
                                </Button>
                            </div>

                            {showValidationModal && validation && (
                                <ValidationModal 
                                    validation={validation} 
                                    isOpen={showValidationModal} 
                                    onClose={() => setShowValidationModal(false)} 
                                    onContinue={proceedWithSave} 
                                    onResetForm={resetForm} 
                                />
                            )}
                        </div>
                    );
                    
                    const foundTextState = (
                        <div>
                            <strong>OCR Text (AI extraction failed):</strong>
                            <pre className={componentStyles.ocrFailedText}>{foundText}</pre>
                        </div>
                    );
                    
                    const failedState = (
                        <div className={componentStyles.processingFailed}>
                            <strong>Processing failed</strong>
                        </div>
                    );

                    return (
                        <div className={classNames(styles.textResultContainer, "card")}>
                            {processingStep !== "idle" && processingStep !== "success" 
                                ? enhancedLoadingState 
                                : editableData 
                                    ? editableDataState 
                                    : foundText 
                                        ? foundTextState 
                                        : failedState
                            }
                        </div>
                    );
                })()}

                <ImageUpload 
                    imgInputRef={imgInputRef} 
                    imgPreview={imgPreview} 
                    onChange={handleChange} 
                    isLoading={processingStep !== "idle" && processingStep !== "success"} 
                    onSubmit={handleFormSubmit} 
                />
            </div>
        </AuthGuard>
    );
}