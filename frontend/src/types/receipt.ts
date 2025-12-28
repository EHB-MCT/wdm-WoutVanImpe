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
