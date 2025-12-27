/**
 * Dashboard header component with navigation and controls
 * Extracted from main dashboard page for reusability
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";
import styles from "@/styles/components/DashboardHeader.module.css";

interface DashboardHeaderProps {
	currentDate: Date;
	currentCategory: string;
	validCategories: readonly string[];
	canGoNext: boolean;
	onPreviousMonth: () => void;
	onNextMonth: () => void;
	onCategoryChange: (category: string) => void;
	formatMonthYear: (date: Date) => string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentDate, currentCategory, validCategories, canGoNext, onPreviousMonth, onNextMonth, onCategoryChange, formatMonthYear }) => {
	return (
		<>
			{/* Header */}
			<div className={styles.dashboardHeader}>
				<h1 className={styles.title}>Dashboard: {formatMonthYear(currentDate)}</h1>
				<p className={styles.categoryInfo}>Categorie: {currentCategory}</p>
			</div>

			{/* Controls */}
			<div className={styles.controlsSection}>
				{/* Month Navigation */}
				<div className={styles.monthNavigation}>
					<Button onClick={onPreviousMonth} aria-label="Vorige maand" variant="secondary">
						←
					</Button>
					<span className={styles.monthDisplay}>{formatMonthYear(currentDate)}</span>
					<Button onClick={onNextMonth} disabled={!canGoNext} aria-label="Volgende maand" variant="secondary">
						→
					</Button>
				</div>

				{/* Filter Controls */}
				<div className={styles.filterControls}>
					<select value={currentCategory} onChange={(e) => onCategoryChange(e.target.value)} className={styles.categorySelect}>
						<option value="all">Alle categorieën</option>
						{validCategories.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</div>
			</div>
		</>
	);
};
