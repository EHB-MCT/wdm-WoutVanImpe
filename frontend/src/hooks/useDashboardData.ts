import { useState, useEffect } from "react";
import { Receipt } from "@/types/receipt";
import { receiptsApi } from "@/lib/api/receipts";

/**
 * Structure representing aggregated financial data for a specific month.
 */
interface MonthlyData {
	/** Total amount spent in the selected month. */
	totalSpent: number;
	/** Breakdown of spending by category for charts. */
	categoryData: Array<{ name: string; value: number }>;
	/** Boolean flag indicating if any receipts exist for the month. */
	hasReceipts: boolean;
}

/**
 * Return type definition for the useDashboardData hook.
 */
interface DashboardDataReturn {
	/** The complete list of fetched receipts. */
	receipts: Receipt[];
	/** Loading state indicator. */
	loading: boolean;
	/** Helper function to filter and aggregate data for a specific date. */
	getMonthlyData: (targetDate: Date) => MonthlyData;
}

/**
 * Custom hook to manage dashboard state and analytics.
 * Fetches receipts from the API and provides utility functions to calculate
 * monthly totals and category breakdowns.
 * @param {Date} currentDate - Dependency that triggers a data refresh when changed.
 * @returns {DashboardDataReturn} The receipts data, loading state, and aggregation helper.
 */
export function useDashboardData(currentDate: Date): DashboardDataReturn {
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchReceipts();
	}, [currentDate]);

	/**
	 * Fetches all receipts from the backend API.
	 * Updates local state and handles loading/error flags.
	 */
	const fetchReceipts = async (): Promise<void> => {
		try {
			const data = await receiptsApi.getAll();
			setReceipts(data);
		} catch (error) {
			console.error("Error fetching receipts:", error);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Filters receipts for a specific month and calculates financial metrics.
	 * Aggregates total spending and generates category breakdowns.
	 * Includes defensive parsing for numeric values (prices/quantities).
	 * @param {Date} targetDate - The date object representing the month to analyze.
	 * @returns {MonthlyData} The aggregated data for the specified month.
	 */
	const getMonthlyData = (targetDate: Date): MonthlyData => {
		const year = targetDate.getFullYear();
		const month = targetDate.getMonth();

		const monthlyReceipts = receipts.filter((receipt) => {
			const receiptDate = new Date(receipt.purchase_date);
			return receiptDate.getFullYear() === year && receiptDate.getMonth() === month;
		});

		const totalSpent = monthlyReceipts.reduce((sum, receipt) => {
			// API may return total_amount as string or number
			const amount = typeof receipt.total_amount === "number" ? receipt.total_amount : Number.parseFloat(receipt.total_amount || "0");
			return sum + amount;
		}, 0);

		// Aggregate spending by category
		const categorySpending: { [key: string]: number } = {};

		monthlyReceipts.forEach((receipt) => {
			receipt.items.forEach((item) => {
				const category = item.category || "Overig";

				// Defensive parsing for price/quantity
				const itemPrice = typeof item.price === "number" ? item.price : Number.parseFloat(String(item.price ?? "0"));

				const itemQuantity = typeof item.quantity === "number" ? item.quantity : Number.parseFloat(String(item.quantity ?? "1"));

				const itemTotal = itemPrice * itemQuantity;
				categorySpending[category] = (categorySpending[category] || 0) + itemTotal;
			});
		});

		const categoryData = Object.entries(categorySpending)
			.map(([category, amount]) => ({
				name: category,
				value: amount,
			}))
			.sort((a, b) => b.value - a.value);

		return {
			totalSpent,
			categoryData,
			hasReceipts: monthlyReceipts.length > 0,
		};
	};

	return {
		receipts,
		loading,
		getMonthlyData,
	};
}
