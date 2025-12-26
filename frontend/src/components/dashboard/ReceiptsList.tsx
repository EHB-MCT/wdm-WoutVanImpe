/**
 * ReceiptsList component for dashboard
 * Displays paginated list of receipts with basic info
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";
import { formatCurrency, formatDate } from "../../lib/receiptUtils";

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
        <h3>Geen tickets gevonden</h3>
        <p style={{ color: "var(--muted-color)" }}>
          Er zijn geen bonnen beschikbaar voor de geselecteerde periode en categorie.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h2>Tickets ({receipts.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {receipts.map((receipt) => (
          <Button
            key={receipt.id}
            onClick={() => onReceiptClick(receipt)}
            variant="secondary"
            style={{
              padding: "16px",
              justifyContent: "flex-start",
              textAlign: "left",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: "auto",
              width: "100%"
            }}
          >
            {/* Header */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              width: "100%",
              marginBottom: "8px"
            }}>
              <h4 style={{ margin: 0, fontSize: "1.1em" }}>
                {receipt.store_name}
              </h4>
              <span style={{ 
                fontSize: "0.9em", 
                color: "var(--muted-color)" 
              }}>
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
              <span style={{ 
                fontSize: "1.1em", 
                fontWeight: "bold" 
              }}>
                {formatCurrency(receipt.total_amount)}
              </span>
              <span style={{ 
                fontSize: "0.9em", 
                color: "var(--muted-color)" 
              }}>
                {receipt.payment_method}
              </span>
            </div>

            {/* Items Preview */}
            <div style={{ 
              width: "100%",
              fontSize: "0.9em"
            }}>
              {receipt.items.slice(0, 3).map((item, index) => {
                const price = typeof item.price === "number" ? item.price : 0;
                const quantity = typeof item.quantity === "number" ? item.quantity : 1;
                
                return (
                  <div 
                    key={`${receipt.id}-item-${index}`} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "2px 0",
                      fontSize: "0.8em"
                    }}
                  >
                    <span>{item.name}</span>
                    <span style={{ color: "var(--muted-color)" }}>
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