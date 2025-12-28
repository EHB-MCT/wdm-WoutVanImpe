import { ReceiptData } from "@/types/receipt";

// Predefined categories for validation (as Set for efficient existence checks)
const VALID_CATEGORIES = new Set(["Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"]);

export interface ValidationError {
	field: string;
	message: string;
	itemIndex?: number;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
	warnings: ValidationError[];
	success?: string;
}

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
			} else if (!VALID_CATEGORIES.has(item.category)) {
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

export const hasIncompleteFields = (data: ReceiptData): boolean => {
	const result = validateReceiptData(data);
	return result.errors.length > 0;
};

export const getIncompleteFields = (data: ReceiptData): string[] => {
	const result = validateReceiptData(data);
	return result.errors.map((error) => (error.itemIndex !== undefined ? `Item ${error.itemIndex + 1}: ${error.field}` : error.field));
};
