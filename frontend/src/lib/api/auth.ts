/**
 * Authentication API service
 * Handles login, register, and profile management
 */

import apiClient from './client';
import SHA256 from 'crypto-js/sha256';

const hashPassword = (password: string): string => {
	return SHA256(password).toString();
};

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	name: string;
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

export interface PasswordChangeRequest {
	currentPassword: string;
	newPassword: string;
}

export interface ProfileUpdateRequest {
	username: string;
	email: string;
}

export const authApi = {
	/**
	 * Login user
	 */
	async login(credentials: LoginRequest): Promise<LoginResponse> {
		const hashedCredentials = {
			email: credentials.email,
			password: hashPassword(credentials.password),
		};

		return apiClient.post<LoginResponse>('/api/login', hashedCredentials);
	},

	/**
	 * Register new user
	 */
	async register(userData: RegisterRequest): Promise<LoginResponse> {
		const hashedUserData = {
			name: userData.name,
			email: userData.email,
			password: hashPassword(userData.password),
		};

		return apiClient.post<LoginResponse>('/api/register', hashedUserData);
	},

	/**
	 * Change user password
	 */
	async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
		return apiClient.put('/api/users/password', passwordData);
	},

	/**
	 * Update user profile
	 */
	async updateProfile(profileData: ProfileUpdateRequest): Promise<{ user: { id: number; username: string; email: string } }> {
		return apiClient.put('/api/users/profile', profileData);
	},
};