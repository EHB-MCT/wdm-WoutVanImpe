import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { filterNonProductItems } from "./itemFilter";

export const extractReceiptData = async (ocrText: string): Promise<ReceiptData | null | undefined> => {
	try {
		const prompt = `Extract receipt data from the following OCR text and return ONLY a JSON object. No explanations, no markdown formatting, no conversational text.

OCR Text:
"""
${ocrText}
"""

Return JSON with this exact structure:
{
  "store_name": null,
  "date": null,
  "time": null,
  "total_price": null,
  "payment_method": null,
  "items": []
}

Rules:
- store_name: Shop name (string or null)
- date: YYYY-MM-DD format (string or null)
- time: HH:MM 24h format (string or null)
- total_price: Final amount paid (number or null)
- payment_method: "Cash", "Visa", "Bancontact", "Credit Card", etc. (string or null)
- items: Array of objects with name, category, quantity, price (default quantity to 1 if not specified)
- CRITICAL: Extract EVERY single line item that could possibly be a product, even if you're unsure. If it has a name and price, treat it as a product. Be maximally inclusive - when in doubt, include it.
- Include all food items, drinks, household products, clothing, electronics, services, fees, taxes, and any other line items with names and prices.
- BUT filter out: "TOTAAL", "TOTAL", "SUBTOTAAL", "SUBTOTAL", "BTW", "VAT", "TAX", "KORTING", "DISCOUNT", and any line items that are just numbers, codes, or payment method descriptions.

IMPORTANT: Return ONLY the raw JSON object. Nothing else.`;

		const response = await fetch("http://localhost:11434/api/generate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "llama3.2",
				prompt: prompt,
				stream: false,
			}),
		});

		if (!response.ok) {
			throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		if (!data.response) {
			throw new Error("No response from Ollama");
		}

		// The response from Ollama is a JSON string that needs to be parsed
		try {
			console.log(data.response);
			const parsedData = JSON.parse(data.response);

			// Validate and sanitize the structure
			if (parsedData && typeof parsedData === "object") {
				const rawItems = Array.isArray(parsedData.items) ? parsedData.items : [];

				// Filter out non-product items
				const filteredItems = filterNonProductItems(rawItems);

				const sanitizedItems = filteredItems.map((item: ReceiptItem) => ({
					name: item.name || null,
					category: item.category || null,
					quantity: typeof item.quantity === "number" ? item.quantity : null,
					price: typeof item.price === "number" ? item.price : null,
				}));

				return {
					store_name: parsedData.store_name || null,
					date: parsedData.date || null,
					time: parsedData.time || null,
					total_price: typeof parsedData.total_price === "number" ? parsedData.total_price : null,
					payment_method: parsedData.payment_method || null,
					items: sanitizedItems,
				};
			} else {
				throw new Error("Invalid data structure from Ollama");
			}
		} catch (parseError) {
			console.error("JSON parse error:", parseError);
			console.error("Raw response:", data.response);
			throw new Error("Failed to parse JSON from Ollama response");
		}
	} catch (error) {
		console.error("Receipt extraction error:", error);
		return null;
	}
};

export const processOCR = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("image", file);

	const response = await fetch("http://localhost:3000/OCR", {
		method: "POST",
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`OCR request failed: ${response.status} ${response.statusText}`);
	}

	const ocrData = await response.json();

	if (!ocrData.text) {
		throw new Error("No text extracted from OCR");
	}

	return ocrData.text;
};
