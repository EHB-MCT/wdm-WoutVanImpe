/**
 * ReceiptModal component for dashboard
 * Handles viewing and editing of receipt details
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";
import { useReceiptEditor } from "../../hooks/useReceiptEditor";
import { VALID_CATEGORIES } from "../../lib/constants";
import { validateReceiptItems, formatCurrency } from "../../lib/receiptUtils";
import type { Receipt } from "../../types/dashboard";

interface ReceiptModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReceipt: Receipt) => Promise<void>;
  onDelete: (receiptId: number) => Promise<void>;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Convert receipt to ReceiptData format for editor hook
  const receiptData = receipt ? {
    store_name: receipt.store_name,
    date: receipt.purchase_date.split("T")[0],
    time: receipt.purchase_date.split("T")[1]?.substring(0, 5) || "12:00",
    total_price: receipt.total_amount,
    payment_method: receipt.payment_method,
    raw_ocr_text: receipt.raw_ocr_text,
    items: receipt.items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    }))
  } : null;

  const {
    editableData,
    validation,
    updateEditableData,
    updateItem,
    addNewItem,
    removeItem,
    initializeData,
    prepareForAPI
  } = useReceiptEditor({
    initialData: receiptData,
    onValidationChange: () => {}
  });

  // Initialize when receipt changes
  React.useEffect(() => {
    if (receipt && isOpen) {
      const receiptData = {
        store_name: receipt.store_name,
        date: receipt.purchase_date.split("T")[0],
        time: receipt.purchase_date.split("T")[1]?.substring(0, 5) || "12:00",
        total_price: receipt.total_amount,
        payment_method: receipt.payment_method,
        raw_ocr_text: receipt.raw_ocr_text,
        items: receipt.items.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        }))
      };
      initializeData(receiptData);
      setIsEditing(false);
    }
  }, [receipt, isOpen, initializeData]);

  const handleSave = async () => {
    if (!editableData || !receipt) return;

    // Validate items
    const itemValidation = validateReceiptItems(editableData.items || []);
    if (!itemValidation.isValid) {
      alert(itemValidation.errors.join("\n"));
      return;
    }

    setIsLoading(true);
    try {
      const apiData = prepareForAPI();
      if (!apiData) return;

      const updatedReceipt: Receipt = {
        id: receipt.id,
        total_amount: apiData.total_amount || 0,
        purchase_date: (apiData as { date?: string }).date || receipt.purchase_date,
        store_name: apiData.store_name || receipt.store_name,
        payment_method: apiData.payment_method || receipt.payment_method,
        raw_ocr_text: apiData.raw_ocr_text || receipt.raw_ocr_text,
        items: (apiData.items as Array<{
          name: string;
          category: string;
          quantity: number;
          price: number;
        }>).map((item, index) => ({
          id: receipt.items[index]?.id || Date.now() + index,
          ...item
        }))
      };

      await onSave(updatedReceipt);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving receipt:", error);
      alert("Fout bij opslaan van bon");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!receipt) return;
    
    if (confirm("Weet je zeker dat je dit ticket wilt verwijderen?")) {
      setIsLoading(true);
      try {
        await onDelete(receipt.id);
        onClose();
      } catch (error) {
        console.error("Error deleting receipt:", error);
        alert("Fout bij verwijderen van bon");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (receipt) {
      const receiptData = {
        store_name: receipt.store_name,
        date: receipt.purchase_date.split("T")[0],
        time: receipt.purchase_date.split("T")[1]?.substring(0, 5) || "12:00",
        total_price: receipt.total_amount,
        payment_method: receipt.payment_method,
        raw_ocr_text: receipt.raw_ocr_text,
        items: receipt.items
      };
      initializeData(receiptData);
    }
    setIsEditing(false);
  };

  const getFieldClassName = (value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
    const baseClass = "input-field";
    const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
    return isEmpty ? `${baseClass} incompleteField` : baseClass;
  };

  if (!isOpen || !receipt) return null;

  return (
    <button 
      type="button"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        border: "none",
        padding: 0,
        margin: 0,
        cursor: "default"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label="Close modal"
    >
      <div 
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative"
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: "20px", 
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h2 style={{ margin: 0 }}>
            {editableData?.store_name || receipt.store_name}
          </h2>
          <Button 
            onClick={onClose}
            variant="secondary"
            style={{ 
              padding: "8px 12px",
              fontSize: "18px",
              lineHeight: "1"
            }}
          >
            ×
          </Button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          {!isEditing ? (
            /* View Mode */
            <div>
              {/* Receipt Details */}
              <div style={{ marginBottom: "20px" }}>
                <h3>Ticket Details</h3>
                <div style={{ lineHeight: "1.6" }}>
                  <div><strong>Datum:</strong> {receipt.purchase_date.split("T")[0]}</div>
                  <div><strong>Tijd:</strong> {receipt.purchase_date.split("T")[1]?.substring(0, 5) || "12:00"}</div>
                  <div><strong>Winkel:</strong> {receipt.store_name}</div>
                  <div><strong>Betaalmethode:</strong> {receipt.payment_method}</div>
                  <div><strong>Totaal:</strong> {formatCurrency(receipt.total_amount)}</div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: "20px" }}>
                <h3>Items ({receipt.items.length})</h3>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "8px",
                  lineHeight: "1.6"
                }}>
                  {receipt.items.map((item, index) => {
                    const price = typeof item.price === "number" ? item.price : 0;
                    const quantity = typeof item.quantity === "number" ? item.quantity : 1;
                    
                    return (
                      <div 
                        key={`${receipt.id}-item-${index}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px",
                          backgroundColor: "#f9fafb",
                          borderRadius: "4px"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div>{item.name}</div>
                          <div style={{ fontSize: "0.8em", color: "var(--muted-color)" }}>
                            {item.category}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div>{formatCurrency(price)}</div>
                          <div style={{ fontSize: "0.8em", color: "var(--muted-color)" }}>
                            ×{quantity}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Button onClick={startEditing} variant="primary">
                  Bewerken
                </Button>
                <Button onClick={handleDelete} variant="danger">
                  Verwijder Ticket
                </Button>
                <Button onClick={onClose} variant="secondary">
                  Sluiten
                </Button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div>
              {/* Receipt Form */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "16px",
                marginBottom: "20px"
              }}>
                <div>
                  <label htmlFor="store-name" className="label-text">
                    Winkelnaam
                  </label>
                  <input 
                    id="store-name" 
                    type="text" 
                    value={editableData?.store_name || ""} 
                    onChange={(e) => updateEditableData("store_name", e.target.value)} 
                    className={getFieldClassName(editableData?.store_name || null)} 
                  />
                </div>
                <div>
                  <label htmlFor="purchase-date" className="label-text">
                    Datum (YYYY-MM-DD)
                  </label>
                  <input
                    id="purchase-date"
                    type="date"
                    value={editableData?.date || ""}
                    onChange={(e) => updateEditableData("date", e.target.value)}
                    className={getFieldClassName(editableData?.date || null)}
                  />
                </div>
                <div>
                  <label htmlFor="purchase-time" className="label-text">
                    Tijd (HH:MM)
                  </label>
                  <input
                    id="purchase-time"
                    type="time"
                value={editableData?.time || ""}
                onChange={(e) => updateEditableData("time", e.target.value || null)}
                className={getFieldClassName(editableData?.time || null)}
                  />
                </div>
                <div>
                  <label htmlFor="payment-method" className="label-text">
                    Betaalmethode
                  </label>
                  <select 
                    id="payment-method"
                    value={editableData?.payment_method || ""} 
                     onChange={(e) => {
                       const value = (e.target as HTMLSelectElement).value;
                       updateEditableData("payment_method", value || null);
                     }}
                     className={getFieldClassName(editableData?.payment_method || null)}
                  >
                    <option value="">Selecteer betaalmethode</option>
                    <option value="Cash">Contant</option>
                    <option value="Bancontact">Bancontact</option>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "16px"
                }}>
                  <h3>Items ({editableData?.items?.length || 0}):</h3>
                  <Button onClick={addNewItem} variant="secondary">
                    + Add Item
                  </Button>
                </div>

                {editableData?.items && editableData.items.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {editableData.items.map((item, index) => (
                      <div key={`editable-${receipt.id}-${item.id || index}`} style={{ 
                        border: "1px solid #e5e7eb", 
                        borderRadius: "4px", 
                        padding: "12px" 
                      }}>
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "2fr 1fr 1fr 1fr auto", 
                          gap: "8px",
                          alignItems: "center"
                        }}>
                          <div>
                            <label htmlFor={`item-name-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
                              Item Name
                            </label>
                            <input
                              id={`item-name-${index}`}
                              type="text"
                              value={item.name || ""}
                              onChange={(e) => updateItem(index, "name", e.target.value || null)}
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
                              {VALID_CATEGORIES.map((category) => (
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
                              placeholder="1"
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
                          <div>
                            <Button
                              onClick={() => removeItem(index)}
                              variant="danger"
                              style={{ 
                                padding: "8px 12px",
                                fontSize: "16px",
                                lineHeight: "1"
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--muted-color)" }}>
                    Geen items gevonden. Klik op &quot;Add Item&quot; om items handmatig toe te voegen.
                  </div>
                )}
              </div>

              {/* Total Display */}
              <div style={{ 
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                textAlign: "right"
              }}>
                <div style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                  Totaal: {formatCurrency(editableData?.total_price || 0)}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <Button 
                  onClick={cancelEditing} 
                  variant="secondary"
                  disabled={isLoading}
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={handleSave} 
                  variant="primary"
                  disabled={isLoading || !validation?.isValid}
                >
                  {isLoading ? "Opslaan..." : "Opslaan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};