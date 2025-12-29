import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { filterNonProductItems } from "./itemFilter";
import { VALID_CATEGORIES_SET } from "./constants";

/**
 * Checks if a store type typically sells a wide variety of items (e.g., supermarkets).
 * Used to determine if items should be categorized individually or grouped by store type.
 * @param {string} storeType - The type of store detected by AI.
 * @returns {boolean} True if the store is a mixed-type retailer.
 */
const isMixedTypeStore = (storeType: string): boolean => {
	return storeType === "supermarket";
};

/**
 * Validates a category string against the allowed list of categories.
 * Defaults to "Overig" (Other) if the category is invalid or null.
 * @param {string | null} category - The category to validate.
 * @returns {string} A valid category string.
 */
const validateCategory = (category: string | null): string => {
	if (!category) return "Overig";

	if (VALID_CATEGORIES_SET.has(category)) {
		return category;
	}

	console.warn(`Invalid category "${category}" detected, defaulting to "Overig"`);
	return "Overig";
};

/**
 * Perform basic heuristic analysis when AI fails to extract detailed metadata.
 * Uses Regex patterns and time logic to fill in gaps for "dangerous" metadata
 * (e.g., card info, time categories, wealth ratings).
 * @param {any} parsedData - The JSON data partially parsed by the AI.
 * @param {string} ocrText - The raw OCR text for Regex scanning.
 * @returns {Object} The constructed metadata object.
 */
const performBasicAnalysis = (parsedData: any, ocrText: string) => {
	const dangerousMetadata: any = {
		card_fingerprint: null,
		card_network: null,
		bank_name: null,
		wealth_rating: null,
		health_score: null,
		sin_score: null,
		urgency_score: null,
		store_location: null,
		geographic_pattern: null,
		time_category: null,
		ai_flag: null,
	};

	// Extract basic time category from parsed time
	if (parsedData.time) {
		const hour = Number.parseInt(parsedData.time.split(":")[0]);
		if (hour >= 6 && hour < 12) dangerousMetadata.time_category = "Morning";
		else if (hour >= 12 && hour < 18) dangerousMetadata.time_category = "Lunch";
		else if (hour >= 18 && hour < 22) dangerousMetadata.time_category = "Evening";
		else dangerousMetadata.time_category = "Night";

		// Higher urgency for late night
		if (hour >= 22 || hour < 6) {
			dangerousMetadata.urgency_score = 8;
		}
	}

	// Basic wealth rating based on store name
	if (parsedData.store_name) {
		const storeName = parsedData.store_name.toLowerCase();
		if (storeName.includes("aldi") || storeName.includes("lidl") || storeName.includes("action")) {
			dangerousMetadata.wealth_rating = 3;
		} else if (storeName.includes("carrefour") || storeName.includes("delhaize") || storeName.includes("colruyt")) {
			dangerousMetadata.wealth_rating = 6;
		} else if (storeName.includes("iphone") || storeName.includes("media") || storeName.includes("coolblue")) {
			dangerousMetadata.wealth_rating = 8;
		}
	}

	// Basic payment analysis from OCR text
	const lowerOcrText = ocrText.toLowerCase();
	if (lowerOcrText.includes("visa")) dangerousMetadata.card_network = "Visa";
	else if (lowerOcrText.includes("mastercard")) dangerousMetadata.card_network = "Mastercard";
	else if (lowerOcrText.includes("bancontact")) dangerousMetadata.card_network = "Bancontact";
	else if (lowerOcrText.includes("cash") || lowerOcrText.includes("contant")) dangerousMetadata.card_network = "Cash";

	// Extract card fingerprint (last 4 digits pattern)
	const cardPattern = /\*\*\*\*(\d{4})|(\d{4})(?=\s|$)/g;
	const matches = [...lowerOcrText.matchAll(cardPattern)];
	if (matches.length > 0) {
		dangerousMetadata.card_fingerprint = matches[0][1] || matches[0][2];
	}

	return dangerousMetadata;
};

/**
 * Orchestrates the AI extraction pipeline.
 * 1. Sends raw OCR text to a local LLM (Ollama) with a strict system prompt.
 * 2. Parses the returned JSON structure.
 * 3. Sanitizes line items (removing noise like "Total", "VAT").
 * 4. Applies categorization logic based on store type.
 * 5. Applies fallback heuristics if AI misses metadata.
 *
 * @param {string} ocrText - The raw text extracted from the image via Tesseract.
 * @returns {Promise<ReceiptData | null | undefined>} The structured receipt data or null on failure.
 */
