/**
 * Utility functions for common operations across the application
 * Centralized to avoid code duplication and maintain consistency
 */

import { ID_GENERATION } from "./constants";

/**
 * Generates a unique ID for temporary items using timestamp.
 * Provides consistent ID generation across the application.
 */
export const generateUniqueId = (): number => {
	return Date.now();
};

/**
 * Generates a temporary ID with prefix for items that aren't yet saved.
 * Useful for distinguishing between saved and unsaved items.
 */
export const generateTempId = (): string => {
	return `${ID_GENERATION.TEMP_PREFIX}${Date.now()}`;
};

/**
 * Checks if an ID is a temporary ID (not yet saved to database).
 */
export const isTempId = (id: string | number): boolean => {
	if (typeof id === "number") {
		return false;
	}
	return String(id).startsWith(ID_GENERATION.TEMP_PREFIX);
};
