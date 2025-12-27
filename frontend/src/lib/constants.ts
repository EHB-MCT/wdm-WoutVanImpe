/**
 * Shared constants for the finance tracker application
 * Centralized configuration to avoid duplication across components
 */

// Valid categories for receipts
export const VALID_CATEGORIES = ["Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"] as const;

// Category color scheme for charts (uses CSS variables)
export const CATEGORY_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"] as const;

// API endpoints
export const API_ENDPOINTS = {
	BASE_URL: "http://localhost:5001",
	RECEIPTS: "/api/receipts",
	CATEGORIES: "/api/categories",
	USERS_PROFILE: "/api/users/profile",
	USERS_PASSWORD: "/api/users/password",
	LOGIN: "/api/login",
	REGISTER: "/api/register",
} as const;

// Validation constants
export const VALIDATION = {
	PASSWORD_MIN_LENGTH: 6,
	AUTO_DISMISS_MESSAGE_MS: 3000,
	TOKEN_REFRESH_BUFFER_MS: 900000, // 15 minutes
	MIN_PRICE: 0,
	MIN_QUANTITY: 1,
} as const;

// Date format constants
export const DATE_FORMATS = {
	DUTCH_DATE_ONLY: "nl-BE",
	DISPLAY_DATE: "DD-MM-YYYY",
	API_DATE: "YYYY-MM-DD",
	DISPLAY_TIME: "HH:MM",
} as const;

// Default values
export const DEFAULTS = {
	QUANTITY: 1,
	CATEGORY: "Overig",
	DATE_TIME: "12:00:00",
} as const;

// Error messages in Dutch
export const ERROR_MESSAGES = {
	REQUIRED_FIELD: "Dit veld is verplicht",
	INVALID_EMAIL: "Voer een geldig emailadres in",
	PASSWORD_TOO_SHORT: `Wachtwoord moet minimaal ${VALIDATION.PASSWORD_MIN_LENGTH} tekens zijn`,
	INVALID_PRICE: "Prijs moet groter zijn dan 0",
	INVALID_QUANTITY: "Aantal moet groter zijn dan 0",
	FUTURE_DATE: "Datum mag niet in de toekomst liggen",
	ITEM_NAME_REQUIRED: "Product naam is verplicht",
	NOT_AUTHENTICATED: "Je moet ingelogd zijn om deze actie uit te voeren",
	NETWORK_ERROR: "Netwerkfout, probeer opnieuw",
	GENERIC_ERROR: "Er is een onverwachte fout opgetreden",
} as const;

// Success messages in Dutch
export const SUCCESS_MESSAGES = {
	RECEIPT_SAVED: "Bon succesvol opgeslagen!",
	PROFILE_UPDATED: "Profiel succesvol bijgewerkt!",
	PASSWORD_CHANGED: "Wachtwoord succesvol gewijzigd!",
	LOGGED_OUT: "Succesvol uitgelogd!",
} as const;
