/**
 * Utility functions for receipt processing and calculations
 * Shared across upload, dashboard, and account pages
 */

import type { ReceiptItem } from "@/types/receipt";
import { VALID_CATEGORIES_SET, DEFAULTS, VALIDATION } from "./constants";

/**
 * Calculates total price from array of receipt items.
 * Sums up the price * quantity for all items with valid pricing.
 * @param {ReceiptItem[]} items - The list of items to calculate.
 * @returns {number} The sum of all item totals.
 */
export const calculateTotalFromItems = (items: ReceiptItem[]): number => {
	return items.reduce((total, item) => {
		if (item.price !== null && item.price !== undefined) {
			const quantity = item.quantity || DEFAULTS.QUANTITY;
			return total + item.price * quantity;
		}
		return total;
	}, 0);
};

/**
 * Validates and sanitizes category name.
 * Checks if the provided category exists in the allowed set.
 * @param {string | null} category - The category to check.
 * @returns {string} The valid category or the default fallback ("Overig").
 */
export const validateCategory = (category: string | null): string => {
	if (!category) return DEFAULTS.CATEGORY;

	if (VALID_CATEGORIES_SET.has(category)) {
		return category;
	}

	console.warn(`Invalid category "${category}", defaulting to "${DEFAULTS.CATEGORY}"`);
	return DEFAULTS.CATEGORY;
};

/**
 * Safely converts value to number with fallback.
 * Handles strings, nulls, and undefined values.
 * @param {string | number | null | undefined} value - The input value.
 * @param {number} fallback - The value to return if parsing fails (default 0).
 * @returns {number} The parsed number or the fallback.
 */
export const safeParseNumber = (value: string | number | null | undefined, fallback: number = 0): number => {
	if (typeof value === "number") return value;
	if (typeof value === "string" && value.length > 0) {
		const parsed = Number.parseFloat(value);
		return Number.isNaN(parsed) ? fallback : parsed;
	}
	return fallback;
};

/**
 * Safely converts value to integer with fallback.
 * Similar to safeParseNumber but ensures an integer result.
 * @param {string | number | null | undefined} value - The input value.
 * @param {number} fallback - The value to return if parsing fails.
 * @returns {number} The parsed integer.
 */
export const safeParseInt = (value: string | number | null | undefined, fallback: number = 0): number => {
	if (typeof value === "number") return Math.floor(value);
	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		return Number.isNaN(parsed) ? fallback : parsed;
	}
	return fallback;
};

/**
 * Validates item data for form submissions.
 * Checks for required names, minimum prices, and quantities.
 * @param {ReceiptItem} item - The item to validate.
 * @param {number} index - The index of the item (for error messaging).
 * @returns {Object} An object containing validity status and optional error message.
 */
export const validateReceiptItem = (item: ReceiptItem, index: number): { isValid: boolean; error?: string } => {
	if (!item.name || item.name.trim() === "") {
		return {
			isValid: false,
			error: `Item ${index + 1}: Product naam is verplicht`,
		};
	}

	const price = safeParseNumber(item.price);
	if (price <= VALIDATION.MIN_PRICE) {
		return {
			isValid: false,
			error: `Item ${index + 1}: Prijs moet groter zijn dan ${VALIDATION.MIN_PRICE}`,
		};
	}

	const quantity = safeParseNumber(item.quantity);
	if (quantity < VALIDATION.MIN_QUANTITY) {
		return {
			isValid: false,
			error: `Item ${index + 1}: Aantal moet groter zijn dan ${VALIDATION.MIN_QUANTITY}`,
		};
	}

	return { isValid: true };
};

/**
 * Validates all items in a receipt.
 * Aggregates errors from individual item validations.
 * @param {ReceiptItem[]} items - The array of items to validate.
 * @returns {Object} An object containing overall validity and a list of error strings.
 */
export const validateReceiptItems = (items: ReceiptItem[]): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	for (let i = 0; i < items.length; i++) {
		const validation = validateReceiptItem(items[i], i);
		if (!validation.isValid && validation.error) {
			errors.push(validation.error);
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

/**
 * Formats a receipt item for API submission.
 * Sanitizes inputs (categories, numbers) to ensure backend compatibility.
 * @param {ReceiptItem} item - The raw UI item.
 * @returns {Object} The sanitized item ready for the API.
 */
export const formatReceiptItemForAPI = (item: ReceiptItem) => ({
	name: item.name,
	category: validateCategory(item.category),
	quantity: safeParseInt(item.quantity, DEFAULTS.QUANTITY),
	price: safeParseNumber(item.price),
});

/**
 * Creates a new empty receipt item with defaults.
 * Used when the user clicks "Add Item" in the UI.
 * @param {number} [id] - Optional ID (generates timestamp if omitted).
 * @returns {ReceiptItem} A new blank item object.
 */
export const createNewReceiptItem = (id?: number): ReceiptItem => ({
	id: id || Date.now(),
	name: "",
	category: "",
	quantity: DEFAULTS.QUANTITY,
	price: 0,
});

/**
 * Checks if a date string is in the future.
 * Used to prevent logging receipts for future dates.
 * @param {string} dateString - The date string to check.
 * @returns {boolean} True if the date is in the future (relative to today).
 */
export const isFutureDate = (dateString: string): boolean => {
	if (!dateString) return false;

	const inputDate = new Date(dateString);
	const today = new Date();
	today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
	inputDate.setHours(0, 0, 0, 0);

	return inputDate > today;
};

/**
 * Formats currency amount for display.
 * @param {number | string} amount - The numeric amount.
 * @returns {string} The formatted string (e.g., "€10.50").
 */
export const formatCurrency = (amount: number | string): string => {
	const numeric = safeParseNumber(amount);
	return `€${numeric.toFixed(2)}`;
};

/**
 * Formats date for display in Dutch (Belgium) format.
 * @param {string} dateString - The raw ISO date string.
 * @param {Intl.DateTimeFormatOptions} [options] - Optional formatting options.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString("nl-BE", {
			day: "numeric",
			month: "long",
			year: "numeric",
			...options,
		});
	} catch {
		return dateString;
	}
};

/**
 * Generates a unique key for React lists.
 * Combines item identifier with index to ensure uniqueness.
 * @param {ReceiptItem} item - The item object.
 * @param {number} index - The list index.
 * @returns {string} A unique key string.
 */
export const generateItemKey = (item: ReceiptItem, index: number): string => {
	const identifier = item.name || item.id || "new";
	return `${identifier}-${index}`;
};
