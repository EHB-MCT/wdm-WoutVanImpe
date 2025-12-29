"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/Button";
import { useReceiptEditor } from "@/hooks/useReceiptEditor";
import { VALID_CATEGORIES, TIME_FORMATS, CONFIRMATION_MESSAGES } from "@/lib/constants";
import { validateReceiptItems, formatCurrency, formatDate, safeParseNumber, safeParseInt } from "@/lib/receiptUtils";
import type { Receipt } from "@/types/receipt";
import styles from "@/styles/components/Modal.module.css";

interface ReceiptModalProps {
    receipt: Receipt | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedReceipt: Receipt) => Promise<void>;
    onDelete: (receiptId: number) => Promise<void>;
}

/**
 * Modal component for viewing and editing receipt details.
 * Handles the switch between read-only view and interactive edit mode.
 */
export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, isOpen, onClose, onSave, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const receiptData = useMemo(() => {
        if (!receipt) return null;

        return {
            store_name: receipt.store_name,
            date: receipt.purchase_date,
            time: receipt.purchase_time?.substring(0, TIME_FORMATS.SUBSTRING_LENGTH) || TIME_FORMATS.DEFAULT_TIME,
            total_price: receipt.total_amount,
            payment_method: receipt.payment_method,
            raw_ocr_text: receipt.raw_ocr_text,
            items: receipt.items.map((item) => ({
                id: item.id,
                name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price,
            })),
            dangerous_metadata: receipt.dangerous_metadata || {
                card_fingerprint: null,
                card_network: null,
                bank_name: null,
                wealth_rating: null,
                health_score: null,
                sin_score: null,
                urgency_score: null,
                store_location: null,
                geographic_pattern: null,
                time_category: null,
                ai_flag: null,
            },
        };
    }, [receipt]);

    const editorOptions = useMemo(
        () => ({
            onValidationChange: () => {},
        }),
        []
    );

    const { editableData, validation, updateEditableData, updateItem, addNewItem, removeItem, initializeData, prepareForAPI } = useReceiptEditor({
        initialData: receiptData,
        ...editorOptions,
    });

    useEffect(() => {
        if (receipt && isOpen) {
            // Re-initialize form data when modal opens with a new receipt
            const data = {
                store_name: receipt.store_name,
                date: receipt.purchase_date,
                time: receipt.purchase_time?.substring(0, TIME_FORMATS.SUBSTRING_LENGTH) || TIME_FORMATS.DEFAULT_TIME,
                total_price: receipt.total_amount,
                payment_method: receipt.payment_method,
                raw_ocr_text: receipt.raw_ocr_text,
                items: receipt.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    price: item.price,
                })),
                dangerous_metadata: receipt.dangerous_metadata || {
                    card_fingerprint: null,
                    card_network: null,
                    bank_name: null,
                    wealth_rating: null,
                    health_score: null,
                    sin_score: null,
                    urgency_score: null,
                    store_location: null,
                    geographic_pattern: null,
                    time_category: null,
                    ai_flag: null,
                },
            };
            initializeData(data);
            setIsEditing(false);
        }
    }, [receipt, isOpen, initializeData]);

    const handleSave = async () => {
        if (!editableData || !receipt) return;

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
                items: (
                    apiData.items as Array<{
                        name: string;
                        category: string;
                        quantity: number;
                        price: number;
                    }>
                ).map((item, index) => ({
                    id: receipt.items[index]?.id || Date.now() + index,
                    ...item,
                })),
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

        if (confirm(CONFIRMATION_MESSAGES.DELETE_RECEIPT)) {
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
            // Revert to original data
            const originalData = {
                store_name: receipt.store_name,
                date: receipt.purchase_date,
                time: receipt.purchase_time?.substring(0, 5) || "12:00",
                total_price: receipt.total_amount,
                payment_method: receipt.payment_method,
                raw_ocr_text: receipt.raw_ocr_text,
                items: receipt.items,
                dangerous_metadata: receipt.dangerous_metadata || {
                    card_fingerprint: null,
                    card_network: null,
                    bank_name: null,
                    wealth_rating: null,
                    health_score: null,
                    sin_score: null,
                    urgency_score: null,
                    store_location: null,
                    geographic_pattern: null,
                    time_category: null,
                    ai_flag: null,
                },
            };
            initializeData(originalData);
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
        <div
            className={styles.modalBackdrop}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${receipt.id}`}
        >
            <div className={`${styles.modalContent} card`}>
                <div className={`${styles.modalHeader} flex-between`}>
                    <h2 id={`modal-title-${receipt.id}`}>{editableData?.store_name || receipt.store_name}</h2>
                    <Button onClick={onClose} variant="secondary" className={styles.modalCloseButton} aria-label="Close modal">
                        ×
                    </Button>
                </div>

                <div className={`${styles.modalBody} p-xl`}>
                    {!isEditing ? (
                        <div>
                            <div className={styles.receiptDetails}>
                                <h3>Ticket Details</h3>
                                <div className={styles.receiptDetailsList}>
                                    <div><strong>Datum:</strong> {formatDate(receipt.purchase_date)}</div>
                                    <div><strong>Tijd:</strong> {receipt.purchase_time?.substring(0, 5) || "12:00"}</div>
                                    <div><strong>Winkel:</strong> {receipt.store_name}</div>
                                    <div><strong>Betaalmethode:</strong> {receipt.payment_method}</div>
                                    <div><strong>Totaal:</strong> {formatCurrency(receipt.total_amount)}</div>
                                </div>
                            </div>

                            <div className={styles.itemsListSection}>
                                <div className={styles.itemsListHeader}>
                                    <h3>Items ({receipt.items.length})</h3>
                                </div>
                                <div className={styles.itemsList}>
                                    {receipt.items.map((item, index) => {
                                        const price = safeParseNumber(item.price);
                                        const quantity = safeParseInt(item.quantity, 1);

                                        return (
                                            <div key={`${receipt.id}-item-${index}`} className={styles.itemCard}>
                                                <div className={styles.itemCardDetails}>
                                                    <div className={styles.itemCardName}>{item.name}</div>
                                                    <div className={styles.itemCardCategory}>{item.category}</div>
                                                </div>
                                                <div className={styles.itemCardPricing}>
                                                    <div className={styles.itemCardPrice}>{formatCurrency(price)}</div>
                                                    <div className={styles.itemCardQuantity}>×{quantity}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={`${styles.modalActions} gap-sm`}>
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
                        <div>
                            <div className={styles.formGrid}>
                                <div className={styles.formField}>
                                    <label htmlFor="store-name" className="label-text">Winkelnaam</label>
                                    <input id="store-name" type="text" value={editableData?.store_name || ""} onChange={(e) => updateEditableData("store_name", e.target.value)} className={getFieldClassName(editableData?.store_name || null)} />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="purchase-date" className="label-text">Datum (YYYY-MM-DD)</label>
                                    <input id="purchase-date" type="date" value={editableData?.date || ""} onChange={(e) => updateEditableData("date", e.target.value)} className={getFieldClassName(editableData?.date || null)} />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="purchase-time" className="label-text">Tijd (HH:MM)</label>
                                    <input id="purchase-time" type="time" value={editableData?.time || ""} onChange={(e) => updateEditableData("time", e.target.value || null)} className={getFieldClassName(editableData?.time || null)} />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="payment-method" className="label-text">Betaalmethode</label>
                                    <select
                                        id="payment-method"
                                        value={editableData?.payment_method || ""}
                                        onChange={(e) => updateEditableData("payment_method", (e.target as HTMLSelectElement).value || null)}
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

                            <div className={styles.itemsEditSection}>
                                <div className={styles.itemsEditHeader}>
                                    <h3>Items ({editableData?.items?.length || 0}):</h3>
                                    <Button onClick={addNewItem} variant="secondary">+ Add Item</Button>
                                </div>

                                {editableData?.items && editableData.items.length > 0 ? (
                                    <div className={styles.itemsEditGrid}>
                                        {editableData.items.map((item, index) => (
                                            <div key={`editable-${receipt.id}-${item.id || index}`} className={styles.itemEditCard}>
                                                <div className={styles.itemEditGrid}>
                                                    <div>
                                                        <label htmlFor={`item-name-${index}`} className={`label-text ${styles.smallLabel}`}>Item Name</label>
                                                        <input
                                                            id={`item-name-${index}`}
                                                            type="text"
                                                            value={item.name || ""}
                                                            onChange={(e) => updateItem(index, "name", e.target.value || null)}
                                                            className={`${getFieldClassName(item.name)} ${styles.smallInput}`}
                                                            placeholder="Item name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`item-category-${index}`} className={`label-text ${styles.smallLabel}`}>Category</label>
                                                        <select id={`item-category-${index}`} value={item.category || ""} onChange={(e) => updateItem(index, "category", e.target.value)} className={`${getFieldClassName(item.category)} ${styles.smallSelect}`}>
                                                            <option value="">Selecteer categorie</option>
                                                            {VALID_CATEGORIES.map((category) => (
                                                                <option key={category} value={category}>{category}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`item-quantity-${index}`} className={`label-text ${styles.smallLabel}`}>Quantity</label>
                                                        <input
                                                            id={`item-quantity-${index}`}
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            value={item.quantity || ""}
                                                            onChange={(e) => updateItem(index, "quantity", e.target.value ? safeParseInt(e.target.value) : null)}
                                                            className={`${getFieldClassName(item.quantity, true)} ${styles.smallInput}`}
                                                            placeholder="1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor={`item-price-${index}`} className={`label-text ${styles.smallLabel}`}>Price (€)</label>
                                                        <input
                                                            id={`item-price-${index}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.price || ""}
                                                            onChange={(e) => updateItem(index, "price", e.target.value ? safeParseNumber(e.target.value) : null)}
                                                            className={`${getFieldClassName(item.price, false, true)} ${styles.smallInput}`}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Button onClick={() => removeItem(index)} variant="danger" className={styles.itemRemoveButton}>×</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.noItemsMessage}>Geen items gevonden. Klik op &quot;Add Item&quot; om items handmatig toe te voegen.</div>
                                )}
                            </div>

                            <div className={styles.totalDisplay}>
                                <div className={styles.totalAmount}>Totaal: {formatCurrency(editableData?.total_price || 0)}</div>
                            </div>

                            <div className={`${styles.modalActions} gap-sm`}>
                                <Button onClick={cancelEditing} variant="secondary" disabled={isLoading}>
                                    Annuleren
                                </Button>
                                <Button onClick={handleSave} variant="primary" disabled={isLoading || !validation?.isValid}>
                                    {isLoading ? "Opslaan..." : "Opslaan"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};