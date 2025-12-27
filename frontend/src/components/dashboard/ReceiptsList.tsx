/**
 * ReceiptsList component for dashboard
 * Displays paginated list of receipts with basic info
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";
import { formatCurrency, formatDate } from "@/lib/receiptUtils";
import styles from "@/styles/components/ReceiptsList.module.css";

interface ReceiptItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface Receipt {
  id: number;
  total_amount: number;
  purchase_date: string;
  store_name: string;
  payment_method: string;
  raw_ocr_text: string;
  items: ReceiptItem[];
}

interface ReceiptsListProps {
  receipts: Receipt[];
  onReceiptClick: (receipt: Receipt) => void;
  className?: string;
}

export const ReceiptsList: React.FC<ReceiptsListProps> = ({ 
  receipts, 
  onReceiptClick,
  className 
}) => {
  if (!receipts || receipts.length === 0) {
    return (
      <div className={className}>
        <div className="card p-xl">
          <h3 className="text-center">Geen tickets gevonden</h3>
          <p className="text-muted">
            Er zijn geen bonnen beschikbaar voor de geselecteerde periode en categorie.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${styles.receiptsList}`}>
      <h2 className={styles.receiptsListTitle}>Tickets ({receipts.length})</h2>
      <div className={styles.receiptsList}>
        {receipts.map((receipt) => (
          <Button
            key={receipt.id}
            onClick={() => onReceiptClick(receipt)}
            variant="secondary"
            className={styles.receiptCard}
          >
            {/* Header */}
            <div className={styles.receiptHeader}>
              <h4 className={styles.storeName}>
                {receipt.store_name}
              </h4>
              <span className={styles.receiptDate}>
                {formatDate(receipt.purchase_date)}
              </span>
            </div>

            {/* Details */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              width: "100%",
              marginBottom: "8px"
            }}>
              <span className={styles.totalAmount}>
                {formatCurrency(receipt.total_amount)}
              </span>
              <span className={styles.paymentMethod}>
                {receipt.payment_method}
              </span>
            </div>

            {/* Items Preview */}
            <div className={styles.itemsPreview}>
              {receipt.items.slice(0, 3).map((item, index) => {
                const price = typeof item.price === "number" ? item.price : 0;
                const quantity = typeof item.quantity === "number" ? item.quantity : 1;
                
                return (
                  <div key={`${receipt.id}-item-${index}`} className={styles.item}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemInfo}>
                      {formatCurrency(price * quantity)}
                    </span>
                  </div>
                );
              })}
              {receipt.items.length > 3 && (
                <p style={{ 
                  margin: "4px 0 0 0", 
                  fontSize: "0.8em", 
                  color: "var(--muted-color)",
                  fontStyle: "italic"
                }}>
                  +{receipt.items.length - 3} meer items
                </p>
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
};