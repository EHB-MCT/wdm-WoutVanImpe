'use client';
import { ReceiptItem } from "@/types/receipt";
import styles from "../../styles/components/Receipt.module.css";

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
          <label htmlFor={`item-name-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
            Item Name
          </label>
          <input 
            id={`item-name-${index}`}
            type="text" 
            value={item.name || ""} 
            onChange={(e) => updateItem(index, "name", e.target.value)} 
            className={getFieldClassName(item.name)} 
            placeholder="Item name" 
            style={{ fontSize: "0.9em" }} 
          />
        </div>
        <div>
          <label htmlFor={`item-category-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
            Category
          </label>
          <select 
            id={`item-category-${index}`}
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
          <label htmlFor={`item-quantity-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
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
            style={{ fontSize: "0.9em" }}
          />
        </div>
        <div>
          <label htmlFor={`item-price-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
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