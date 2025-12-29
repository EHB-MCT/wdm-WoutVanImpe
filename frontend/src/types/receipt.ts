/**
 * Represents a single receipt item with product details.
 * Used for displaying and manipulating individual line items from receipts.
 */
export interface ReceiptItem {
	/** Unique identifier for the receipt item */
	id: number;
	/** Product name extracted from receipt, null if not specified */
	name: string | null;
	/** Category assigned to the item, null if not categorized */
	category: string | null;
	/** Quantity of the product, null if not specified */
	quantity: number | null;
	/** Price of the item per unit, null if not specified */
	price: number | null;
}

/**
 * Represents dangerous metadata extracted from receipts for user profiling.
 * Contains sensitive behavioral and financial indicators.
 */
export interface DangerousMetadata {
	/** Last 4 digits of payment card for tracking */
	card_fingerprint: string | null;
	/** Payment card network (Visa, Mastercard, etc.) */
	card_network: string | null;
	/** Bank name if visible on receipt */
	bank_name: string | null;
	/** Wealth rating 1-10 based on store patterns */
	wealth_rating: number | null;
	/** Health score 0-100 based on purchases */
	health_score: number | null;
	/** Sin score 0-100 for alcohol/tobacco/junk food */
	sin_score: number | null;
	/** Urgency score 1-10 based on timing context */
	urgency_score: number | null;
	/** Store location if mentioned */
	store_location: string | null;
	/** Geographic pattern analysis */
	geographic_pattern: string | null;
	/** Time category (Morning, Lunch, Evening, Night_Owl) */
	time_category: string | null;
	/** AI-generated risk flag */
	ai_flag: string | null;
}

/**
 * Represents extracted receipt data from OCR and AI processing.
 * Contains structured information ready for user validation and database storage.
 */
export interface ReceiptData {
	/** Store name where purchase was made, null if not detected */
	store_name: string | null;
	/** Purchase date in YYYY-MM-DD format, null if not detected */
	date: string | null;
	/** Purchase time in HH:MM 24-hour format, null if not detected */
	time: string | null;
	/** Total amount paid for the receipt, null if not detected */
	total_price: number | null;
	/** Payment method used (Cash, Visa, etc.), null if not detected */
	payment_method: string | null;
	/** Raw OCR text extracted from receipt image, null if from AI only */
	raw_ocr_text: string | null;
	/** List of individual receipt items with product details */
	items: ReceiptItem[];
	/** Dangerous metadata for user profiling */
	dangerous_metadata: DangerousMetadata;
}

/**
 * Represents a user account in the system.
 * Contains user profile information and authentication details.
 */
export interface User {
	/** Unique user identifier in database */
	id: number;
	/** User's chosen display name */
	username: string;
	/** User's email address for login and notifications */
	email: string;
}

/**
 * Represents a complete receipt stored in the database.
 * Contains validated receipt data with database-specific fields.
 */
export interface Receipt {
	/** Unique receipt identifier in database */
	id: number;
	/** Final total amount paid for the receipt */
	total_amount: number;
	/** Purchase date in YYYY-MM-DD format from database */
	purchase_date: string;
	/** Optional purchase time in HH:MM format */
	purchase_time?: string;
	/** Store name where purchase was made */
	store_name: string;
	/** Payment method used for the purchase */
	payment_method: string;
	/** Raw OCR text stored for reference and debugging */
	raw_ocr_text: string;
	/** List of receipt items with complete product details */
	items: ReceiptItem[];
}

/**
 * Represents spending data for a specific category.
 * Used for financial analysis and chart visualization.
 */
export interface CategorySpending {
	/** Category name for the spending data */
	name: string;
	/** Total amount spent in this category */
	value: number;
	/** Index signature for additional properties if needed */
	[key: string]: string | number;
}
