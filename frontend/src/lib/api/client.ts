/**
 * API Client Configuration and Base Client
 * Centralized API communication for the Finance Tracker application
 */

interface ApiClientConfig {
	baseUrl: string;
	timeout?: number;
}

// Remove unused interface

export class ApiError extends Error {
	constructor(message: string, public status?: number, public response?: Response) {
		super(message);
		this.name = "ApiError";
	}
}

class BaseApiClient {
	private readonly baseUrl: string;
	private readonly timeout: number;

	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
		this.timeout = config.timeout || 10000;
	}

	/**
	 * Get authentication headers
	 */
	private getAuthHeaders(): Record<string, string> {
		const token = localStorage.getItem("token");
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return headers;
	}

	/**
	 * Handle API response and errors
	 */
	private async handleResponse<T>(response: Response): Promise<T> {
		// Handle automatic token refresh if needed
		this.handleTokenRefresh(response);

		if (!response.ok) {
			let errorMessage = "API request failed";

			try {
				const errorData = await response.json();
				errorMessage = errorData.error || errorData.message || errorMessage;
			} catch {
				errorMessage = `HTTP ${response.status}: ${response.statusText}`;
			}

			throw new ApiError(errorMessage, response.status, response);
		}

		try {
			const data = await response.json();
			return data;
		} catch {
			throw new ApiError("Invalid JSON response", response.status, response);
		}
	}

	/**
	 * Handle automatic token refresh from API responses
	 */
	private handleTokenRefresh(response: Response): void {
		// Check for custom headers indicating token refresh
		const newToken = response.headers.get("X-New-Token");
		const refreshToken = response.headers.get("X-Refresh-Token");

		if (newToken) {
			localStorage.setItem("token", newToken);
		}

		if (refreshToken) {
			localStorage.setItem("refreshToken", refreshToken);
		}
	}

	/**
	 * Make HTTP request with timeout
	 */
	private async makeRequest(url: string, options: RequestInit): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw new ApiError("Request timeout");
			}
			throw error;
		}
	}

	/**
	 * GET request
	 */
	async get<T>(endpoint: string): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "GET",
			headers: this.getAuthHeaders(),
		});

		return this.handleResponse<T>(response);
	}

	/**
	 * POST request
	 */
	async post<T>(endpoint: string, data: unknown): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "POST",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(data),
		});

		return this.handleResponse<T>(response);
	}

	/**
	 * PUT request
	 */
	async put<T>(endpoint: string, data: unknown): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "PUT",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(data),
		});

		return this.handleResponse<T>(response);
	}

	/**
	 * DELETE request
	 */
	async delete<T>(endpoint: string): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "DELETE",
			headers: this.getAuthHeaders(),
		});

		return this.handleResponse<T>(response);
	}

	/**
	 * PATCH request
	 */
	async patch<T>(endpoint: string, data: unknown): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "PATCH",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(data),
		});

		return this.handleResponse<T>(response);
	}
}

// Create and export the default API client instance
export const apiClient = new BaseApiClient({
	baseUrl: `http://localhost:${process.env.NEXT_PUBLIC_API_PORT}`,
	timeout: 10000,
});

export default apiClient;
