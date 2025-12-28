import { useState, useCallback } from "react";
import type { ReceiptData, ReceiptItem } from "@/types/receipt";
import { calculateTotalFromItems, createNewReceiptItem, formatReceiptItemForAPI } from "@/lib/receiptUtils";
import { validateReceiptData, ValidationResult } from "@/lib/receiptValidation";

interface UseReceiptEditorOptions {
	initialData?: ReceiptData | null;
	onValidationChange?: (validation: ValidationResult) => void;
}

/**
 * Manages receipt editing state, validation, and total calculations.
 */
export function useReceiptEditor(options: UseReceiptEditorOptions = {}) {
	const { initialData, onValidationChange } = options;
	const [editableData, setEditableData] = useState<ReceiptData | null>(initialData || null);
	const [validation, setValidation] = useState<ValidationResult | null>(null);

	const updateEditableData = useCallback(
		(field: keyof ReceiptData, value: string | number | null | ReceiptItem[] | undefined) => {
			if (!editableData) return;

			const newData = { ...editableData };

			// Handle undefined values by converting to null for consistency with API expectations
			if (value === undefined) {
				(newData as Record<string, unknown>)[field] = null;
			} else {
				(newData as Record<string, unknown>)[field] = value;
			}

			// Auto-recalculate total if the items list changes
			if (field === "items" && Array.isArray(value)) {
				newData.total_price = calculateTotalFromItems(value);
			}

			setEditableData(newData);

			const newValidation = validateReceiptData(newData);
			setValidation(newValidation);
			onValidationChange?.(newValidation);
		},
		[editableData, onValidationChange]
	);

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

	const addNewItem = useCallback(() => {
		if (!editableData) return;

		const newItem = createNewReceiptItem();
		const updatedItems = [newItem, ...(editableData.items || [])];
		updateEditableData("items", updatedItems);
	}, [editableData, updateEditableData]);

	const removeItem = useCallback(
		(index: number) => {
			if (!editableData?.items) return;

			const updatedItems = editableData.items.filter((_, i) => i !== index);
			updateEditableData("items", updatedItems);
		},
		[editableData, updateEditableData]
	);

	const initializeData = useCallback(
		(data: ReceiptData) => {
			// Ensure total is consistent with items upon load
			const dataWithCorrectTotal = {
				...data,
				total_price: calculateTotalFromItems(data.items || []),
			};

			setEditableData(dataWithCorrectTotal);
			const initialValidation = validateReceiptData(dataWithCorrectTotal);
			setValidation(initialValidation);
			onValidationChange?.(initialValidation);
		},
		[onValidationChange]
	);

	const resetData = useCallback(() => {
		setEditableData(null);
		setValidation(null);
	}, []);

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

	const validateCurrentData = useCallback(() => {
		if (!editableData) return null;
		const validationResult = validateReceiptData(editableData);
		setValidation(validationResult);
		return validationResult;
	}, [editableData]);

	const getFieldClassName = useCallback((value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
		const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
		return isEmpty ? `${baseClass} incompleteField` : baseClass;
	}, []);

	return {
		editableData,
		validation,
		updateEditableData,
		updateItem,
		addNewItem,
		removeItem,
		initializeData,
		resetData,
		prepareForAPI,
		validateCurrentData,
		getFieldClassName,
	};
}
