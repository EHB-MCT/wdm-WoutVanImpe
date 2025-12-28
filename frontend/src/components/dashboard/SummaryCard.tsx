"use client";

import React from "react";
import { formatCurrency } from "@/lib/receiptUtils";

interface SummaryCardProps {
	title: string;
	amount: number;
	subtitle?: string;
	className?: string;
}

/**
 * Dashboard summary card.
 * Displays a key metric (title + formatted amount) with an optional subtitle.
 */
export function SummaryCard({ title, amount, subtitle, className }: Readonly<SummaryCardProps>) {
	return (
		<div className={`summary-card ${className || ""}`}>
			<h3 className="summary-card-title">{title}</h3>
			<p className="summary-card-amount">{formatCurrency(amount)}</p>
			{subtitle && <p className="summary-card-subtitle">{subtitle}</p>}
		</div>
	);
}
