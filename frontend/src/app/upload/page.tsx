"use client";
import { useRef, useState, useEffect } from "react";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import styles from "@/styles/pages/Upload.module.css";
import componentStyles from "@/styles/components/Receipt.module.css";
import classNames from "classnames";
import { ReceiptForm } from "@/components/dashboard/ReceiptForm";
import { ReceiptItemsList } from "@/components/dashboard/ReceiptItemsList";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { ImageUpload } from "@/components/upload/ImageUpload";
import { LoadingStates } from "@/components/upload/LoadingStates";
import { OCRTextDisplay } from "@/components/upload/OCRTextDisplay";
import { ReceiptProcessor } from "@/components/upload/ReceiptProcessor";
import { ValidationModal } from "@/components/upload/ValidationModal";
import { removeExpiredTokens, isUserAuthenticated, handleTokenRefresh } from "@/lib/auth";
import { ValidationResult, validateReceiptData } from "@/lib/receiptValidation";

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
	const [categories, setCategories] = useState<string[]>([]);

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
			id: Date.now(),
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
		if (!editableData?.items) return;
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
			// Clean up expired tokens and check authentication
			removeExpiredTokens();
			if (!isUserAuthenticated()) {
				throw new Error("Je moet ingelogd zijn om bonnen op te slaan.");
			}
			
			const token = localStorage.getItem("token");

			const receiptPayload = {
				store_name: editableData.store_name,
				purchase_date: editableData.date,
				purchase_time: editableData.time,
				payment_method: editableData.payment_method,
				total_amount: editableData.total_price,
				raw_ocr_text: foundText || null,
				items: editableData.items || []
			};

const response = await fetch("http://localhost:5001/api/receipts", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify(receiptPayload),
			});
			
// Handle automatic token refresh
			const refreshSuccess = handleTokenRefresh(response);
			if (!refreshSuccess) {
				console.warn('Token refresh failed, continuing with current session');
			}
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Opslaan mislukt: ${response.status} ${response.statusText}`);
			}

			const savedReceipt = await response.json();
			console.log("Receipt saved successfully:", savedReceipt);
			
			// Reset form after successful save
			setImgPreview("");
			setFoundText("");
			setEditableData(null);
			setImgSubmitted(false);
			setValidation(null);
			
			alert("Bon succesvol opgeslagen!");
		} catch (error) {
			console.error("Save error:", error);
			alert(`Fout bij opslaan bon: ${error instanceof Error ? error.message : "Onbekende fout"}`);
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

	// Fetch categories on component mount
	useEffect(() => {
		const fetchCategories = async () => {
			try {
const response = await fetch("http://localhost:5001/api/categories");
if (response.ok) {
					// Handle automatic token refresh (though categories endpoint doesn't require auth)
					const refreshSuccess = handleTokenRefresh(response);
					if (!refreshSuccess) {
						console.warn('Token refresh failed during categories fetch');
					}
					const categoriesData: { id: number; name: string }[] = await response.json();
					setCategories(categoriesData.map((cat) => cat.name));
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};

		fetchCategories();
	}, []);

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
		<AuthGuard>
			<div className={styles.ocrPage}>
			<h1 className={styles.pageTitle}>Upload your tickets here!</h1>

			{imgSubmitted && (() => {
				const loadingState = <LoadingStates isLoading={isLoading} />;
				const editableDataState = (
					<div>
						<div className={styles.editReceiptHeader}>
							<strong>Edit Receipt Data:</strong>
							<button onClick={handleSave} disabled={isSaving} className={`btn btn-primary ${styles.saveButton}`}>
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

							<ReceiptItemsList editableData={editableData} updateItem={updateItem} addNewItem={addNewItem} removeItem={removeItem} categories={categories} />
						</div>

						<OCRTextDisplay foundText={foundText} />
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
						{isLoading ? loadingState : editableData ? editableDataState : foundText ? foundTextState : failedState}
					</div>
				);
			})()}

			<ImageUpload imgInputRef={imgInputRef} imgPreview={imgPreview} onChange={handleChange} isLoading={isLoading} onSubmit={handleFormSubmit} />
			</div>
		</AuthGuard>
	);
}
