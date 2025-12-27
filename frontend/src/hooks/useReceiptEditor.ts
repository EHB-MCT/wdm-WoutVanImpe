/**
 * Custom hook for receipt editing functionality
 * Provides reusable state management and operations for receipt forms
 */

import { useState, useCallback } from "react";
import type { ReceiptData, ReceiptItem } from "@/types/receipt";
import { calculateTotalFromItems, createNewReceiptItem, formatReceiptItemForAPI } from "@/lib/receiptUtils";
import { validateReceiptData, ValidationResult } from "@/lib/receiptValidation";

interface UseReceiptEditorOptions {
	initialData?: ReceiptData | null;
	onValidationChange?: (validation: ValidationResult) => void;
}

export function useReceiptEditor(options: UseReceiptEditorOptions = {}) {
	const [editableData, setEditableData] = useState<ReceiptData | null>(options.initialData || null);
	const [validation, setValidation] = useState<ValidationResult | null>(null);

	// Update receipt data field
	const updateEditableData = useCallback(
		(field: keyof ReceiptData, value: string | number | null | ReceiptItem[] | undefined) => {
			if (!editableData) return;

			const newData = {
				...editableData,
				[field]: value,
			};

			// Recalculate total if items change
			if (field === "items" && newData.items) {
				newData.total_price = calculateTotalFromItems(newData.items);
			}

			// Handle undefined values by converting to null for consistency
			if (value === undefined) {
				(newData as Record<string, unknown>)[field] = null;
			} else {
				(newData as Record<string, unknown>)[field] = value;
			}

			setEditableData(newData);

			// Validate and optionally notify parent
			const newValidation = validateReceiptData(newData);
			setValidation(newValidation);
			options.onValidationChange?.(newValidation);
		},
		[editableData, options]
	);

	// Update individual item
	const updateItem = useCallback(
		(index: number, field: keyof ReceiptItem, value: string | number | null) => {
			if (!editableData?.items) return;

			const updatedItems = [...editableData.items];
			updatedItems[index] = {
				...updatedItems[index],
				[field]: value,
			};

			updateEditableData("items", updatedItems);
		},
		[editableData, updateEditableData]
	);

	// Add new item
	const addNewItem = useCallback(() => {
		if (!editableData) return;

		const newItem = createNewReceiptItem();
		const updatedItems = [newItem, ...(editableData.items || [])];
		updateEditableData("items", updatedItems);
	}, [editableData, updateEditableData]);

	// Remove item
	const removeItem = useCallback(
		(index: number) => {
			if (!editableData?.items) return;

			const updatedItems = editableData.items.filter((_, i) => i !== index);
			updateEditableData("items", updatedItems);
		},
		[editableData, updateEditableData]
	);

	// Initialize with new data
	const initializeData = useCallback(
		(data: ReceiptData) => {
			const dataWithCorrectTotal = {
				...data,
				total_price: calculateTotalFromItems(data.items || []),
			};

			setEditableData(dataWithCorrectTotal);
			const initialValidation = validateReceiptData(dataWithCorrectTotal);
			setValidation(initialValidation);
			options.onValidationChange?.(initialValidation);
		},
		[options]
	);

	// Reset all data
	const resetData = useCallback(() => {
		setEditableData(null);
		setValidation(null);
	}, []);

	// Prepare data for API submission
	const prepareForAPI = useCallback(() => {
		if (!editableData) return null;

		return {
			store_name: editableData.store_name,
			purchase_date: editableData.date,
			purchase_time: editableData.time,
			payment_method: editableData.payment_method,
			total_amount: editableData.total_price,
			raw_ocr_text: editableData.raw_ocr_text || null,
			items: (editableData.items || []).map(formatReceiptItemForAPI),
		};
	}, [editableData]);

	// Validate current data
	const validateCurrentData = useCallback(() => {
		if (!editableData) return null;
		const validationResult = validateReceiptData(editableData);
		setValidation(validationResult);
		return validationResult;
	}, [editableData]);

	// Get CSS class name for field based on value
	const getFieldClassName = useCallback((value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
		const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
		return isEmpty ? `${baseClass} incompleteField` : baseClass;
	}, []);

	return {
		// State
		editableData,
		validation,

		// Actions
		updateEditableData,
		updateItem,
		addNewItem,
		removeItem,
		initializeData,
		resetData,

		// Utilities
		prepareForAPI,
		validateCurrentData,
		getFieldClassName,
	};
}
