import { ReceiptItem } from "@/types/receipt";

export const filterNonProductItems = (items: ReceiptItem[]): ReceiptItem[] => {
	const excludePatterns = [
		/^totaal$/i,
		/^total$/i,
		/^subtotaal$/i,
		/^subtotal$/i,
		/^btw$/i,
		/^vat$/i,
		/^tax$/i,
		/^kortin?g$/i,
		/^discount$/i,
		/^\d+$/,
		/^[A-Z0-9]{3,}$/,
		/^€?\d+,\d{2}$/,
		/cash/i,
		/visa/i,
		/bancontact/i,
		/credit card/i,
		/debit card/i,
	];

	return items.filter((item) => {
		if (!item.name) return false;

		const name = item.name.trim();

		// Check if name matches any exclusion pattern
		for (const pattern of excludePatterns) {
			if (pattern.test(name)) return false;
		}

		// Check if name is mostly numbers/codes (less than 30% letters)
		const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
		const totalChars = name.replace(/\s/g, "").length;
		if (totalChars > 0 && letterCount / totalChars < 0.3) return false;

		return true;
	});
};
