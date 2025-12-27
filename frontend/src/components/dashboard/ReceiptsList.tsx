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

export const ReceiptsList: React.FC<ReceiptsListProps> = ({ receipts, onReceiptClick, className }) => {
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
		<div className={`${className} ${styles.receiptsList}`}>
			<h2 className={styles.receiptsListTitle}>Tickets ({receipts.length})</h2>
			<div className={styles.receiptsGrid}>
				{receipts.map((receipt) => (
					<Button key={receipt.id} onClick={() => onReceiptClick(receipt)} variant="secondary" className={styles.receiptCard}>
						{/* Header */}
						<div className={styles.receiptHeader}>
							<h4 className={styles.receiptStore}>{receipt.store_name}</h4>
							<span className={styles.receiptDate}>{formatDate(receipt.purchase_date)}</span>
						</div>

						{/* Details */}
						<div className={styles.receiptDetails}>
							<span className={styles.receiptAmount}>{formatCurrency(receipt.total_amount)}</span>
							<span className={styles.receiptPayment}>{receipt.payment_method}</span>
						</div>

						{/* Items Preview */}
						<div className={styles.receiptItems}>
							{receipt.items.slice(0, 3).map((item, index) => {
								const price = typeof item.price === "number" ? item.price : 0;
								const quantity = typeof item.quantity === "number" ? item.quantity : 1;

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
		</div>
	);
};
