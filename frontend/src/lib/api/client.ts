import { handleTokenRefresh } from "../auth";
import { API_ENDPOINTS } from "../constants";

/**
 * Configuration options for the API Client.
 */
interface ApiClientConfig {
	/** The root URL for the API (e.g., "https://api.example.com"). */
	baseUrl: string;
	/** Request timeout in milliseconds. Defaults to 10000ms. */
	timeout?: number;
}

/**
 * Custom error class for HTTP API errors.
 * Captures the HTTP status code and the raw response object for further inspection.
 */
export class ApiError extends Error {
	public status?: number;
	public response?: Response;
	public httpStatus?: number;

	constructor(message: string, httpStatus?: number, response?: Response) {
		super(message);
		this.httpStatus = httpStatus;
		this.response = response;
		this.name = "ApiError";
	}
}

/**
 * Wrapper around the native Fetch API.
 * * This class creates a centralized point for:
 * 1. Injecting JWT Authentication headers.
 * 2. Enforcing request timeouts using AbortController.
 * 3. Standardizing error parsing and handling 401 Token Refresh logic.
 */
class BaseApiClient {
	private readonly baseUrl: string;
	private readonly timeout: number;

	/**
	 * Initializes the API client.
	 * @param {ApiClientConfig} config - Configuration object containing baseUrl and timeout.
	 */
	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, "");
		this.timeout = config.timeout || 10000;
	}

	/**
	 * Retrieves authentication headers.
	 * Checks LocalStorage for a token and formats the Authorization header.
	 * @returns {Record<string, string>} Headers object containing Content-Type and Authorization (if available).
	 */
	private getAuthHeaders(): Record<string, string> {
		const token = globalThis.localStorage?.getItem("token");
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		return headers;
	}

	/**
	 * Centralized response handler.
	 * Checks for authentication errors, parses JSON, and throws standardized ApiErrors.
	 * @template T - The expected return type of the response data.
	 * @param {Response} response - The raw fetch response.
	 * @returns {Promise<T>} The parsed JSON data.
	 * @throws {ApiError} If the response status is not OK (200-299) or JSON parsing fails.
	 */
	private async handleResponse<T>(response: Response): Promise<T> {
		// Centralized check for 401s to trigger auto-logout/refresh
		handleTokenRefresh(response);

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
			return await response.json();
		} catch {
			throw new ApiError("Invalid JSON response", response.status, response);
		}
	}

	/**
	 * Internal wrapper to execute the fetch call with timeout logic.
	 * Uses AbortController to cancel the request if it exceeds the configured timeout.
	 * @param {string} url - The full URL to fetch.
	 * @param {RequestInit} options - Standard fetch options (method, headers, body).
	 * @returns {Promise<Response>} The raw fetch response.
	 * @throws {ApiError} If the request times out.
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
	 * Performs a GET request.
	 * @template T - The expected response data type.
	 * @param {string} endpoint - The API endpoint (e.g., "/users").
	 * @returns {Promise<T>} The response data.
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
	 * Performs a POST request.
	 * @template T - The expected response data type.
	 * @param {string} endpoint - The API endpoint.
	 * @param {unknown} data - The payload to send in the body.
	 * @returns {Promise<T>} The response data.
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
	 * Performs a PUT request.
	 * @template T - The expected response data type.
	 * @param {string} endpoint - The API endpoint.
	 * @param {unknown} data - The payload to send in the body.
	 * @returns {Promise<T>} The response data.
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
	 * Performs a DELETE request.
	 * @template T - The expected response data type.
	 * @param {string} endpoint - The API endpoint.
	 * @returns {Promise<T>} The response data.
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
	 * Performs a PATCH request.
	 * @template T - The expected response data type.
	 * @param {string} endpoint - The API endpoint.
	 * @param {unknown} data - The payload to send in the body.
	 * @returns {Promise<T>} The response data.
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

export const apiClient = new BaseApiClient({
	baseUrl: API_ENDPOINTS.BASE_URL,
	timeout: 10000,
});

export default apiClient;
