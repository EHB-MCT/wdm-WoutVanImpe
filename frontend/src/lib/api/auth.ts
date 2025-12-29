import apiClient from "./client";
import SHA256 from "crypto-js/sha256";

/**
 * Generates a SHA256 hash of the provided password string.
 * Used to hash credentials on the client side before transmission.
 * @param {string} password - The plain text password.
 * @returns {string} The hashed password string.
 */
const hashPassword = (password: string): string => {
    return SHA256(password).toString();
};

/**
 * Payload structure for user login requests.
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * API response structure upon successful authentication.
 * Contains the JWT token and user details.
 */
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}

/**
 * Payload structure for new user registration.
 */
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

/**
 * Payload structure for updating the user's password.
 */
export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}

/**
 * Payload structure for updating user profile details.
 */
export interface ProfileUpdateRequest {
    username: string;
    email: string;
}

/**
 * Service for handling user authentication and profile management.
 * Provides methods for login, registration, and user account updates.
 */
export const authApi = {
    /**
     * Authenticates a user with their credentials.
     * Hashes the password client-side before sending the request.
     * @param {LoginRequest} credentials - The email and plain text password.
     * @returns {Promise<LoginResponse>} The authentication token and user info.
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        // Hash password before transmission
        const hashedCredentials = {
            email: credentials.email,
            password: hashPassword(credentials.password),
        };

        return apiClient.post<LoginResponse>("/api/login", hashedCredentials);
    },

    /**
     * Registers a new user account.
     * Hashes the password client-side before sending the request.
     * @param {RegisterRequest} userData - The new user's details.
     * @returns {Promise<LoginResponse>} The authentication response (auto-login).
     */
    async register(userData: RegisterRequest): Promise<LoginResponse> {
        const hashedUserData = {
            username: userData.username,
            email: userData.email,
            password: hashPassword(userData.password),
        };

        return apiClient.post<LoginResponse>("/api/register", hashedUserData);
    },

    /**
     * Updates the authenticated user's password.
     * @param {PasswordChangeRequest} passwordData - The current and new password.
     * @returns {Promise<{ message: string }>} A success message.
     */
    async changePassword(passwordData: PasswordChangeRequest): Promise<{ message: string }> {
        return apiClient.put("/api/users/password", passwordData);
    },

    /**
     * Updates the authenticated user's profile information.
     * @param {ProfileUpdateRequest} profileData - The new username and email.
     * @returns {Promise<{ user: { id: number; username: string; email: string } }>} The updated user object.
     */
    async updateProfile(profileData: ProfileUpdateRequest): Promise<{ user: { id: number; username: string; email: string } }> {
        return apiClient.put("/api/users/profile", profileData);
    },
};