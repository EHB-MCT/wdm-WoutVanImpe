"use client";
import { ReceiptItem } from "@/types/receipt";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/Receipt.module.css";

interface ReceiptItemProps {
	item: ReceiptItem;
	index: number;
	updateItem: (index: number, field: keyof ReceiptItem, value: string | number | null) => void;
	removeItem: (index: number) => void;
	categories?: string[];
}

export function ReceiptItemComponent({ item, index, updateItem, removeItem, categories = [] }: Readonly<ReceiptItemProps>) {
	const getFieldClassName = (value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
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
						onChange={(e) => updateItem(index, "quantity", e.target.value ? Number.parseInt(e.target.value) : null)}
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
						onChange={(e) => updateItem(index, "price", e.target.value ? Number.parseFloat(e.target.value) : null)}
						className={getFieldClassName(item.price, false, true)}
						placeholder="0.00"
					/>
				</div>
				<div className={styles.itemRemoveBtn}>
					<Button onClick={() => removeItem(index)} variant="danger" className={styles.removeItemButton}>
						×
					</Button>
				</div>
			</div>
		</div>
	);
}
