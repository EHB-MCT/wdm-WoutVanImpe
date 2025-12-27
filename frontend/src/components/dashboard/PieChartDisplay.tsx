"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import styles from "@/styles/pages/Dashboard.module.css";

interface CategorySpending {
	name: string;
	value: number;
	[key: string]: string | number;
}

interface PieChartDisplayProps {
	categoryData: CategorySpending[];
}

export function PieChartDisplay({ categoryData }: Readonly<PieChartDisplayProps>) {
	const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)", "var(--chart-7)", "var(--chart-8)"];

	if (categoryData.length === 0) {
		return <p className={styles.noDataMessage}>Geen categorie data beschikbaar</p>;
	}

	return (
		<div className={styles.chartContainer} style={{ minHeight: "400px" }}>
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={categoryData}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={(entry) => {
							const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
							const percentage = total > 0 ? ((entry.value || 0) / total) * 100 : 0;
							return `${percentage.toFixed(1)}%`;
						}}
						outerRadius={100}
						fill="#8884d8"
						dataKey="value"
					>
						{categoryData.map((entry, index) => (
							<Cell key={`cell-${entry.name}-${entry.value}`} fill={colors[index % 8]} />
						))}
					</Pie>
					<Tooltip formatter={(value: number | undefined) => `€${(value || 0).toFixed(2)}`} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}
