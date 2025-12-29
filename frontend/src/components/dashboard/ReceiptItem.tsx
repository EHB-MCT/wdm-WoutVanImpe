"use client";

import React from "react";
import type { ReceiptItem as ReceiptItemType } from "@/types/receipt";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/Receipt.module.css";
import { safeParseNumber, safeParseInt } from "@/lib/receiptUtils";

/**
 * Props definition for the ReceiptItem component.
 */
interface ReceiptItemProps {
	/** The receipt item data object containing name, price, etc. */
	item: ReceiptItemType;
	/** The index of this item within the parent list array. */
	index: number;
	/** Callback to update a specific field of this item. */
	updateItem: (index: number, field: keyof ReceiptItemType, value: string | number | null) => void;
	/** Callback to remove this item from the list. */
	removeItem: (index: number) => void;
	/** List of available categories for the dropdown selector. */
	categories?: string[];
}

/**
 * Individual receipt line item component.
 * Handles editing of item details (name, category, quantity, price) within the receipt form.
 * @param {ReceiptItemProps} props - Component props containing item data and handlers.
 * @returns {JSX.Element} The rendered item card.
 */
export const ReceiptItem = React.memo(({ item, index, updateItem, removeItem, categories = [] }: Readonly<ReceiptItemProps>) => {
	/**
	 * Determines the CSS class for an input field based on its value validation.
	 * Marks fields as incomplete if they are empty or zero (for numbers).
	 * @param {string | number | null} value - The input value to check.
	 * @param {boolean} [isQuantity=false] - Whether the field is for quantity (checks for 0).
	 * @param {boolean} [isPrice=false] - Whether the field is for price (checks for 0).
	 * @returns {string} The computed CSS class string.
	 */
	const getFieldClassName = (value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
		// Zero is considered "empty" / invalid for quantity and price in this context
		const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
		return isEmpty ? `${baseClass} incompleteField` : baseClass;
	};

	return (
		<div className={styles.itemCard}>
			<div className={styles.itemFieldsGrid}>
				<div>
					<label htmlFor={`item-name-${index}`} className={`label-text ${styles.itemField}`}>
						Item Name
					</label>
					<input id={`item-name-${index}`} type="text" value={item.name || ""} onChange={(e) => updateItem(index, "name", e.target.value)} className={getFieldClassName(item.name)} placeholder="Item name" />
				</div>

				<div>
					<label htmlFor={`item-category-${index}`} className={`label-text ${styles.itemField}`}>
						Category
					</label>
					<select id={`item-category-${index}`} value={item.category || ""} onChange={(e) => updateItem(index, "category", e.target.value)} className={getFieldClassName(item.category)}>
						<option value="">Selecteer categorie</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor={`item-quantity-${index}`} className={`label-text ${styles.itemField}`}>
						Quantity
					</label>
					<input
						id={`item-quantity-${index}`}
						type="number"
						min="0"
						step="1"
						value={item.quantity || ""}
						onChange={(e) => updateItem(index, "quantity", e.target.value ? safeParseInt(e.target.value) : null)}
						className={getFieldClassName(item.quantity, true)}
						placeholder="x"
					/>
				</div>

				<div>
					<label htmlFor={`item-price-${index}`} className={`label-text ${styles.itemField}`}>
						Price (€)
					</label>
					<input
						id={`item-price-${index}`}
						type="number"
						min="0"
						step="0.01"
						value={item.price || ""}
						onChange={(e) => updateItem(index, "price", e.target.value ? safeParseNumber(e.target.value) : null)}
						className={getFieldClassName(item.price, false, true)}
						placeholder="0.00"
					/>
				</div>

				<div className={styles.itemRemoveBtn}>
					<Button onClick={() => removeItem(index)} variant="danger" className={styles.removeItemButton} aria-label={`Remove item ${item.name || "from list"}`}>
						×
					</Button>
				</div>
			</div>
		</div>
	);
});

ReceiptItem.displayName = "ReceiptItem";
