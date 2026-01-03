import { useState, useCallback } from "react";
import type { ReceiptData, ReceiptItem } from "@/types/receipt";
import { calculateTotalFromItems, createNewReceiptItem, formatReceiptItemForAPI } from "@/lib/receiptUtils";
import { validateReceiptData, ValidationResult } from "@/lib/receiptValidation";

/**
 * Configuration options for the useReceiptEditor hook.
 */
interface UseReceiptEditorOptions {
	/** Optional initial data to populate the editor. */
	initialData?: ReceiptData | null;
	/** Callback function triggered whenever the validation state changes. */
	onValidationChange?: (validation: ValidationResult) => void;
}

/**
 * Custom hook that manages the state and logic for editing receipt data.
 * Handles updates, validation, total calculations, item management, and API preparation.
 * @param {UseReceiptEditorOptions} options - Configuration options.
 * @returns {Object} State and handler functions for the receipt editor.
 */
export function useReceiptEditor(options: UseReceiptEditorOptions = {}) {
	const { initialData, onValidationChange } = options;
	const [editableData, setEditableData] = useState<ReceiptData | null>(initialData || null);
	const [validation, setValidation] = useState<ValidationResult | null>(null);

	/**
	 * Updates a top-level field in the receipt data or replaces the items array.
	 * Automatically recalculates the total price if items are modified.
	 * Triggers validation after update.
	 * @param {string} field - The key of the field to update.
	 * @param {any} value - The new value for the field.
	 */
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

	/**
	 * Updates a specific field of a specific line item by index.
	 * @param {number} index - The index of the item in the list.
	 * @param {string} field - The field of the item to update (e.g., name, price).
	 * @param {any} value - The new value.
	 */
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

	/**
	 * Adds a new, empty item to the beginning of the items list.
	 */
	const addNewItem = useCallback(() => {
		if (!editableData) return;

		const newItem = createNewReceiptItem();
		const updatedItems = [newItem, ...(editableData.items || [])];
		updateEditableData("items", updatedItems);
	}, [editableData, updateEditableData]);

	/**
	 * Removes an item from the list based on its index.
	 * @param {number} index - The index of the item to remove.
	 */
	const removeItem = useCallback(
		(index: number) => {
			if (!editableData?.items) return;

			const updatedItems = editableData.items.filter((_, i) => i !== index);
			updateEditableData("items", updatedItems);
		},
		[editableData, updateEditableData]
	);

	/**
	 * Initializes the editor with external data (e.g., from OCR or an existing receipt).
	 * Recalculates totals to ensure data consistency upon load.
	 * @param {ReceiptData} data - The source data.
	 */
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

	/**
	 * Resets the editor state to null.
	 */
	const resetData = useCallback(() => {
		setEditableData(null);
		setValidation(null);
	}, []);

	/**
	 * Transforms the current editor state into the format required by the backend API.
	 * @returns {Object|null} The payload object or null if no data exists.
	 */
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

	/**
	 * Manually triggers validation on the current data state.
	 * @returns {ValidationResult|null} The validation result.
	 */
	const validateCurrentData = useCallback(() => {
		if (!editableData) return null;
		const validationResult = validateReceiptData(editableData);
		setValidation(validationResult);
		return validationResult;
	}, [editableData]);

	/**
	 * Helper to determine CSS classes for input fields based on validation status.
	 * Returns a class indicating 'incomplete' if the field is empty or zero (for numbers).
	 * @param {any} value - The input value.
	 * @param {boolean} isQuantity - Whether to validate as a quantity.
	 * @param {boolean} isPrice - Whether to validate as a price.
	 * @returns {string} The computed CSS class string.
	 */
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
