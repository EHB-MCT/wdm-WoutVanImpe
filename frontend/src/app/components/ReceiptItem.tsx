"use client";
import { ReceiptItem } from "@/types/receipt";
import styles from "./components.module.css";

interface ReceiptItemProps {
	item: ReceiptItem;
	index: number;
	updateItem: (index: number, field: keyof ReceiptItem, value: string | number | null) => void;
	removeItem: (index: number) => void;
	categories?: string[];
}

export default function ReceiptItemComponent({ item, index, updateItem, removeItem, categories = [] }: ReceiptItemProps) {
	const getFieldClassName = (value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
		const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
		return isEmpty ? `${baseClass} incompleteField` : baseClass;
	};

	return (
		<div className={styles.itemCard}>
			<div className={styles.itemFieldsGrid}>
				<div>
					<label className="label-text" style={{ fontSize: "0.8em" }}>
						Item Name
					</label>
					<input type="text" value={item.name || ""} onChange={(e) => updateItem(index, "name", e.target.value)} className={getFieldClassName(item.name)} placeholder="Item name" style={{ fontSize: "0.9em" }} />
				</div>
				<div>
					<label className="label-text" style={{ fontSize: "0.8em" }}>
						Category
					</label>
<select 
						value={item.category || ""} 
						onChange={(e) => updateItem(index, "category", e.target.value)} 
						className={getFieldClassName(item.category)} 
						style={{ fontSize: "0.9em", width: "100%" }}
					>
						<option value="">Selecteer categorie</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="label-text" style={{ fontSize: "0.8em" }}>
						Quantity
					</label>
					<input
						type="number"
						min="0"
						step="1"
						value={item.quantity || ""}
						onChange={(e) => updateItem(index, "quantity", e.target.value ? parseInt(e.target.value) : null)}
						className={getFieldClassName(item.quantity, true)}
						placeholder="x"
						style={{ fontSize: "0.9em" }}
					/>
				</div>
				<div>
					<label className="label-text" style={{ fontSize: "0.8em" }}>
						Price (€)
					</label>
					<input
						type="number"
						min="0"
						step="0.01"
						value={item.price || ""}
						onChange={(e) => updateItem(index, "price", e.target.value ? parseFloat(e.target.value) : null)}
						className={getFieldClassName(item.price, false, true)}
						placeholder="0.00"
						style={{ fontSize: "0.9em" }}
					/>
				</div>
				<div className={styles.itemRemoveBtn}>
					<button onClick={() => removeItem(index)} className={`btn btn-danger ${styles.removeItemButton}`}>
						×
					</button>
				</div>
			</div>
		</div>
	);
}
