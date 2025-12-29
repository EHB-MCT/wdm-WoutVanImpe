import { ReceiptItem } from "@/types/receipt";

/**
 * Filters out metadata (totals, taxes, payment methods) and OCR noise from the item list.
 * Applies a two-step filtering process:
 * 1. Regex matching against known non-product keywords (totals, VAT, payment methods).
 * 2. Heuristic analysis to remove "noise" lines (e.g., barcodes) that contain mostly numbers/symbols and few letters.
 *
 * @param {ReceiptItem[]} items - The raw list of items extracted via OCR.
 * @returns {ReceiptItem[]} A cleaned array containing only valid product items.
 */
export const filterNonProductItems = (items: ReceiptItem[]): ReceiptItem[] => {
	const excludePatterns = [
		// Totals & Taxes
		/^totaal$/i,
		/^total$/i,
		/^subtotaal$/i,
		/^subtotal$/i,
		/^btw$/i,
		/^vat$/i,
		/^tax$/i,
		/^kortin?g$/i,
		/^discount$/i,

		// Payment Methods
		/cash/i,
		/visa/i,
		/bancontact/i,
		/credit card/i,
		/debit card/i,

		// Currency/Price noise
		/^€?\d+,\d{2}$/,

		// Pure numeric/code noise
		/^\d+$/,
		/^[A-Z0-9]{3,}$/,
	];

	return items.filter((item) => {
		if (!item.name) return false;

		const name = item.name.trim();

		for (const pattern of excludePatterns) {
			if (pattern.test(name)) return false;
		}

		// Heuristic: Filter out barcodes or serial numbers (strings with <30% letters)
		const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
		const totalChars = name.replaceAll(/\s/g, "").length;

		if (totalChars > 0 && letterCount / totalChars < 0.3) return false;

		return true;
	});
};
