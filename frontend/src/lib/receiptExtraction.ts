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
		const prompt = `Extract receipt data from following OCR text and return ONLY a JSON object. No explanations, no markdown formatting, no conversational text.

 OCR Text:
 """
 ${ocrText}
 """

IMPORTANT LANGUAGE CONTEXT:
  - The OCR text may be in Dutch, English, or French
  - Product names and store names can appear in any of these languages
  - Extract product names exactly as they appear in original language
  - Handle multilingual receipts - items may be in different languages on same receipt
  - Common terms to recognize:
     * Dutch: "TOTAAL", "SUBTOTAAL", "BTW", "KORTING"
     * English: "TOTAL", "SUBTOTAL", "VAT", "TAX", "DISCOUNT"
     * French: "TOTAL", "SOUS-TOTAL", "TVA", "REMISE"

 DANGEROUS DATA EXTRACTION (CRITICAL FOR PROFILING):
  - Extract ANY payment information: last 4 digits of cards, bank names, payment networks
  - Analyze purchase time for behavioral insights (late night = stress/urgency, etc.)
  - Extract health indicators: alcohol, tobacco, junk food, medicine, supplements
  - Look for wealth indicators: luxury brands vs discount stores, organic vs conventional
  - Identify geographic patterns if location is mentioned
  - Flag suspicious patterns: multiple payment methods, unusual timing

 CRITICAL: Look VERY CAREFULLY for these specific patterns:
 1. Payment cards: Look for "****", "Visa", "Mastercard", "Bancontact", last 4 digits
 2. Time analysis: Look for actual time and convert to DUTCH time category (Ochtend: 6-12, Middag: 12-18, Avond: 18-22, Nacht: 22-6)
 3. Sin items: Look for alcohol (beer, wine, whiskey), tobacco, cigarettes, drugs
 4. Wealth indicators: Expensive stores vs discount stores, luxury brands
 5. Geographic: City names, neighborhood types

 Return JSON with this exact structure:
 {
   "store_name": null,
   "date": null,
   "time": null,
   "total_price": null,
   "payment_method": null,
   "items": [],
   "dangerous_metadata": {
     "card_fingerprint": null,
     "card_network": null,
     "bank_name": null,
     "wealth_rating": null,
     "health_score": null,
     "sin_score": null,
     "urgency_score": null,
     "store_location": null,
     "geographic_pattern": null,
     "time_category": null,
     "ai_flag": null
   }
 }

 DANGEROUS METADATA FIELDS (USE REAL VALUES WHEN FOUND):
  - card_fingerprint: Extract last 4 digits of any credit/debit card visible
  - card_network: "Visa", "Mastercard", "Bancontact", "Cash", "Phone" 
  - bank_name: Look for bank names like "ING", "KBC", "Belfius"
  - wealth_rating: 1-10 scale (discount store = 1-3, supermarket = 4-7, luxury = 8-10)
  - health_score: 0-100 (high for healthy food, low for junk food)
  - sin_score: 0-100 (higher for more alcohol/tobacco/junk food)
  - urgency_score: 1-10 (higher for late night purchases, rushed buying)
  - store_location: Extract any city or location mentioned
  - geographic_pattern: "Stedelijk", "Buitenwijk", "Landelijk", "Winkelcentrum", "Expatwijk"
  - time_category: "Ochtend", "Middag", "Avond", "Nacht" based on actual time
  - ai_flag: "Alcohol Risico", "Grote Uitgaven", "Meerdere Kaarten", "Ongewone Uren", "Gezonde Koper", "Junkfood", "Familiemaaltijd", "Zoetekauw", "Luxe Levensstijl"

 INTERNAL USE ONLY (not returned in JSON):
 - Also determine store_type and primary_category for your internal categorization logic
 - store_type: "supermarket", "clothing", "electronics", "restaurant", "pharmacy", "petrol_station", "hardware", "unknown"
 - primary_category: "Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"

 Rules:
 - store_name: Shop name (string or null) - keep original language
 - date: YYYY-MM-DD format (string or null)
 - time: HH:MM 24h format (string or null)
 - total_price: Final amount paid (number or null)
 - payment_method: "Cash", "Visa", "Bancontact", "Credit Card", "Contant", etc. (string or null)
 - items: Array of objects with name, category, quantity, price (default quantity to 1 if not specified)
 - CRITICAL: Extract EVERY single line item that could possibly be a product, even if you're unsure. If it has a name and price, treat it as a product. Be maximally inclusive - when in doubt, include it.
 - Include all food items, drinks, household products, clothing, electronics, services, fees, taxes, and any other line items with names and prices.
 - BUT filter out: "TOTAAL", "TOTAL", "SOUS-TOTAL", "SUBTOTAAL", "SUBTOTAL", "BTW", "VAT", "TVA", "TAX", "KORTING", "DISCOUNT", "REMISE", and any line items that are just numbers, codes, or payment method descriptions.

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
 - Use store_type and primary_category you determined above for categorization

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

 IMPORTANT: Return ONLY raw JSON object. Nothing else.`;

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
			console.log("Ollama raw response:", data.response);
			const parsedData = JSON.parse(data.response);
			console.log("Parsed data structure:", JSON.stringify(parsedData, null, 2));
			console.log("Dangerous metadata found:", parsedData.dangerous_metadata);

			if (parsedData && typeof parsedData === "object") {
				const rawItems = Array.isArray(parsedData.items) ? parsedData.items : [];

				const filteredItems = filterNonProductItems(rawItems);

				// Use AI's store type determination to guide heuristic categorization
				const storeType = parsedData.store_type || "unknown";
				const primaryCategory = parsedData.primary_category || "Overig";
				const isMixedType = isMixedTypeStore(storeType);

				console.log(`AI detected store type: ${storeType} (primary category: ${primaryCategory}, mixed: ${isMixedType})`);

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
