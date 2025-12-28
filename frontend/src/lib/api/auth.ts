import apiClient from "./client";
import SHA256 from "crypto-js/sha256";

// Simple client-side hashing wrapper
const hashPassword = (password: string): string => {
	return SHA256(password).toString();
};

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: {
		id: number;
		username: string;
		email: string;
	};
}

export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
}

export interface PasswordChangeRequest {
	currentPassword: string;
	newPassword: string;
}

export interface ProfileUpdateRequest {
	username: string;
	email: string;
}

/**
 * Service for handling user authentication and profile management.
 */
export const authApi = {
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		// Hash password before transmission
		const hashedCredentials = {
			email: credentials.email,
			password: hashPassword(credentials.password),
		};

		return apiClient.post<LoginResponse>("/api/login", hashedCredentials);
	},

	async register(userData: RegisterRequest): Promise<LoginResponse> {
		const hashedUserData = {
			username: userData.username,
			email: userData.email,
			password: hashPassword(userData.password),
		};

		return apiClient.post<LoginResponse>("/api/register", hashedUserData);
	},

	async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
		return apiClient.put("/api/users/password", passwordData);
	},

	async updateProfile(profileData: ProfileUpdateRequest): Promise<{ user: { id: number; username: string; email: string } }> {
		return apiClient.put("/api/users/profile", profileData);
	},
};
