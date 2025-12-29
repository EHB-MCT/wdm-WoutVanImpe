"use client";

import React from "react";
import { formatCurrency } from "@/lib/receiptUtils";

/**
 * Interface defining the properties for the SummaryCard component.
 */
interface SummaryCardProps {
	/** The title of the metric being displayed. */
	title: string;
	/** The numerical value to be formatted as currency. */
	amount: number;
	/** Optional secondary text to display below the amount. */
	subtitle?: string;
	/** Optional CSS class names for custom styling. */
	className?: string;
}

/**
 * Dashboard summary card component.
 * Displays a key metric consisting of a title, a formatted currency amount, and an optional subtitle.
 * @param {SummaryCardProps} props - The component props containing display data.
 * @returns {JSX.Element} The rendered summary card.
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
