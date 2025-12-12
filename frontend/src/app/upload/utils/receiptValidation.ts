import { ReceiptData } from "@/types/receipt";

export interface ValidationError {
  field: string;
  message: string;
  itemIndex?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const validateReceiptData = (data: ReceiptData): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Validate required store fields
  if (!data.store_name || data.store_name.trim() === '') {
    errors.push({
      field: 'store_name',
      message: 'Store name is required'
    });
  }

  // Validate date
  if (!data.date) {
    errors.push({
      field: 'date',
      message: 'Date is required'
    });
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push({
        field: 'date',
        message: 'Date must be in YYYY-MM-DD format'
      });
    } else {
      const date = new Date(data.date);
      const now = new Date();
      if (date > now) {
        errors.push({
          field: 'date',
          message: 'Date cannot be in the future'
        });
      }
    }
  }

  // Validate time
  if (data.time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.push({
        field: 'time',
        message: 'Time must be in HH:MM format (24-hour)'
      });
    }
  }

  // Validate total price
  if (data.total_price === null || data.total_price === undefined) {
    errors.push({
      field: 'total_price',
      message: 'Total price is required'
    });
  } else if (data.total_price <= 0) {
    errors.push({
      field: 'total_price',
      message: 'Total price must be greater than 0'
    });
  }

  // Validate payment method
  if (!data.payment_method || data.payment_method.trim() === '') {
    errors.push({
      field: 'payment_method',
      message: 'Payment method is required'
    });
  }

  // Validate items
  if (!data.items || data.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one item is required'
    });
  } else {
    data.items.forEach((item, index) => {
      if (!item.name || item.name.trim() === '') {
        errors.push({
          field: 'name',
          message: 'Item name is required',
          itemIndex: index
        });
      }

      if (!item.category || item.category.trim() === '') {
        warnings.push({
          field: 'category',
          message: 'Category is recommended',
          itemIndex: index
        });
      }

      if (item.quantity === null || item.quantity === undefined) {
        warnings.push({
          field: 'quantity',
          message: 'Quantity should be specified',
          itemIndex: index
        });
      } else if (item.quantity <= 0) {
        errors.push({
          field: 'quantity',
          message: 'Quantity must be greater than 0',
          itemIndex: index
        });
      }

      if (item.price === null || item.price === undefined) {
        errors.push({
          field: 'price',
          message: 'Item price is required',
          itemIndex: index
        });
      } else if (item.price < 0) {
        errors.push({
          field: 'price',
          message: 'Item price cannot be negative',
          itemIndex: index
        });
      }
    });

    // Business logic: Calculate total from items and validate
    const itemsWithPrice = data.items.filter(item => item.price !== null && item.price !== undefined);
    
    // Check if there are items with prices but no items at all
    if (itemsWithPrice.length === 0 && data.items.length > 0) {
      errors.push({
        field: 'items',
        message: 'At least one item must have a valid price'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const hasIncompleteFields = (data: ReceiptData): boolean => {
  const result = validateReceiptData(data);
  return result.errors.length > 0;
};

export const getIncompleteFields = (data: ReceiptData): string[] => {
  const result = validateReceiptData(data);
  return result.errors.map(error => 
    error.itemIndex !== undefined 
      ? `Item ${error.itemIndex + 1}: ${error.field}`
      : error.field
  );
};