"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Receipt } from "@/types/receipt";
import { formatCurrency, formatDate, safeParseNumber, safeParseInt } from "@/lib/receiptUtils";
import styles from "@/styles/components/ReceiptsList.module.css";

interface ReceiptsListProps {
	receipts: Receipt[];
	onReceiptClick: (receipt: Receipt) => void;
	className?: string;
}

/**
 * Renders a clickable list of receipts with a summary preview.
 * Shows a "No Data" message if the receipt array is empty.
 */
export const ReceiptsList: React.FC<Readonly<ReceiptsListProps>> = ({ receipts, onReceiptClick, className }) => {
	if (!receipts || receipts.length === 0) {
		return (
			<div className={className}>
				<div className={styles.noDataMessage}>
					<h3>Geen tickets gevonden</h3>
					<p>Er zijn geen bonnen beschikbaar voor de geselecteerde periode en categorie.</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`${className} ${styles.receiptsGrid}`}>
			{receipts.map((receipt) => (
				<Button key={receipt.id} onClick={() => onReceiptClick(receipt)} variant="secondary" className={styles.receiptCard}>
					<div className={styles.receiptHeader}>
						<h4 className={styles.receiptStore}>{receipt.store_name}</h4>
						<span className={styles.receiptDate}>{formatDate(receipt.purchase_date)}</span>
					</div>

					<div className={styles.receiptDetails}>
						<span className={styles.receiptAmount}>{formatCurrency(receipt.total_amount)}</span>
						<span className={styles.receiptPayment}>{receipt.payment_method}</span>
					</div>

					<div className={styles.receiptItems}>
						{receipt.items.slice(0, 3).map((item, index) => {
							const price = safeParseNumber(item.price);
							const quantity = safeParseInt(item.quantity, 1);

							return (
								<div key={`${receipt.id}-item-${index}`} className={styles.receiptItem}>
									<span>{item.name}</span>
									<span>{formatCurrency(price * quantity)}</span>
								</div>
							);
						})}
						{receipt.items.length > 3 && <p className={styles.receiptMore}>+{receipt.items.length - 3} meer items</p>}
					</div>
				</Button>
			))}
		</div>
	);
};

ReceiptsList.displayName = "ReceiptsList";
