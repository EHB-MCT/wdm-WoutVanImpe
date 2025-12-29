"use client";

import React from "react";
import { Button } from "../ui/Button";
import { Receipt } from "@/types/receipt";
import { formatCurrency, formatDate, safeParseNumber, safeParseInt } from "@/lib/receiptUtils";
import styles from "@/styles/components/ReceiptsList.module.css";

/**
 * Interface defining the properties required for the ReceiptsList component.
 */
interface ReceiptsListProps {
	/** Array of receipt objects to be displayed in the list. */
	receipts: Receipt[];
	/** Callback function triggered when a specific receipt card is clicked. */
	onReceiptClick: (receipt: Receipt) => void;
	/** Optional CSS class name for styling the container. */
	className?: string;
}

/**
 * Renders a clickable list of receipts with a summary preview.
 * Shows a "No Data" message if the receipt array is empty.
 * Displays a preview of the first few items for each receipt.
 * @param {ReceiptsListProps} props - Component props containing the receipts data and handlers.
 * @returns {JSX.Element} The rendered grid of receipt cards or an empty state message.
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
