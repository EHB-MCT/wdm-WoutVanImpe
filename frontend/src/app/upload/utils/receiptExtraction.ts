import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { filterNonProductItems } from "./itemFilter";

// Predefined categories for validation
const VALID_CATEGORIES = [
	"Boodschappen",
	"Huishouden", 
	"Verkeer & Vervoer",
	"Gezondheid & Zorg",
	"Vrije Tijd & Uitgaan",
	"Winkels & Kleding",
	"Financieel & Diensten",
	"Overig"
];



// Determine if store type is mixed-type (allows multiple categories)
const isMixedTypeStore = (storeType: string): boolean => {
	return storeType === 'supermarket';
};

// Validate and sanitize category
const validateCategory = (category: string | null): string => {
	if (!category) return "Overig";
	
	// Check if category is exactly one of the valid categories
	if (VALID_CATEGORIES.includes(category)) {
		return category;
	}
	
	// If not valid, default to "Overig"
	console.warn(`Invalid category "${category}" detected, defaulting to "Overig"`);
	return "Overig";
};

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

INTERNAL USE ONLY (not returned in JSON):
- Also determine store_type and primary_category for your internal categorization logic
- store_type: "supermarket", "clothing", "electronics", "restaurant", "pharmacy", "petrol_station", "hardware", "unknown"
- primary_category: "Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"

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

INTERNAL STORE TYPE DETECTION (for categorization logic only):
- Analyze store_name and types of items being sold to determine store type
- "supermarket": Sells food, drinks, household items, sometimes electronics/clothing (Carrefour, Delhaize, Albert Heijn, etc.)
- "clothing": Sells primarily clothing, shoes, accessories (H&M, Zara, C&A, Primark, etc.)
- "electronics": Sells electronics, appliances, gadgets (MediaMarkt, Apple Store, Coolblue, etc.)
- "restaurant": Sells prepared food, drinks for immediate consumption (McDonald's, Quick, Pizza Hut, etc.)
- "pharmacy": Sells medications, health products, personal care (Pharmacie, Kruidvat, Action, etc.)
- "petrol_station": Sells fuel, car products, convenience items (Shell, Total, Q8, etc.)
- "hardware": Sells tools, building materials, home improvement (Brico, Gamma, IKEA, etc.)
- "unknown": If store type cannot be determined

INTERNAL PRIMARY CATEGORY ASSIGNMENT:
- "supermarket" → "Boodschappen" (mixed-type store)
- "clothing" → "Winkels & Kleding"
- "electronics" → "Winkels & Kleding"
- "restaurant" → "Vrije Tijd & Uitgaan"
- "pharmacy" → "Gezondheid & Zorg"
- "petrol_station" → "Verkeer & Vervoer"
- "hardware" → "Huishouden"
- "unknown" → "Overig"

CATEGORY ASSIGNMENT - AI-BASED STORE DETECTION:
- CRITICAL: Most receipts are from a single store type, so items should generally share same category
- Use the store_type and primary_category you determined above for categorization

STORE-BASED CATEGORIZATION RULES:
1. **Supermarkets (store_type: "supermarket")**:
   - These are MIXED-TYPE stores - items can have different categories
   - Use individual item categorization based on what item is
   - "Boodschappen": Food items, drinks, snacks
   - "Huishouden": Cleaning supplies, personal care, household items
   - "Gezondheid & Zorg": Medications, health products
   - "Overig": Other items found in supermarkets

2. **Single-Type Stores (all items get same category)**:
   - **Clothing stores (store_type: "clothing")**: ALL items → "Winkels & Kleding"
   - **Electronics stores (store_type: "electronics")**: ALL items → "Winkels & Kleding"
   - **Restaurants (store_type: "restaurant")**: ALL items → "Vrije Tijd & Uitgaan"
   - **Pharmacies (store_type: "pharmacy")**: ALL items → "Gezondheid & Zorg"
   - **Petrol stations (store_type: "petrol_station")**: ALL items → "Verkeer & Vervoer"
   - **Hardware stores (store_type: "hardware")**: ALL items → "Huishouden"

3. **Unknown stores (store_type: "unknown")**: Use individual item categorization or default to "Overig"

AVAILABLE CATEGORIES: "Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"

IMPORTANT: 
- For single-type stores, ALL items should have SAME category (use primary_category)
- For supermarkets, items can have different categories based on what they are
- NEVER use any category names other than 8 listed above
- If uncertain, use "Overig" as default

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

				// Use AI's store type determination
				const storeType = parsedData.store_type || 'unknown';
				const primaryCategory = parsedData.primary_category || 'Overig';
				const isMixedType = isMixedTypeStore(storeType);
				
				console.log(`AI detected store type: ${storeType} (primary category: ${primaryCategory}, mixed: ${isMixedType})`);

				const sanitizedItems = filteredItems.map((item: ReceiptItem) => {
					let category: string;
					
					if (isMixedType) {
						// For mixed-type stores (supermarkets), use AI's individual categorization
						category = validateCategory(item.category);
					} else {
						// For single-type stores, use AI's primary category determination
						category = validateCategory(primaryCategory);
					}

					return {
						name: item.name || null,
						category: category,
						quantity: typeof item.quantity === "number" ? item.quantity : null,
						price: typeof item.price === "number" ? item.price : null,
					};
				});

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
