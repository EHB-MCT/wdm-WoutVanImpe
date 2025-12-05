"use client";
import { useRef, useState, useEffect } from "react";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { validateReceiptData, ValidationResult } from "./utils/receiptValidation";
import ImageUpload from "./components/ImageUpload";
import ReceiptForm from "../components/ReceiptForm";
import ReceiptItemsList from "../components/ReceiptItemsList";
import LoadingStates from "./components/LoadingStates";
import OCRTextDisplay from "./components/OCRTextDisplay";
import ReceiptProcessor from "./components/ReceiptProcessor";
import ValidationModal from "./components/ValidationModal";
import styles from "../page.module.css";
import componentStyles from "../components/components.module.css";
import classNames from "classnames";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [imgPreview, setImgPreview] = useState<string>("");
	const [foundText, setFoundText] = useState<string>("");
	const [editableData, setEditableData] = useState<ReceiptData | null>(null);
	const [imgSubmitted, setImgSubmitted] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [validation, setValidation] = useState<ValidationResult | null>(null);
	const [showValidationModal, setShowValidationModal] = useState<boolean>(false);

	const handleChange = () => {
		console.log("change");
		const file = imgInputRef.current?.files?.[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setImgPreview(objectUrl);
		}
	};

	const { handleSubmit } = ReceiptProcessor({
		imgInputRef,
		setFoundText,
		setEditableData,
		setIsLoading,
	});

	const calculateTotalFromItems = (items: ReceiptItem[]): number => {
		return items.reduce((total, item) => {
			if (item.price !== null && item.price !== undefined) {
				const quantity = item.quantity || 1;
				return total + (item.price * quantity);
			}
			return total;
		}, 0);
	};

	const updateEditableData = (field: keyof ReceiptData, value: string | number | null) => {
		if (!editableData) return;
		
		const newData = {
			...editableData,
			[field]: value,
		};
		
		// Recalculate total if items change
		if (field === 'items' && newData.items) {
			newData.total_price = calculateTotalFromItems(newData.items);
		}
		
		setEditableData(newData);
		
		// Re-validate on data change
		const newValidation = validateReceiptData(newData);
		setValidation(newValidation);
	};

	const updateItem = (index: number, field: keyof ReceiptItem, value: string | number | null) => {
		if (!editableData || !editableData.items) return;
		const updatedItems = [...editableData.items];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};
		const newData = {
			...editableData,
			items: updatedItems,
		};
		
		// Recalculate total from items
		newData.total_price = calculateTotalFromItems(updatedItems);
		
		setEditableData(newData);
		
		// Re-validate on item change
		const newValidation = validateReceiptData(newData);
		setValidation(newValidation);
	};

	const addNewItem = () => {
		if (!editableData) return;
		const newItem: ReceiptItem = {
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
		
		// Recalculate total from items
		newData.total_price = calculateTotalFromItems(updatedItems);
		
		setEditableData(newData);
		
		// Re-validate after adding item
		const newValidation = validateReceiptData(newData);
		setValidation(newValidation);
	};

	const removeItem = (index: number) => {
		if (!editableData || !editableData.items) return;
		const updatedItems = editableData.items.filter((_, i) => i !== index);
		const newData = {
			...editableData,
			items: updatedItems,
		};
		
		// Recalculate total from items
		newData.total_price = calculateTotalFromItems(updatedItems);
		
		setEditableData(newData);
		
		// Re-validate after removing item
		const newValidation = validateReceiptData(newData);
		setValidation(newValidation);
	};

	const proceedWithSave = async () => {
		if (!editableData) return;

		setShowValidationModal(false);
		setIsSaving(true);
		try {
			// Here you would send data to your API
			console.log("Saving receipt data:", editableData);

			// Example API call (uncomment and modify as needed):
			/*
			const response = await fetch("http://localhost:3000/api/receipts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(editableData),
			});
			
			if (!response.ok) {
				throw new Error(`Save failed: ${response.status} ${response.statusText}`);
			}
			*/

			alert("Receipt saved successfully!");
		} catch (error) {
			console.error("Save error:", error);
			alert(`Error saving receipt: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSave = async () => {
		if (!editableData) return;

		// Validate before saving
		const validationResult = validateReceiptData(editableData);
		setValidation(validationResult);
		setShowValidationModal(true);

		if (!validationResult.isValid) {
			// Don't save if there are errors
			return;
		}

		// If valid, proceed with save will be handled by modal continue button
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setImgSubmitted(true);
		setShowValidationModal(false); // Reset validation when new image is submitted
		handleSubmit(e);
	};

	// Initialize validation when editableData is set
	useEffect(() => {
		if (editableData) {
			// Ensure total is calculated from items
			const calculatedTotal = editableData.items ? calculateTotalFromItems(editableData.items) : 0;
			const dataWithCorrectTotal = {
				...editableData,
				total_price: calculatedTotal
			};
			
			// Update the data if total was different
			if (editableData.total_price !== calculatedTotal) {
				setEditableData(dataWithCorrectTotal);
			}
			
			const initialValidation = validateReceiptData(dataWithCorrectTotal);
			setValidation(initialValidation);
		}
	}, [editableData]); // Include editableData as dependency

	return (
		<div className={styles.ocrPage}>
			<h1 className={styles.pageTitle}>Upload your tickets here!</h1>

			{imgSubmitted && (
				<div className={classNames(componentStyles.textResultContainer, "card")}>
					{isLoading ? (
						<LoadingStates isLoading={isLoading} />
					) : editableData ? (
						<div>
							<div className={componentStyles.editReceiptHeader}>
								<strong>Edit Receipt Data:</strong>
								<button onClick={handleSave} disabled={isSaving} className={`btn btn-primary ${componentStyles.saveButton}`}>
									{isSaving ? "Saving..." : "Save Receipt"}
								</button>
							</div>

							{showValidationModal && validation && (
								<ValidationModal 
									validation={validation} 
									isOpen={showValidationModal}
									onClose={() => setShowValidationModal(false)}
									onContinue={proceedWithSave}
								/>
							)}

							<div className={componentStyles.receiptFormSection}>
								<ReceiptForm editableData={editableData} updateEditableData={updateEditableData} />

								<ReceiptItemsList editableData={editableData} updateItem={updateItem} addNewItem={addNewItem} removeItem={removeItem} />
							</div>

							<OCRTextDisplay foundText={foundText} />
						</div>
					) : foundText ? (
						<div>
							<strong>OCR Text (AI extraction failed):</strong>
							<pre className={componentStyles.ocrFailedText}>{foundText}</pre>
						</div>
					) : (
						<div className={componentStyles.processingFailed}>
							<strong>Processing failed</strong>
						</div>
					)}
				</div>
			)}

			<ImageUpload imgInputRef={imgInputRef} imgPreview={imgPreview} onChange={handleChange} isLoading={isLoading} onSubmit={handleFormSubmit} />
		</div>
	);
}
