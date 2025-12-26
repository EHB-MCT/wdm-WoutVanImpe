'use client';
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { ReceiptItemComponent } from "./ReceiptItem";
import styles from "../../styles/components/Receipt.module.css";
import listStyles from "../../styles/components/ReceiptItemsList.module.css";

interface ReceiptItemsListProps {
  editableData: ReceiptData | null;
  updateItem: (index: number, field: keyof ReceiptItem, value: string | number | null) => void;
  addNewItem: () => void;
  removeItem: (index: number) => void;
  categories?: string[];
}

export function ReceiptItemsList({ editableData, updateItem, addNewItem, removeItem, categories = [] }: Readonly<ReceiptItemsListProps>) {
  if (!editableData) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <div className={styles.itemsHeader}>
        <strong>Items ({editableData.items?.length || 0}):</strong>
        <button onClick={addNewItem} className={`btn btn-secondary ${listStyles.addItemButton}`}>
          + Add Item
        </button>
      </div>

      {editableData.items && editableData.items.length > 0 ? (
        <div className={styles.itemsGrid}>
          {editableData.items.map((item, index) => (
            <ReceiptItemComponent 
              key={`${item.name || 'new'}-${index}`}
              item={item} 
              index={index} 
              updateItem={updateItem} 
              removeItem={removeItem} 
              categories={categories} 
            />
          ))}
        </div>
      ) : (
        <div className={styles.noItemsMessage}>No items found. Click &quot;Add Item&quot; to add items manually.</div>
      )}
    </div>
  );
}