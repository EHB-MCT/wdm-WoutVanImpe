import { useState, useEffect } from "react";
import { Receipt } from "@/types/receipt";
import { receiptsApi } from "@/lib/api/receipts";

interface MonthlyData {
	totalSpent: number;
	categoryData: Array<{ name: string; value: number }>;
	hasReceipts: boolean;
}

interface DashboardDataReturn {
	receipts: Receipt[];
	loading: boolean;
	getMonthlyData: (targetDate: Date) => MonthlyData;
}

/**
 * Manages dashboard state.
 * Fetches receipts and provides analytics calculations for specific months.
 */
export function useDashboardData(currentDate: Date): DashboardDataReturn {
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchReceipts();
	}, [currentDate]);

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
