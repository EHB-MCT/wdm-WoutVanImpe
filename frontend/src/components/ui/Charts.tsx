"use client";

import React from "react";
import { Cell, ResponsiveContainer, Tooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CATEGORY_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/receiptUtils";

/**
 * Structure representing spending data for a specific day.
 */
interface DailySpendingData {
	day: number;
	amount: number;
}

/**
 * Structure representing total spending aggregated by category.
 */
interface CategorySpendingData {
	name: string;
	value: number;
}

/**
 * Props definition for the SpendingTrendChart component.
 */
interface SpendingTrendChartProps {
	/** Array of daily spending data points. */
	data: DailySpendingData[];
	/** Optional height for the chart container. Defaults to 300. */
	height?: number;
	/** Optional CSS class name for styling. */
	className?: string;
}

/**
 * Props definition for the CategoryChart component.
 */
interface CategoryChartProps {
	/** Array of spending data points aggregated by category. */
	data: CategorySpendingData[];
	/** Optional height for the chart container. Defaults to 300. */
	height?: number;
	/** Optional CSS class name for styling. */
	className?: string;
}

/**
 * Line chart visualization for daily spending trends.
 * Renders a responsive line chart showing spending amounts over days.
 * Displays a fallback message if no data is provided.
 * @param {SpendingTrendChartProps} props - The component props.
 * @returns {JSX.Element} The rendered line chart or an empty state message.
 */
export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ data, height = 300, className }) => {
	if (!data || data.length === 0) {
		return (
			<div className={`chart-container ${className || ""} no-data-chart chart-height-${height}`}>
				<p className="no-data-message">Geen gegevens beschikbaar</p>
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={height}>
			<LineChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="day" label={{ value: "Dag", position: "insideBottom", offset: -5 }} />
				<YAxis label={{ value: "Bedrag (€)", angle: -90, position: "insideLeft" }} />
				<Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
				<Line type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={2} />
			</LineChart>
		</ResponsiveContainer>
	);
};

/**
 * Bar chart visualization for spending by category.
 * Renders a responsive bar chart with distinct colors for each category.
 * Displays a fallback message if no data is provided.
 * @param {CategoryChartProps} props - The component props.
 * @returns {JSX.Element} The rendered bar chart or an empty state message.
 */
export const CategoryChart: React.FC<CategoryChartProps> = ({ data, height = 300, className }) => {
	if (!data || data.length === 0) {
		return (
			<div className={`chart-container ${className || ""} no-data-chart chart-height-${height}`}>
				<p className="no-data-message">Geen categoriegevens beschikbaar</p>
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={height}>
			<BarChart data={data}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="name" />
				<YAxis />
				<Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
				<Bar dataKey="value" fill="var(--chart-2)">
					{data.map((entry, index) => (
						<Cell key={`${entry.name}-${entry.value}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};
