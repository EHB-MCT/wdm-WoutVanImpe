"use client";
import { useRef, useState } from "react";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import ImageUpload from "./components/ImageUpload";
import ReceiptForm from "../components/ReceiptForm";
import ReceiptItemsList from "../components/ReceiptItemsList";
import LoadingStates from "./components/LoadingStates";
import OCRTextDisplay from "./components/OCRTextDisplay";
import ReceiptProcessor from "./components/ReceiptProcessor";
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

	const updateEditableData = (field: keyof ReceiptData, value: string | number | null) => {
		if (!editableData) return;
		setEditableData({
			...editableData,
			[field]: value,
		});
	};

	const updateItem = (index: number, field: keyof ReceiptItem, value: string | number | null) => {
		if (!editableData || !editableData.items) return;
		const updatedItems = [...editableData.items];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};
		setEditableData({
			...editableData,
			items: updatedItems,
		});
	};

	const addNewItem = () => {
		if (!editableData) return;
		const newItem: ReceiptItem = {
			name: null,
			category: null,
			quantity: 1,
			price: null,
		};
		setEditableData({
			...editableData,
			items: [newItem, ...(editableData.items || [])],
		});
	};

	const removeItem = (index: number) => {
		if (!editableData || !editableData.items) return;
		const updatedItems = editableData.items.filter((_, i) => i !== index);
		setEditableData({
			...editableData,
			items: updatedItems,
		});
	};

	const handleSave = async () => {
		if (!editableData) return;

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

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setImgSubmitted(true);
		handleSubmit(e);
	};

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
