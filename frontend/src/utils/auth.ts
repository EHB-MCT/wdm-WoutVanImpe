interface User {
	id: number;
	username: string;
	email: string;
}

interface JwtPayload {
	userId: number;
	username: string;
	iat: number;
	exp: number;
}

export const isValidToken = (token: string): boolean => {
	try {
		// Decode JWT token (without verification - frontend check only)
		const payload = token.split('.')[1];
		const decodedPayload = JSON.parse(atob(payload));
		
		// Check if token is expired
		const currentTime = Math.floor(Date.now() / 1000);
		return decodedPayload.exp > currentTime;
	} catch (error) {
		console.error('Error validating token:', error);
		return false;
	}
};

export const getTokenExpiration = (token: string): Date | null => {
	try {
		const payload = token.split('.')[1];
		const decodedPayload: JwtPayload = JSON.parse(atob(payload));
		return new Date(decodedPayload.exp * 1000);
	} catch (error) {
		console.error('Error getting token expiration:', error);
		return null;
	}
};

export const removeExpiredTokens = (): void => {
	const token = localStorage.getItem('token');
	
	if (token) {
		if (!isValidToken(token)) {
			console.log('Token expired, removing authentication data');
			logout();
		}
	}
};

export const isUserAuthenticated = (): boolean => {
	removeExpiredTokens(); // Clean up expired tokens first
	const token = localStorage.getItem('token');
	return !!token && isValidToken(token);
};

export const getStoredUser = (): User | null => {
	if (isUserAuthenticated()) {
		const storedUser = localStorage.getItem('user');
		return storedUser ? JSON.parse(storedUser) : null;
	}
	return null;
};

export const logout = (): void => {
	console.log('Logging out user, removing authentication data');
	localStorage.removeItem('token');
	localStorage.removeItem('user');
	localStorage.removeItem('stayLoggedIn');
};

export const getTokenInfo = (): { isValid: boolean; expiresIn: number | null; isExpired: boolean } => {
	const token = localStorage.getItem('token');
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
	const isValid = !isExpired;

	return {
		isValid,
		expiresIn: isExpired ? null : Math.floor(expiresIn / 1000 / 60), // in minutes
		isExpired
	};
};