/**
 * SummaryCard component for dashboard
 * Displays summary statistics in card format
 */

"use client";

import React from "react";
import { formatCurrency } from "@/lib/receiptUtils";

interface SummaryCardProps {
	title: string;
	amount: number;
	subtitle?: string;
	className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, subtitle, className }) => {
	return (
		<div className={`summary-card ${className || ""}`}>
			<h3 className="summary-card-title">{title}</h3>
			<p className="summary-card-amount">{formatCurrency(amount)}</p>
			{subtitle && <p className="summary-card-subtitle">{subtitle}</p>}
		</div>
	);
};
