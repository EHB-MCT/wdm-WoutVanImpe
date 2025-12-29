/**
 * Utility functions for common operations across the application.
 * Centralized to avoid code duplication and maintain consistency.
 */

import { ID_GENERATION } from "./constants";

/**
 * Generates a unique numerical identifier based on the current timestamp.
 * Primarily used for key generation in lists or temporary object IDs before database persistence.
 * @returns {number} A timestamp-based unique ID.
 */
export const generateUniqueId = (): number => {
	return Date.now();
};

/**
 * Generates a prefixed string identifier for temporary items.
 * Useful for optimistic UI updates where an item exists in the state but hasn't been saved to the backend yet.
 * @returns {string} A string ID like "temp-1678900000".
 */
export const generateTempId = (): string => {
	return `${ID_GENERATION.TEMP_PREFIX}${Date.now()}`;
};

/**
 * Determines if a given identifier represents a temporary (unsaved) item.
 * Checks for the specific temporary prefix defined in constants.
 * @param {string | number} id - The ID to check.
 * @returns {boolean} True if the ID is a string starting with the temp prefix.
 */
export const isTempId = (id: string | number): boolean => {
	if (typeof id === "number") {
		return false;
	}
	return String(id).startsWith(ID_GENERATION.TEMP_PREFIX);
};
