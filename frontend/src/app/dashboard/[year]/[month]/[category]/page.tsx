/**
 * Dashboard page with refactored component structure
 * Now much cleaner and uses reusable components
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/pages/Dashboard.module.css";
import { Button } from "@/components/ui/Button";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ReceiptModal } from "@/components/dashboard/ReceiptModal";
import { ReceiptsList } from "@/components/dashboard/ReceiptsList";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { SpendingTrendChart, CategoryChart } from "@/components/ui/Charts";
import { removeExpiredTokens, isUserAuthenticated, handleTokenRefresh } from "@/lib/auth";
import { VALID_CATEGORIES } from "@/lib/constants";
import { safeParseNumber, safeParseInt } from "@/lib/receiptUtils";

interface User {
	id: number;
	username: string;
	email: string;
}

interface Receipt {
	id: number;
	total_amount: number;
	purchase_date: string;
	store_name: string;
	payment_method: string;
	raw_ocr_text: string;
	items: ReceiptItem[];
}

interface ReceiptItem {
	id: number;
	name: string;
	category: string;
	price: number;
	quantity: number;
}

interface CategorySpending {
	name: string;
	value: number;
	[key: string]: string | number;
}

export default function DashboardPage() {
	const params = useParams();
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);

	// Parse URL params and validate
	const { year: yearParam, month: monthParam } = params;
	const searchParams = useSearchParams();

	const currentDate = useMemo(() => {
		const year = yearParam ? Number.parseInt(yearParam as string) : new Date().getFullYear();
		const month = monthParam ? Number.parseInt(monthParam as string) - 1 : new Date().getMonth(); // JavaScript months are 0-indexed

		// Validate and fallback to current date if invalid
		const now = new Date();
		const validYear = Number.isNaN(year) || year < 2020 || year > 2030 ? now.getFullYear() : year;
		const validMonth = Number.isNaN(month) || month < 0 || month > 11 ? now.getMonth() : month;

		return new Date(validYear, validMonth, 1);
	}, [yearParam, monthParam]);

	// Use only query parameters for category - ignore route param
	const categoryFromQuery = searchParams.get("category");
	const currentCategory = categoryFromQuery && VALID_CATEGORIES.includes(categoryFromQuery as (typeof VALID_CATEGORIES)[number]) ? categoryFromQuery : "all";

	useEffect(() => {
		// Clean up expired tokens first
		removeExpiredTokens();

		const token = localStorage.getItem("token");
		if (token && isUserAuthenticated()) {
			const storedUser = localStorage.getItem("user");
			if (storedUser) {
				setUser(JSON.parse(storedUser));
				fetchData();
			}
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (user) {
			fetchData();
		}
	}, [currentDate, currentCategory, user]);

	const fetchData = async () => {
		try {
			// Clean up expired tokens and get fresh token
			removeExpiredTokens();
			const token = localStorage.getItem("token");

			if (!token) {
				throw new Error("Niet ingelogd");
			}

			// Fetch receipts
			const receiptsResponse = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_API_PORT}/api/receipts`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (receiptsResponse.ok) {
				// Handle automatic token refresh
				const refreshSuccess = handleTokenRefresh(receiptsResponse);
				if (!refreshSuccess) {
					console.warn("Token refresh failed during receipts fetch");
				}
				const data = await receiptsResponse.json();
				setReceipts(data);
			}
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const goToPreviousMonth = () => {
		const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
		navigateToMonth(newDate, currentCategory);
	};

	const goToNextMonth = () => {
		const now = new Date();
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		if (nextMonth <= new Date(now.getFullYear(), now.getMonth())) {
			navigateToMonth(nextMonth, currentCategory);
		}
	};

	const navigateToMonth = (date: Date, category: string) => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1; // URL months are 1-indexed

		// Always use query parameters for category to avoid URL encoding issues
		router.push(`/dashboard/${year}/${month}/all?category=${encodeURIComponent(category)}`);
	};

	const handleCategoryChange = (category: string) => {
		navigateToMonth(currentDate, category);
	};

	const formatMonthYear = (date: Date): string => {
		return date.toLocaleDateString("nl-BE", { month: "long", year: "numeric" });
	};

	const getFilteredData = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const monthlyReceipts = receipts.filter((receipt) => {
			const receiptDate = new Date(receipt.purchase_date);
			const dateMatch = receiptDate.getFullYear() === year && receiptDate.getMonth() === month;

			if (currentCategory === "all") return dateMatch;

			const hasCategoryInItems = receipt.items.some((item) => item.category === currentCategory);
			return dateMatch && hasCategoryInItems;
		});

		// Daily spending for trend chart - category-specific
		const dailySpending: { [key: string]: number } = {};
		monthlyReceipts.forEach((receipt) => {
			const day = new Date(receipt.purchase_date).getDate();

			// Calculate amount only from items that match the selected category
			let categoryAmount = 0;
			receipt.items.forEach((item) => {
				if (currentCategory === "all" || item.category === currentCategory) {
					const itemPrice = safeParseNumber(item.price);
					const itemQuantity = safeParseInt(item.quantity);
					categoryAmount += itemPrice * itemQuantity;
				}
			});

			// Only add to daily spending if there are items from the selected category
			if (categoryAmount > 0) {
				dailySpending[day] = (dailySpending[day] || 0) + categoryAmount;
			}
		});

		const dailySpendingData = Object.entries(dailySpending)
			.map(([day, amount]) => ({ day: Number.parseInt(day), amount }))
			.sort((a, b) => a.day - b.day);

		// Category breakdown - only from items that match the selected category
		const categorySpending: { [key: string]: number } = {};
		monthlyReceipts.forEach((receipt) => {
			receipt.items.forEach((item) => {
				const category = item.category || "Overig";

				// Only include item if we're showing "all" or if item matches the selected category
				if (currentCategory === "all" || item.category === currentCategory) {
					const itemPrice = safeParseNumber(item.price);
					const itemQuantity = safeParseInt(item.quantity);
					const itemTotal = itemPrice * itemQuantity;
					categorySpending[category] = (categorySpending[category] || 0) + itemTotal;
				}
			});
		});

		const categoryData: CategorySpending[] = Object.entries(categorySpending)
			.map(([category, amount]) => ({ name: category, value: amount }))
			.sort((a, b) => b.value - a.value);

		// Store frequency - only from filtered receipts
		const storeFrequency: { [key: string]: number } = {};
		monthlyReceipts.forEach((receipt) => {
			storeFrequency[receipt.store_name] = (storeFrequency[receipt.store_name] || 0) + 1;
		});

		const storeData = Object.entries(storeFrequency)
			.map(([store, count]) => ({ name: store, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		// Calculate total spending from category data instead of all receipts
		const totalSpent = categoryData.reduce((sum, category) => sum + category.value, 0);

		return {
			totalSpent,
			receipts: monthlyReceipts,
			dailySpendingData,
			categoryData,
			storeData,
			hasReceipts: monthlyReceipts.length > 0,
		};
	}, [receipts, currentDate, currentCategory]);

	const openReceiptModal = (receipt: Receipt) => {
		setSelectedReceipt(receipt);
		setShowEditModal(true);
	};

	const closeReceiptModal = () => {
		setSelectedReceipt(null);
		setShowEditModal(false);
	};

	const saveReceipt = async (updatedReceipt: Receipt) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_API_PORT}/api/receipts/${updatedReceipt.id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					store_name: updatedReceipt.store_name,
					purchase_date: updatedReceipt.purchase_date,
					purchase_time: updatedReceipt.purchase_date?.split("T")[1] || "12:00:00",
					total_amount: updatedReceipt.total_amount,
					payment_method: updatedReceipt.payment_method,
					raw_ocr_text: updatedReceipt.raw_ocr_text,
					items: updatedReceipt.items.map((item) => ({
						name: item.name,
						category: item.category,
						quantity: safeParseInt(item.quantity),
						price: safeParseNumber(item.price),
					})),
				}),
			});

			if (response.ok) {
				// Handle automatic token refresh
				const refreshSuccess = handleTokenRefresh(response);
				if (!refreshSuccess) {
					console.warn("Token refresh failed during receipt update");
				}
				const savedReceipt = await response.json();
				setReceipts(receipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r)));
				setSelectedReceipt(savedReceipt);
			} else {
				const error = await response.json();
				alert(`Fout bij opslaan: ${error.error}`);
			}
		} catch (error) {
			console.error("Error updating receipt:", error);
			alert("Er is een fout opgetreden bij het opslaan");
		}
	};

	const deleteReceipt = async (receiptId: number) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:${process.env.NEXT_PUBLIC_API_PORT}/api/receipts/${receiptId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				// Handle automatic token refresh
				const refreshSuccess = handleTokenRefresh(response);
				if (!refreshSuccess) {
					console.warn("Token refresh failed during receipt deletion");
				}
				setReceipts(receipts.filter((r) => r.id !== receiptId));
			}
		} catch (error) {
			console.error("Error deleting receipt:", error);
		}
	};

	const canGoNext = useMemo(() => {
		const now = new Date();
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		return nextMonth <= new Date(now.getFullYear(), now.getMonth());
	}, [currentDate]);

	const filteredData = getFilteredData;

	if (loading) {
		return (
			<AuthGuard>
				<main className={styles.dashboardPage}>
					<div>Laden...</div>
				</main>
			</AuthGuard>
		);
	}

	if (!user) {
		return (
			<AuthGuard>
				<main className={styles.dashboardPage}>
					<div className={`card ${styles.loginPrompt}`}>
						<p className="label-text">Je moet ingelogd zijn om het dashboard te bekijken.</p>
						<Button variant="primary" onClick={() => router.push("/account")}>
							Naar Login
						</Button>
					</div>
				</main>
			</AuthGuard>
		);
	}

	return (
		<AuthGuard>
			<main className={styles.dashboardPage}>
				<div className={styles.dashboardContainer}>
					<DashboardHeader
						currentDate={currentDate}
						currentCategory={currentCategory}
						validCategories={VALID_CATEGORIES}
						canGoNext={canGoNext}
						onPreviousMonth={goToPreviousMonth}
						onNextMonth={goToNextMonth}
						onCategoryChange={handleCategoryChange}
						formatMonthYear={formatMonthYear}
					/>

					{filteredData.hasReceipts === false ? (
						<div className={styles.noDataMessage}>
							<p>Geen uitgaven voor {formatMonthYear(currentDate)}</p>
						</div>
					) : (
						<>
							{/* Summary Cards */}
							<div className={styles.summaryCards}>
								<SummaryCard title="Totaal Uitgegeven" amount={filteredData.totalSpent} subtitle={`${filteredData.receipts.length} tickets`} />
							</div>

							{/* Charts */}
							<div className={styles.chartsGrid}>
								{/* Spending Trend */}
								<div className={`${styles.chartCard} card`}>
									<h3 className={styles.chartTitle}>Dagelijkse Uitgaven</h3>
									<div className={styles.chartContainer}>
										<SpendingTrendChart data={filteredData.dailySpendingData} height={300} />
									</div>
								</div>

								{/* Category Breakdown */}
								<div className={`${styles.chartCard} card`}>
									<h3 className={styles.chartTitle}>Categorie Verdeling</h3>
									<div className={styles.chartContainer}>
										<CategoryChart data={filteredData.categoryData} height={300} />
									</div>
								</div>
							</div>

							{/* Receipts List */}
							<ReceiptsList receipts={filteredData.receipts} onReceiptClick={openReceiptModal} className={styles.receiptsSection} />
						</>
					)}

					{/* Receipt Modal */}
					<ReceiptModal receipt={selectedReceipt} isOpen={showEditModal} onClose={closeReceiptModal} onSave={saveReceipt} onDelete={deleteReceipt} />
				</div>
			</main>
		</AuthGuard>
	);
}
