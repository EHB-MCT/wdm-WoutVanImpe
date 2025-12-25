"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import styles from "./page.module.css";

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
	items: ReceiptItem[];
}

interface ReceiptItem {
	id: number;
	product_name: string;
	category: string;
	price: number;
	quantity: number;
}

interface CategorySpending {
	name: string;
	value: number;
	[key: string]: string | number;
}

export default function HomePage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [receipts, setReceipts] = useState<Receipt[]>([]);
	const [currentDate, setCurrentDate] = useState(new Date());

	useEffect(() => {
		const storedUser = localStorage.getItem("user");

		if (storedUser) {
			setUser(JSON.parse(storedUser));
			fetchReceipts();
		}

		setLoading(false);
	}, []);

	const fetchReceipts = async () => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5000/api/receipts", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				setReceipts(data);
			}
		} catch (error) {
			console.error("Error fetching receipts:", error);
		}
	};

	const formatDate = (date: Date): string => {
		return date.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
	};

	const formatMonthYear = (date: Date): string => {
		return date.toLocaleDateString("nl-BE", { month: "long", year: "numeric" });
	};

	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

const goToNextMonth = () => {
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		const now = new Date();
		if (nextMonth <= new Date(now.getFullYear(), now.getMonth())) {
			setCurrentDate(nextMonth);
		}
	};

	const navigateToDashboard = (category: string) => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth() + 1;
		
		if (category === "all") {
			router.push(`/dashboard/${year}/${month}/all`);
		} else {
			router.push(`/dashboard/${year}/${month}/all?category=${encodeURIComponent(category)}`);
		}
	};

	const canGoNext = useMemo(() => {
		const now = new Date();
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		return nextMonth <= new Date(now.getFullYear(), now.getMonth());
	}, [currentDate]);

	const getMonthlyData = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();

		const monthlyReceipts = receipts.filter((receipt) => {
			const receiptDate = new Date(receipt.purchase_date);
			return receiptDate.getFullYear() === year && receiptDate.getMonth() === month;
		});

		const totalSpent = monthlyReceipts.reduce((sum, receipt) => sum + (typeof receipt.total_amount === 'number' ? receipt.total_amount : parseFloat(receipt.total_amount || 0)), 0);

		const categorySpending: { [key: string]: number } = {};
		monthlyReceipts.forEach((receipt) => {
			receipt.items.forEach((item) => {
				const category = item.category || "Overig";
				const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
				const itemQuantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity || 1);
				const itemTotal = itemPrice * itemQuantity;
				categorySpending[category] = (categorySpending[category] || 0) + itemTotal;
			});
		});

		const categoryData: CategorySpending[] = Object.entries(categorySpending)
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
	}, [receipts, currentDate]);

	if (loading) {
		return <div className={styles.dashboardPage}>Laden...</div>;
	}

	return (
		<main className={styles.dashboardPage}>
			{!user ? (
				<>
					<h1 className={styles.pageTitle}>Welkom, Gast!</h1>
					<div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
						<p className="label-text" style={{ marginBottom: "20px" }}>
							Je bent nog niet ingelogd.
						</p>
						<Link href="/account">
							<button className="btn btn-primary" style={{ width: "100%" }}>
								Naar Login
							</button>
						</Link>
					</div>
				</>
			) : (
				<div className={styles.dashboardContainer}>
					<div className={styles.welcomeSection}>
						<h1 className={styles.pageTitle}>Welkom, {user.username}!</h1>
						<p className={styles.currentDate}>{formatDate(new Date())}</p>
					</div>

					<div className={styles.ctaSection}>
						<div className="card" style={{ textAlign: "center" }}>
							<h2 className={styles.ctaTitle}>Upload een nieuw ticket</h2>
							<p className={styles.ctaDescription}>
								Voeg je recente aankopen toe om je financiële overzicht up-to-date te houden
							</p>
							<div className={styles.ctaButtonContainer}>
								<Link href="/upload" style={{ flex: 1 }}>
									<button className="btn btn-primary" style={{ width: "100%" }}>
										Upload Ticket
									</button>
								</Link>
								<Link 
									href={`/dashboard/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/all`}
									style={{ flex: 1 }}
								>
									<button className="btn btn-secondary" style={{ width: "100%" }}>
										Bekijk Dashboard
									</button>
								</Link>
							</div>
						</div>
					</div>

					<div className={styles.monthlyOverview}>
						<div className={styles.monthHeader}>
							<button
								className={styles.monthNavButton}
								onClick={goToPreviousMonth}
								aria-label="Vorige maand"
							>
								←
							</button>
							<h2 className={styles.monthTitle}>{formatMonthYear(currentDate)}</h2>
							<button
								className={styles.monthNavButton}
								onClick={goToNextMonth}
								disabled={!canGoNext}
								aria-label="Volgende maand"
								style={{ opacity: canGoNext ? 1 : 0.3, cursor: canGoNext ? "pointer" : "not-allowed" }}
							>
								→
							</button>
						</div>

						{!getMonthlyData.hasReceipts ? (
							<div className={styles.noDataMessage}>
								<p>Geen uitgaven deze maand</p>
							</div>
						) : (
							<div className={styles.statsGrid}>
								<div className={`${styles.statCard} card`}>
									<h3 className={styles.statTitle}>Totaal Uitgegeven</h3>
									<p className={styles.statAmount}>€{getMonthlyData.totalSpent.toFixed(2)}</p>
									
									<div className={styles.combinedContent}>
										<div className={styles.categoryList}>
											{getMonthlyData.categoryData.map((cat, index) => {
												const colors = [
													"#E63946",
													"#2A9D8F",
													"#264653",
													"#F4A261",
													"#E9C46A",
													"#F77F00",
													"#D62828",
													"#06A77D",
												];
												return (
													<div 
														key={cat.name} 
														className={styles.categoryItem}
														onClick={() => navigateToDashboard(cat.name)}
														style={{ cursor: 'pointer' }}
													>
														<div className={styles.categoryInfo}>
															<div 
																className={styles.categoryDot} 
																style={{ background: colors[index % 8] }}
															/>
															<span className={styles.categoryName}>{cat.name}</span>
														</div>
														<span className={styles.categoryAmount}>€{cat.value.toFixed(2)}</span>
													</div>
												);
											})}
										</div>

										<div className={styles.chartContainer}>
											{getMonthlyData.categoryData.length > 0 ? (
												<ResponsiveContainer width="100%" height="100%">
													<PieChart>
														<Pie
															data={getMonthlyData.categoryData}
															cx="50%"
															cy="50%"
															labelLine={false}
															label={(entry) => {
																const total = getMonthlyData.categoryData.reduce((sum, cat) => sum + cat.value, 0);
																const percentage = total > 0 ? ((entry.value || 0) / total) * 100 : 0;
																return `${percentage.toFixed(1)}%`;
															}}
															outerRadius={100}
															fill="#8884d8"
															dataKey="value"
														>
															{getMonthlyData.categoryData.map((entry, index) => (
																<Cell 
																	key={`cell-${index}`} 
																	fill={[
																		"#E63946",
																		"#2A9D8F",
																		"#264653",
																		"#F4A261",
																		"#E9C46A",
																		"#F77F00",
																		"#D62828",
																		"#06A77D",
																	][index % 8]}
																/>
															))}
														</Pie>
														<Tooltip formatter={(value: number | undefined) => `€${(value || 0).toFixed(2)}`} />
														<Legend />
													</PieChart>
												</ResponsiveContainer>
											) : (
												<p className={styles.noDataMessage}>Geen categorie data beschikbaar</p>
											)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</main>
	);
}
