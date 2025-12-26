/**
 * Utility functions for receipt processing and calculations
 * Shared across upload, dashboard, and account pages
 */

import type { ReceiptItem } from "@/types/receipt";
import { VALID_CATEGORIES, DEFAULTS, VALIDATION } from "./constants";

/**
 * Calculates total price from array of receipt items
 */
export const calculateTotalFromItems = (items: ReceiptItem[]): number => {
  return items.reduce((total, item) => {
    if (item.price !== null && item.price !== undefined) {
      const quantity = item.quantity || DEFAULTS.QUANTITY;
      return total + (item.price * quantity);
    }
    return total;
  }, 0);
};

/**
 * Validates and sanitizes category name
 */
export const validateCategory = (category: string | null): string => {
  if (!category) return DEFAULTS.CATEGORY;
  
  if (VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])) {
    return category;
  }
  
  console.warn(`Invalid category "${category}", defaulting to "${DEFAULTS.CATEGORY}"`);
  return DEFAULTS.CATEGORY;
};

/**
 * Safely converts value to number with fallback
 */
export const safeParseNumber = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Safely converts value to integer with fallback
 */
export const safeParseInt = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Validates item data for form submissions
 */
export const validateReceiptItem = (item: ReceiptItem, index: number): { isValid: boolean; error?: string } => {
  if (!item.name || item.name.trim() === "") {
    return { 
      isValid: false, 
      error: `Item ${index + 1}: Product naam is verplicht` 
    };
  }

  const price = safeParseNumber(item.price);
  if (price <= VALIDATION.MIN_PRICE) {
    return { 
      isValid: false, 
      error: `Item ${index + 1}: Prijs moet groter zijn dan ${VALIDATION.MIN_PRICE}` 
    };
  }

  const quantity = safeParseNumber(item.quantity);
  if (quantity < VALIDATION.MIN_QUANTITY) {
    return { 
      isValid: false, 
      error: `Item ${index + 1}: Aantal moet groter zijn dan ${VALIDATION.MIN_QUANTITY}` 
    };
  }

  return { isValid: true };
};

/**
 * Validates all items in a receipt
 */
export const validateReceiptItems = (items: ReceiptItem[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const validation = validateReceiptItem(items[i], i);
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats a receipt item for API submission
 */
export const formatReceiptItemForAPI = (item: ReceiptItem) => ({
  name: item.name,
  category: validateCategory(item.category),
  quantity: safeParseInt(item.quantity, DEFAULTS.QUANTITY),
  price: safeParseNumber(item.price)
});

/**
 * Creates a new empty receipt item with defaults
 */
export const createNewReceiptItem = (id?: number): ReceiptItem => ({
  id: id || Date.now(),
  name: "",
  category: "",
  quantity: DEFAULTS.QUANTITY,
  price: 0
});

/**
 * Checks if a date string is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
  inputDate.setHours(0, 0, 0, 0);
  
  return inputDate > today;
};

/**
 * Formats currency amount for display
 */
export const formatCurrency = (amount: number | string): string => {
  const numeric = safeParseNumber(amount);
  return `€${numeric.toFixed(2).replace('.', ',')}`;
};

/**
 * Formats date for display in Dutch format
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long", 
      year: "numeric",
      ...options
    });
  } catch {
    return dateString;
  }
};

/**
 * Generates a unique key for React lists
 */
export const generateItemKey = (item: ReceiptItem, index: number): string => {
  const identifier = item.name || item.id || 'new';
  return `${identifier}-${index}`;
};