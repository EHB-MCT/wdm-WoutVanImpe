import { ReceiptData } from "@/types/receipt";
import { VALID_CATEGORIES_SET } from "./constants";

/**
 * Represents a validation error for receipt data fields.
 * Contains error details for user feedback and form highlighting.
 */
export interface ValidationError {
	/** Field name where validation error occurred */
	field: string;
	/** Human-readable error message describing the validation issue */
	message: string;
	/** Optional item index for array-level validation errors */
	itemIndex?: number;
}

/**
 * Represents the result of receipt data validation.
 * Contains validation status and detailed error/warning information.
 */
export interface ValidationResult {
	/** Overall validation status - true if no errors */
	isValid: boolean;
	/** List of validation errors that prevent data submission */
	errors: ValidationError[];
	/** List of validation warnings that don't prevent submission */
	warnings: ValidationError[];
	/** Optional success message for validation feedback */
	success?: string;
}

/**
 * Validates receipt data for completeness and correctness.
 * Performs comprehensive validation including business rules and data integrity checks.
 * @param {ReceiptData} data - The receipt data to validate
 * @returns {ValidationResult} Validation result with errors, warnings, and validity status
 */
export const validateReceiptData = (data: ReceiptData): ValidationResult => {
	const errors: ValidationError[] = [];
	const warnings: ValidationError[] = [];

	// Validate required store fields
	if (!data.store_name || data.store_name.trim() === "") {
		errors.push({
			field: "Winkelnaam",
			message: "Winkelnaam is verplicht",
		});
	}

	// Validate date
	if (!data.date) {
		errors.push({
			field: "Datum",
			message: "Datum is verplicht",
		});
	} else {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(data.date)) {
			errors.push({
				field: "Datum",
				message: "Datum moet in JJJJ-MM-DD formaat zijn",
			});
		} else {
			const date = new Date(data.date);
			const now = new Date();
			if (date > now) {
				errors.push({
					field: "Datum",
					message: "Datum kan niet in de toekomst liggen",
				});
			}
		}
	}

	// Validate time
	if (!data.time || data.time.trim() === "") {
		errors.push({
			field: "Tijd",
			message: "Tijd is verplicht",
		});
	} else {
		const timeRegex = /^([01]?\d|2[0-3]):[0-5]\d$/;
		if (!timeRegex.test(data.time)) {
			errors.push({
				field: "Tijd",
				message: "Tijd moet in UU:MM formaat zijn (24-uurs)",
			});
		}
	}

	// Validate total price
	if (data.total_price === null || data.total_price === undefined) {
		errors.push({
			field: "Totaalbedrag",
			message: "Totaalbedrag is verplicht",
		});
	} else if (data.total_price <= 0) {
		errors.push({
			field: "Totaalbedrag",
			message: "Totaalbedrag moet groter zijn dan 0",
		});
	}

	// Validate payment method
	if (!data.payment_method || data.payment_method.trim() === "") {
		errors.push({
			field: "Betalingsmethode",
			message: "Betalingsmethode is verplicht",
		});
	}

	// Validate items
	if (!data.items || data.items.length === 0) {
		errors.push({
			field: "Artikelen",
			message: "Minimaal één artikel is verplicht",
		});
	} else {
		data.items.forEach((item, index) => {
			if (!item.name || item.name.trim() === "") {
				errors.push({
					field: "Artikelnaam",
					message: "Artikelnaam is verplicht",
					itemIndex: index,
				});
			}

			if (!item.category || item.category.trim() === "") {
				errors.push({
					field: "Categorie",
					message: "Categorie is verplicht",
					itemIndex: index,
				});
			} else if (!VALID_CATEGORIES_SET.has(item.category)) {
				errors.push({
					field: "Categorie",
					message: "Ongeldige categorie - kies uit de vooraf gedefinieerde categoriën",
					itemIndex: index,
				});
			}

			if (item.quantity === null || item.quantity === undefined) {
				errors.push({
					field: "Hoeveelheid",
					message: "Hoeveelheid moet worden gespecificeerd",
					itemIndex: index,
				});
			} else if (item.quantity <= 0) {
				errors.push({
					field: "Hoeveelheid",
					message: "Hoeveelheid moet groter zijn dan 0",
					itemIndex: index,
				});
			}

			if (item.price === null || item.price === undefined) {
				errors.push({
					field: "Prijs",
					message: "Artikelprijs is verplicht",
					itemIndex: index,
				});
			} else if (item.price <= 0) {
				errors.push({
					field: "Prijs",
					message: "Artikelprijs moet groter zijn dan 0",
					itemIndex: index,
				});
			}
		});

		// Business logic: Calculate total from items and validate
		const itemsWithPrice = data.items.filter((item) => item.price !== null && item.price !== undefined);

		// Check if there are items with prices but no items at all
		if (itemsWithPrice.length === 0 && data.items.length > 0) {
			errors.push({
				field: "Artikelen",
				message: "Minimaal één artikel moet een geldige prijs hebben",
			});
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	};
};

/**
 * Checks if receipt data has incomplete fields that need user attention.
 * @param {ReceiptData} data - The receipt data to check
 * @returns {boolean} True if there are incomplete fields, false otherwise
 */
export const hasIncompleteFields = (data: ReceiptData): boolean => {
	const result = validateReceiptData(data);
	return result.errors.length > 0;
};

/**
 * Extracts list of incomplete field names from validation errors.
 * @param {ReceiptData} data - The receipt data to analyze
 * @returns {string[]} Array of field names with errors, including item indices
 */
export const getIncompleteFields = (data: ReceiptData): string[] => {
	const result = validateReceiptData(data);
	return result.errors.map((error) => (error.itemIndex !== undefined ? `Item ${error.itemIndex + 1}: ${error.field}` : error.field));
};
