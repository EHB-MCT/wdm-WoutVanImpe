import apiClient from "./client";

/**
 * Interface defining the structure of an expense category.
 */
export interface Category {
	id: number;
	name: string;
}

/**
 * Service for managing expense categories.
 * Provides methods to fetch category reference data used throughout the application.
 */
export const categoriesApi = {
	/**
	 * Retrieves all available expense categories from the backend.
	 * Used for populating form dropdowns and classification lists.
	 * @returns {Promise<Category[]>} A promise resolving to an array of category objects.
	 */
	async getAll(): Promise<Category[]> {
		return apiClient.get<Category[]>("/api/categories");
	},
};
