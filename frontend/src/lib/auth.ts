export interface User {
	id: number;
	username: string;
	email: string;
	role?: string;
}

interface JwtPayload {
	userId: number;
	username: string;
	role?: string;
	iat: number;
	exp: number;
}

/**
 * Validates token structure and expiration.
 * Note: This is a frontend-only check for UI states; actual security verification happens on the backend.
 */
export const isValidToken = (token: string): boolean => {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return false;
		}

		const payload = parts[1];
		const decodedPayload = JSON.parse(atob(payload));

		const currentTime = Math.floor(Date.now() / 1000);
		return decodedPayload.exp > currentTime;
	} catch (error) {
		console.error("Error validating token:", error instanceof Error ? error.message : String(error));
		return false;
	}
};

export const getTokenExpiration = (token: string): Date | null => {
	try {
		const parts = token.split(".");
		if (parts.length !== 3) {
			return null;
		}

		const payload = parts[1];
		const decodedPayload: JwtPayload = JSON.parse(atob(payload));
		return new Date(decodedPayload.exp * 1000);
	} catch (error) {
		console.error("Error getting token expiration:", error instanceof Error ? error.message : String(error));
		return null;
	}
};

const clearStorage = (key: string): void => {
	if (globalThis.window === undefined) return;

	try {
		localStorage.removeItem(key);
		sessionStorage.removeItem(key);
	} catch (error) {
		console.error(`Error removing ${key} from storage:`, error instanceof Error ? error.message : String(error));
	}
};

const getFromStorage = (key: string): string | null => {
	if (globalThis.window === undefined) return null;

	try {
		return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
	} catch (error) {
		console.error(`Error accessing ${key} from storage:`, error instanceof Error ? error.message : String(error));
		return null;
	}
};

export const logout = (): void => {
	console.log("Logging out user, removing authentication data");
	clearStorage("token");
	clearStorage("user");
	clearStorage("stayLoggedIn");
};

export const removeExpiredTokens = (): void => {
	const token = getFromStorage("token");

	if (token && !isValidToken(token)) {
		console.log("Token expired, removing authentication data");
		logout();
	}
};

export const getTokenInfo = (): { isValid: boolean; expiresIn: number | null; isExpired: boolean } => {
	const token = getFromStorage("token");
	if (!token) {
		return { isValid: false, expiresIn: null, isExpired: false };
	}

	const expirationDate = getTokenExpiration(token);
	if (!expirationDate) {
		return { isValid: false, expiresIn: null, isExpired: true };
	}

	const now = new Date();
	const expiresIn = expirationDate.getTime() - now.getTime();
	const isExpired = expiresIn <= 0;

	return {
		isValid: !isExpired,
		expiresIn: isExpired ? null : Math.floor(expiresIn / 1000 / 60), // minutes
		isExpired,
	};
};

export const handleTokenRefresh = (response: Response): boolean => {
	if (globalThis.window === undefined) return true;

	try {
		const newToken = response.headers.get("X-New-Token");
		const tokenRefresh = response.headers.get("X-Token-Refresh");

		if (newToken && tokenRefresh === "true") {
			try {
				localStorage.setItem("token", newToken);
				console.log("Token refreshed successfully");
				return true;
			} catch (storageError) {
				console.error("Failed to store token in localStorage:", storageError instanceof Error ? storageError.message : String(storageError));

				// Fallback to session storage if local storage fails (e.g., Safari private mode)
				try {
					sessionStorage.setItem("token", newToken);
					console.log("Token stored in sessionStorage as fallback");
					return true;
				} catch (sessionError) {
					console.error("Failed to store token in sessionStorage:", sessionError instanceof Error ? sessionError.message : String(sessionError));
					return false;
				}
			}
		}

		return true;
	} catch (error) {
		console.error("Error handling token refresh:", error instanceof Error ? error.message : String(error));
		return false;
	}
};

export const isUserAuthenticated = (): boolean => {
	removeExpiredTokens();
	const token = getFromStorage("token");
	return !!token && isValidToken(token);
};

export const getStoredUser = (): User | null => {
	if (isUserAuthenticated()) {
		const storedUser = getFromStorage("user");
		if (storedUser) {
			try {
				return JSON.parse(storedUser);
			} catch (parseError) {
				console.error("Error parsing stored user data:", parseError instanceof Error ? parseError.message : String(parseError));
				return null;
			}
		}
	}
	return null;
};
