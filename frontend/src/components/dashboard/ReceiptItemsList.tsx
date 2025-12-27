'use client';
import { ReceiptData, ReceiptItem } from "@/types/receipt";
import { ReceiptItemComponent } from "./ReceiptItem";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/Receipt.module.css";
import listStyles from "@/styles/components/ReceiptItemsList.module.css";

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