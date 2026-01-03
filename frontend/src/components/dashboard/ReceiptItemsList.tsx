"use client";

import React from "react";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { ReceiptItem as ReceiptItemComponent } from "./ReceiptItem";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/Receipt.module.css";
import listStyles from "@/styles/components/ReceiptItemsList.module.css";

/**
 * Interface defining the properties required for the ReceiptItemsList component.
 */
interface ReceiptItemsListProps {
	/** The current receipt data containing the list of items to display. */
	editableData: ReceiptData | null;
	/** Callback function to update a specific item's field. */
	updateItem: (index: number, field: keyof ReceiptItem, value: string | number | null) => void;
	/** Callback function to add a new empty item to the list. */
	addNewItem: () => void;
	/** Callback function to remove an item from the list by its index. */
	removeItem: (index: number) => void;
	/** Optional list of categories to be passed down to individual items. */
	categories?: string[];
}

/**
 * List container for receipt items.
 * Manages the grid of editable items and the "Add Item" functionality.
 * Displays a message if no items are present.
 * @param {ReceiptItemsListProps} props - Component props containing data and handlers.
 * @returns {JSX.Element|null} The rendered list or null if no data exists.
 */
export const ReceiptItemsList = React.memo(({ editableData, updateItem, addNewItem, removeItem, categories = [] }: Readonly<ReceiptItemsListProps>) => {
	if (!editableData) {
		return null;
	}

	return (
		<div className="mb-xl">
			<div className={`${styles.itemsHeader} flex-between`}>
				<strong>Items ({editableData.items?.length || 0}):</strong>

				<Button onClick={addNewItem} variant="secondary" className={listStyles.addItemButton}>
					+ Add Item
				</Button>
			</div>

			{editableData.items && editableData.items.length > 0 ? (
				<div className={styles.itemsGrid}>
					{editableData.items.map((item, index) => (
						<ReceiptItemComponent key={`${item.name || "new"}-${index}`} item={item} index={index} updateItem={updateItem} removeItem={removeItem} categories={categories} />
					))}
				</div>
			) : (
				<div className={styles.noItemsMessage}>No items found. Click &quot;Add Item&quot; to add items manually.</div>
			)}
		</div>
	);
});

ReceiptItemsList.displayName = "ReceiptItemsList";
