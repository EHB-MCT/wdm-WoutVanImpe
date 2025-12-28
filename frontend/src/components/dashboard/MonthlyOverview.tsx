"use client";

import React from "react";
import { PieChartDisplay } from "./PieChartDisplay";
import styles from "@/styles/pages/Dashboard.module.css";

interface MonthlyOverviewProps {
	currentDate: Date;
	onPreviousMonth: () => void;
	onNextMonth: () => void;
	canGoNext: boolean;
	totalSpent: number;
	hasReceipts: boolean;
	categoryData: Array<{
		name: string;
		value: number;
		[key: string]: string | number;
	}>;
	onCategoryClick: (category: string) => void;
}

interface CategoryBreakdownProps {
	categoryData: Array<{
		name: string;
		value: number;
		[key: string]: string | number;
	}>;
	onCategoryClick: (category: string) => void;
}

function CategoryBreakdown({ categoryData, onCategoryClick }: CategoryBreakdownProps) {
	return (
		<div className={styles.combinedContent}>
			<div className={styles.categoryList}>
				{categoryData.map((cat, index) => (
					<button key={cat.name} className={styles.categoryItem} onClick={() => onCategoryClick(cat.name)} aria-label={`Bekijk details voor categorie ${cat.name}, bedrag €${cat.value.toFixed(2)}`}>
						<div className={styles.categoryInfo}>
							{/* Uses index modulo 8 for consistent colors defined in CSS */}
							<div className={`${styles.categoryDot} ${styles[`color${index % 8}`]}`} />
							<span className={styles.categoryName}>{cat.name}</span>
						</div>
						<span className={styles.categoryAmount}>€{cat.value.toFixed(2)}</span>
					</button>
				))}
			</div>

			<PieChartDisplay categoryData={categoryData} />
		</div>
	);
}

/**
 * Monthly spending overview component.
 * Displays total spending, category breakdown chart, and month navigation.
 */
export function MonthlyOverview({ currentDate, onPreviousMonth, onNextMonth, canGoNext, totalSpent, hasReceipts, categoryData, onCategoryClick }: MonthlyOverviewProps) {
	const formatMonthYear = (date: Date): string => {
		return date.toLocaleDateString("nl-BE", { month: "long", year: "numeric" });
	};

	return (
		<div className={styles.monthlyOverview}>
			<div className={styles.monthHeader}>
				<button className={styles.monthNavButton} onClick={onPreviousMonth} aria-label="Vorige maand">
					←
				</button>

				<h2 className={styles.monthTitle}>{formatMonthYear(currentDate)}</h2>

				<button
					className={styles.monthNavButton}
					onClick={onNextMonth}
					disabled={!canGoNext}
					aria-label="Volgende maand"
					style={{
						opacity: canGoNext ? 1 : 0.3,
						cursor: canGoNext ? "pointer" : "not-allowed",
					}}
				>
					→
				</button>
			</div>

			{hasReceipts ? (
				<div className={styles.statsGrid}>
					<div className={`${styles.statCard} card`}>
						<h3 className={styles.statTitle}>Totaal Uitgegeven</h3>
						<p className={styles.statAmount}>€{totalSpent.toFixed(2)}</p>
						<CategoryBreakdown categoryData={categoryData} onCategoryClick={onCategoryClick} />
					</div>
				</div>
			) : (
				<div className={styles.noDataMessage}>
					<p>Geen uitgaven deze maand</p>
				</div>
			)}
		</div>
	);
}
