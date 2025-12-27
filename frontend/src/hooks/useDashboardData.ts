import { useState, useEffect } from "react";
import { Receipt } from "@/types/dashboard";
import { handleTokenRefresh } from "@/lib/auth";

export function useDashboardData(currentDate: Date) {
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchReceipts();
	}, [currentDate]);

	const fetchReceipts = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5001/api/receipts", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				// Handle automatic token refresh
				const refreshSuccess = handleTokenRefresh(response);
				if (!refreshSuccess) {
					console.warn("Token refresh failed during receipts fetch");
				}
				const data = await response.json();
				setReceipts(data);
			}
		} catch (error) {
			console.error("Error fetching receipts:", error);
		} finally {
			setLoading(false);
		}
	};

	const getMonthlyData = (targetDate: Date) => {
		const year = targetDate.getFullYear();
		const month = targetDate.getMonth();

		const monthlyReceipts = receipts.filter((receipt) => {
			const receiptDate = new Date(receipt.purchase_date);
			return receiptDate.getFullYear() === year && receiptDate.getMonth() === month;
		});

		const totalSpent = monthlyReceipts.reduce((sum, receipt) => sum + (typeof receipt.total_amount === "number" ? receipt.total_amount : Number.parseFloat(receipt.total_amount || 0)), 0);

		const categorySpending: { [key: string]: number } = {};
		monthlyReceipts.forEach((receipt) => {
			receipt.items.forEach((item) => {
				const category = item.category || "Overig";
				const itemPrice = typeof item.price === "number" ? item.price : Number.parseFloat(item.price || 0);
				const itemQuantity = typeof item.quantity === "number" ? item.quantity : Number.parseFloat(item.quantity || 1);
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
