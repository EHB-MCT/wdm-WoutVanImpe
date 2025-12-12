"use client";
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import ReceiptItemComponent from "./ReceiptItem";
import styles from "./components.module.css";

interface ReceiptItemsListProps {
	editableData: ReceiptData | null;
	updateItem: (index: number, field: keyof ReceiptItem, value: string | number | null) => void;
	addNewItem: () => void;
	removeItem: (index: number) => void;
	categories?: string[];
}

export default function ReceiptItemsList({ editableData, updateItem, addNewItem, removeItem, categories = [] }: ReceiptItemsListProps) {
	if (!editableData) return null;

	return (
		<div style={{ marginTop: "20px" }}>
			<div className={styles.itemsHeader}>
				<strong>Items ({editableData.items?.length || 0}):</strong>
				<button onClick={addNewItem} className={`btn btn-secondary ${styles.addItemButton}`}>
					+ Add Item
				</button>
			</div>

			{editableData.items && editableData.items.length > 0 ? (
				<div className={styles.itemsGrid}>
					{editableData.items.map((item, index) => (
						<ReceiptItemComponent key={index} item={item} index={index} updateItem={updateItem} removeItem={removeItem} categories={categories} />
					))}
				</div>
			) : (
				<div className={styles.noItemsMessage}>No items found. Click &quot;Add Item&quot; to add items manually.</div>
			)}
		</div>
	);
}
