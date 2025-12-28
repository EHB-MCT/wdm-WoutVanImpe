export const VALID_CATEGORIES = ["Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"] as const;

export const VALID_CATEGORIES_SET = new Set(VALID_CATEGORIES as readonly string[]);

export type ValidCategory = (typeof VALID_CATEGORIES)[number];

export const CATEGORY_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"] as const;

export const API_ENDPOINTS = {
	BASE_URL: `http://localhost:${process.env.NEXT_PUBLIC_API_PORT}`,
	RECEIPTS: "/api/receipts",
	CATEGORIES: "/api/categories",
	USERS_PROFILE: "/api/users/profile",
	USERS_PASSWORD: "/api/users/password",
	LOGIN: "/api/login",
	REGISTER: "/api/register",
} as const;

export const VALIDATION = {
	PASSWORD_MIN_LENGTH: 6,
	AUTO_DISMISS_MESSAGE_MS: 3000,
	TOKEN_REFRESH_BUFFER_MS: 900000, // 15 minutes
	LOGOUT_REDIRECT_DELAY_MS: 1500,
	PASSWORD_CHANGE_SUCCESS_DELAY_MS: 3000,
	MIN_PRICE: 0,
	MIN_QUANTITY: 1,
} as const;

export const DATE_FORMATS = {
	DUTCH_DATE_ONLY: "nl-BE",
	DISPLAY_DATE: "DD-MM-YYYY",
	API_DATE: "YYYY-MM-DD",
	DISPLAY_TIME: "HH:MM",
} as const;

export const DEFAULTS = {
	QUANTITY: 1,
	CATEGORY: "Overig",
	DATE_TIME: "12:00:00",
} as const;

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
	AUTH_REDIRECT_MESSAGE: "User not authenticated, redirecting to login page",
	RECEIPT_UPDATE_ERROR: "Er is een fout opgetreden bij het opslaan",
	RECEIPT_DELETE_ERROR: "Er is een fout opgetreden bij het verwijderen",
} as const;

export const SUCCESS_MESSAGES = {
	RECEIPT_SAVED: "Bon succesvol opgeslagen!",
	PROFILE_UPDATED: "Profiel succesvol bijgewerkt!",
	PASSWORD_CHANGED: "Wachtwoord succesvol gewijzigd!",
	LOGGED_OUT: "Succesvol uitgelogd!",
} as const;

export const TIME_FORMATS = {
	DISPLAY: "HH:MM",
	DEFAULT_TIME: "12:00",
	SUBSTRING_LENGTH: 5,
} as const;

export const ID_GENERATION = {
	TEMP_PREFIX: "temp-",
} as const;

export const CONFIRMATION_MESSAGES = {
	DELETE_RECEIPT: "Weet je zeker dat je dit ticket wilt verwijderen?",
} as const;

export const NAVIGATION = {
	MAIN_LINKS: [
		{ href: "/", label: "Home", icon: "🏠" },
		{ href: "/upload", label: "Upload", icon: "📤" },
		{ href: "/dashboard", label: "Dashboard", icon: "📊" },
		{ href: "/account", label: "Account", icon: "👤" },
	] as const,
	BRAND: {
		ICON: "💰",
		DEFAULT_TEXT: "FinanceTracker",
	},
	MOBILE: {
		TOGGLE_OPEN: "☰",
		TOGGLE_CLOSE: "✕",
	},
} as const;