export const extractReceiptData = async (ocrText: string): Promise<ReceiptData | null | undefined> => {
	try {
		const prompt = `You are a strict JSON API. 
Goal: Extract receipt data from OCR text into structured JSON.
Output: VALID JSON ONLY. No markdown, no commentary.

OCR INPUT:
"""
${ocrText}
"""

CORE INSTRUCTIONS:
1. **Extraction:** Extract EVERY line item with a price. Keep names in original language (NL/FR/EN). Exclude totals (Total/VAT/BTW).
2. **Formatting (STRICT):**
   - number: Must be a valid number, no letters or math expressions.
   - Date: Must be "yyyy/mm/dd" (e.g., 2025/12/25).
   - Time: Must be "hh:mm" (e.g., 14:30).
3. **Store Logic (Categorization):**
   - Identify 'store_type'.
   - If 'store_type' is "supermarket": Categorize items individually based on the product.
   - If 'store_type' is NOT "supermarket" (e.g., clothing, pharmacy, petrol): Force ALL items to the store's primary category.
4. **Profiling (Dangerous Metadata):**
   - **Time:** Convert to NL category (06-12: Ochtend, 12-18: Middag, 18-22: Avond, 22-06: Nacht).
   - **Wealth:** Rate 1 (Discount/Aldi) to 10 (Luxury).
   - **Scores:** Calculate Health/Sin/Urgency scores (0-100 or 1-10) based on item contents (alcohol, junk food, bio, etc.).
   - **Payment:** Extract last 4 digits (fingerprint) and network (Visa/Bancontact).

REQUIRED JSON STRUCTURE:
{
  "store_name": "string or null",
  "date": "yyyy/mm/dd or null",
  "time": "hh:mm or null",
  "total_price": number or null,
  "payment_method": "string or null",
  "items": [
    {
      "name": "string",
      "category": "string (Boodschappen|Huishouden|Verkeer & Vervoer|Gezondheid & Zorg|Vrije Tijd & Uitgaan|Winkels & Kleding|Financieel & Diensten|Overig)",
      "quantity": number,
      "price": number
    }
  ],
  "dangerous_metadata": {
    "card_fingerprint": "string (last 4 digits) or null",
    "card_network": "string or null",
    "bank_name": "string or null",
    "wealth_rating": number (1-10) or null,
    "health_score": number (0-100) or null,
    "sin_score": number (0-100) or null,
    "urgency_score": number (1-10) or null,
    "store_location": "string or null",
    "geographic_pattern": "string (Stedelijk/Buitenwijk/etc) or null",
    "time_category": "string (Ochtend/Middag/Avond/Nacht) or null",
    "ai_flag": "string or null"
  }
}`;

		const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_OLLAMA_PORT}/api/generate`, {
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

		try {
			const parsedData = JSON.parse(data.response);

			if (parsedData && typeof parsedData === "object") {
				const rawItems = Array.isArray(parsedData.items) ? parsedData.items : [];

				const filteredItems = filterNonProductItems(rawItems);

				// Use AI's store type determination to guide heuristic categorization
				const storeType = parsedData.store_type || "unknown";
				const primaryCategory = parsedData.primary_category || "Overig";
				const isMixedType = isMixedTypeStore(storeType);

				const sanitizedItems = filteredItems.map((item: ReceiptItem, index: number) => {
					let category: string;

					if (isMixedType) {
						// Supermarkets have diverse items; rely on AI's per-item category
						category = validateCategory(item.category);
					} else {
						// Specialized stores (e.g., Pharmacy) force a single category for all items
						category = validateCategory(primaryCategory);
					}

					return {
						id: index + 1,
						name: item.name || null,
						category: category,
						quantity: typeof item.quantity === "number" ? item.quantity : null,
						price: typeof item.price === "number" ? item.price : null,
					};
				});

				// Use AI dangerous metadata or perform basic analysis
				let dangerousMetadata = parsedData.dangerous_metadata;

				if (!dangerousMetadata || Object.values(dangerousMetadata).every((v) => v === null)) {
					console.log("AI didn't extract dangerous metadata, performing basic analysis...");
					dangerousMetadata = performBasicAnalysis(parsedData, ocrText);
				}

				return {
					store_name: parsedData.store_name || null,
					date: parsedData.date || null,
					time: parsedData.time || null,
					total_price: typeof parsedData.total_price === "number" ? parsedData.total_price : null,
					payment_method: parsedData.payment_method || null,
					raw_ocr_text: null,
					items: sanitizedItems,
					dangerous_metadata: dangerousMetadata,
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

/**
 * Sends an image file to the Tesseract service for OCR processing.
 * @param {File} file - The image file to process.
 * @returns {Promise<string>} The extracted text from the image.
 */
export const processOCR = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("image", file);

	const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_TESSERACT_PORT}/OCR`, {
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
