import apiClient from "./client";

export interface Category {
	id: number;
	name: string;
}

/**
 * Service for managing expense categories.
 */
export const categoriesApi = {
	async getAll(): Promise<Category[]> {
		return apiClient.get<Category[]>("/api/categories");
	},
};
