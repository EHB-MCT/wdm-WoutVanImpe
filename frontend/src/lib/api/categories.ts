/**
 * Categories API service
 * Handles category management
 */

import apiClient from './client';

export interface Category {
	id: number;
	name: string;
}

export const categoriesApi = {
	/**
	 * Get all available categories
	 */
	async getAll(): Promise<Category[]> {
		return apiClient.get<Category[]>('/api/categories');
	},
};