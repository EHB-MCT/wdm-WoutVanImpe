import { handleTokenRefresh } from "../auth";
import { API_ENDPOINTS } from "../constants";

interface ApiClientConfig {
	baseUrl: string;
	timeout?: number;
}

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
 * Wrapper around the Fetch API.
 * Handles JWT injection, timeout logic, and standardized error parsing.
 */
class BaseApiClient {
	private readonly baseUrl: string;
	private readonly timeout: number;

	constructor(config: ApiClientConfig) {
		this.baseUrl = config.baseUrl.replace(/\/$/, "");
		this.timeout = config.timeout || 10000;
	}

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

	async get<T>(endpoint: string): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "GET",
			headers: this.getAuthHeaders(),
		});

		return this.handleResponse<T>(response);
	}

	async post<T>(endpoint: string, data: unknown): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "POST",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(data),
		});

		return this.handleResponse<T>(response);
	}

	async put<T>(endpoint: string, data: unknown): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "PUT",
			headers: this.getAuthHeaders(),
			body: JSON.stringify(data),
		});

		return this.handleResponse<T>(response);
	}

	async delete<T>(endpoint: string): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const response = await this.makeRequest(url, {
			method: "DELETE",
			headers: this.getAuthHeaders(),
		});

		return this.handleResponse<T>(response);
	}

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
