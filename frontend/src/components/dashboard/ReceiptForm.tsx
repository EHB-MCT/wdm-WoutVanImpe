'use client';
import { ReceiptData } from "@/types/receipt";
import styles from "@/styles/components/Receipt.module.css";

interface ReceiptFormProps {
  editableData: ReceiptData | null;
  updateEditableData: (field: keyof ReceiptData, value: string | number | null) => void;
}

export function ReceiptForm({ editableData, updateEditableData }: Readonly<ReceiptFormProps>) {
  if (!editableData) return null;

  const getFieldClassName = (value: string | number | null) => {
    const baseClass = "input-field";
    return !value ? `${baseClass} incompleteField` : baseClass;
  };

  return (
    <div className={styles.receiptFormGrid}>
      <div>
        <label htmlFor="store-name" className="label-text">Store Name</label>
        <input 
          id="store-name"
          type="text" 
          value={editableData.store_name || ""} 
          onChange={(e) => updateEditableData("store_name", e.target.value)} 
          className={getFieldClassName(editableData.store_name)} 
          placeholder="Enter store name" 
        />
      </div>
      <div>
        <label htmlFor="receipt-date" className="label-text">Date (YYYY-MM-DD)</label>
        <input 
          id="receipt-date"
          type="date" 
          value={editableData.date || ""} 
          onChange={(e) => updateEditableData("date", e.target.value)} 
          className={getFieldClassName(editableData.date)} 
        />
      </div>
      <div>
        <label htmlFor="receipt-time" className="label-text">Time (HH:MM)</label>
        <input 
          id="receipt-time"
          type="time" 
          value={editableData.time || ""} 
          onChange={(e) => updateEditableData("time", e.target.value)} 
          className={getFieldClassName(editableData.time)} 
        />
      </div>
      <div>
        <label htmlFor="total-price" className="label-text">Total Price (€)</label>
        <input
          id="total-price"
          type="number"
          step="0.01"
          value={editableData.total_price || ""}
          readOnly
          className={`${getFieldClassName(editableData.total_price)} readonly-field`}
          placeholder="0.00"
        />
        <small style={{ color: 'var(--muted-color)', fontSize: '0.8em', marginTop: '4px', display: 'block' }}>
          Automatically calculated from item prices
        </small>
      </div>
      <div>
        <label htmlFor="payment-method" className="label-text">Payment Method</label>
        <select 
          id="payment-method"
          value={editableData.payment_method || ""} 
          onChange={(e) => updateEditableData("payment_method", e.target.value || null)} 
          className={getFieldClassName(editableData.payment_method)}
          >
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="Visa">Visa</option>
          <option value="Bancontact">Bancontact</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}