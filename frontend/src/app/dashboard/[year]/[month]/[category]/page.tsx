"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
	Cell, ResponsiveContainer, Tooltip, 
	LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import styles from "./dashboard.module.css";

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
	const [isEditing, setIsEditing] = useState(false);
	const [editedReceipt, setEditedReceipt] = useState<Receipt | null>(null);

	// Parse URL params and validate
	const validCategories = ["Boodschappen", "Huishouden", "Verkeer & Vervoer", "Gezondheid & Zorg", "Vrije Tijd & Uitgaan", "Winkels & Kleding", "Financieel & Diensten", "Overig"];
	
	const { year: yearParam, month: monthParam, category: categoryParam } = params;
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
	const categoryFromQuery = searchParams.get('category');
	const currentCategory = categoryFromQuery && validCategories.includes(categoryFromQuery) 
		? categoryFromQuery 
		: "all";
	
	console.log('Category from query:', categoryFromQuery);
	console.log('Current category:', currentCategory);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
			fetchData();
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (user) {
			fetchData();
		}
	}, [currentDate, currentCategory]);

	const fetchData = async () => {
		try {
			const token = localStorage.getItem("token");
			
			// Fetch receipts
			const receiptsResponse = await fetch("http://localhost:5000/api/receipts", {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (receiptsResponse.ok) {
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

	const goToCurrentDate = () => {
		const now = new Date();
		navigateToMonth(now, "all");
	};

	const resetCategories = () => {
		navigateToMonth(currentDate, "all");
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
			
			const hasCategoryInItems = receipt.items.some(item => item.category === currentCategory);
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
					const itemPrice = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
					const itemQuantity = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1);
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
					const itemPrice = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
					const itemQuantity = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1);
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
		setEditedReceipt(receipt);
		setShowEditModal(true);
		setIsEditing(false);
	};

	const closeReceiptModal = () => {
		setSelectedReceipt(null);
		setEditedReceipt(null);
		setShowEditModal(false);
		setIsEditing(false);
	};

	const startEditing = () => {
		setIsEditing(true);
	};

	const cancelEditing = () => {
		setEditedReceipt(selectedReceipt);
		setIsEditing(false);
	};

const calculateTotalFromItems = (items: ReceiptItem[]): number => {
		return items.reduce((total, item) => {
			const price = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
			const quantity = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1);
			return total + (price * quantity);
		}, 0);
	};

		const updateEditedReceipt = (field: string, value: string | number | ReceiptItem[]) => {
		if (!editedReceipt) return;

		const newData = { ...editedReceipt, [field]: value };

		// Recalculate total if items change
		if (field === 'items') {
			newData.total_amount = calculateTotalFromItems(value as ReceiptItem[]);
		}

		setEditedReceipt(newData);
	};

	const updateItem = (index: number, field: string, value: string | number | null) => {
		if (!editedReceipt?.items) return;
		const updatedItems = [...editedReceipt.items];
		updatedItems[index] = {
			...updatedItems[index],
			[field]: value,
		};

		// Recalculate total from items
		const newTotal = calculateTotalFromItems(updatedItems);
		const newData = {
			...editedReceipt,
			items: updatedItems,
			total_amount: newTotal
		};

		setEditedReceipt(newData);
	};

	const addNewItem = () => {
		if (!editedReceipt) return;
		const newItem = {
			id: Date.now(),
			name: "",
			category: "",
			price: 0,
			quantity: 1
		};
		const newItems = [newItem, ...editedReceipt.items];
		const newTotal = calculateTotalFromItems(newItems);
		setEditedReceipt({
			...editedReceipt,
			items: newItems,
			total_amount: newTotal
		});
	};

	const removeItem = (index: number) => {
		if (!editedReceipt?.items) return;
		const newItems = editedReceipt.items.filter((_, i) => i !== index);
		const newTotal = calculateTotalFromItems(newItems);
		setEditedReceipt({
			...editedReceipt,
			items: newItems,
			total_amount: newTotal
		});
	};

	const getFieldClassName = (value: string | number | null, isQuantity: boolean = false, isPrice: boolean = false) => {
		const baseClass = "input-field";
		const isEmpty = value === null || value === "" || (isQuantity && value === 0) || (isPrice && value === 0);
		return isEmpty ? `${baseClass} incompleteField` : baseClass;
	};

	const saveReceipt = async () => {
		if (!editedReceipt) return;

		// Validation
		if (!editedReceipt.store_name || editedReceipt.store_name.trim() === "") {
			alert("Winkelnaam is verplicht");
			return;
		}

		if (!editedReceipt.purchase_date) {
			alert("Datum is verplicht");
			return;
		}

		const totalAmount = typeof editedReceipt.total_amount === 'number' 
			? editedReceipt.total_amount 
			: Number.parseFloat(editedReceipt.total_amount || 0);
		
		if (totalAmount <= 0) {
			alert("Totaal bedrag moet groter zijn dan 0");
			return;
		}

		if (!editedReceipt.items || editedReceipt.items.length === 0) {
			alert("Er moet minstens één item zijn");
			return;
		}

		// Validate items
		for (let i = 0; i < editedReceipt.items.length; i++) {
			const item = editedReceipt.items[i];
			if (!item.name || item.name.trim() === "") {
				alert(`Item ${i + 1}: Product naam is verplicht`);
				return;
			}

			const price = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
			const quantity = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1);

			if (price <= 0) {
				alert(`Item ${i + 1}: Prijs moet groter zijn dan 0`);
				return;
			}

			if (quantity <= 0) {
				alert(`Item ${i + 1}: Aantal moet groter zijn dan 0`);
				return;
			}
		}

		try {
			const token = localStorage.getItem("token");
			const response = await fetch(`http://localhost:5000/api/receipts/${editedReceipt.id}`, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					store_name: editedReceipt.store_name,
					purchase_date: editedReceipt.purchase_date,
					purchase_time: editedReceipt.purchase_date?.split('T')[1] || "12:00:00",
					total_amount: totalAmount,
					payment_method: editedReceipt.payment_method,
					raw_ocr_text: editedReceipt.raw_ocr_text,
					items: editedReceipt.items.map(item => ({
						name: item.name,
						category: item.category,
						quantity: typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1),
						price: typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0)
					}))
				}),
			});

			if (response.ok) {
				const updatedReceipt = await response.json();
				setReceipts(receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
				setSelectedReceipt(updatedReceipt);
				setEditedReceipt(updatedReceipt);
				setIsEditing(false);
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
			const response = await fetch(`http://localhost:5000/api/receipts/${receiptId}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});

			if (response.ok) {
				setReceipts(receipts.filter(r => r.id !== receiptId));
				closeReceiptModal();
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

	if (loading) {
		return <div className={styles.dashboardPage}>Laden...</div>;
	}

	if (!user) {
		return (
			<main className={styles.dashboardPage}>
				<div className="card" style={{ textAlign: "center", maxWidth: "500px" }}>
					<p className="label-text" style={{ marginBottom: "20px" }}>
						Je moet ingelogd zijn om het dashboard te bekijken.
					</p>
					<Link href="/account">
						<button className="btn btn-primary">Naar Login</button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className={styles.dashboardPage}>
			<div className={styles.dashboardContainer}>
				{/* Header */}
				<div className={styles.dashboardHeader}>
					<Link href="/" className={styles.backButton}>
						← Terug naar homepage
					</Link>
					<h1 className={styles.pageTitle}>Dashboard: {formatMonthYear(currentDate)}</h1>
					{currentCategory !== "all" && (
						<p className={styles.categoryLabel}>Categorie: {currentCategory}</p>
					)}
				</div>

				{/* Controls */}
				<div className={styles.controls}>
					<div className={styles.monthNavigation}>
						<button
							className={styles.monthNavButton}
							onClick={goToPreviousMonth}
							aria-label="Vorige maand"
						>
							←
						</button>
						<span className={styles.monthLabel}>{formatMonthYear(currentDate)}</span>
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

					<div className={styles.filterControls}>
						<select
							className={styles.categoryFilter}
							value={currentCategory}
							onChange={(e) => handleCategoryChange(e.target.value)}
						>
							<option value="all">Alle categorieën</option>
							{validCategories.map(cat => (
								<option key={cat} value={cat}>{cat}</option>
							))}
						</select>

						<button className={styles.controlButton} onClick={goToCurrentDate}>
							Huidige maand
						</button>
						<button className={styles.controlButton} onClick={resetCategories}>
							Reset filters
						</button>
					</div>
				</div>

				{getFilteredData.hasReceipts === false ? (
					<div className={styles.noDataMessage}>
						<p>Geen uitgaven gevonden voor {formatMonthYear(currentDate)}
						{currentCategory !== "all" && ` in categorie ${currentCategory}`}
						</p>
					</div>
				) : (
					<>
						{/* Summary Cards */}
						<div className={styles.summaryCards}>
							<div className={`${styles.summaryCard} card`}>
								<h3 className={styles.summaryTitle}>Totaal Uitgegeven</h3>
								<p className={styles.summaryAmount}>€{getFilteredData.totalSpent.toFixed(2)}</p>
								<p className={styles.summarySubtext}>{getFilteredData.receipts.length} tickets</p>
							</div>
						</div>

						{/* Charts */}
						<div className={styles.chartsGrid}>
							{/* Spending Trend */}
							<div className={`${styles.chartCard} card`}>
								<h3 className={styles.chartTitle}>Dagelijkse Uitgaven</h3>
								<div className={styles.chartContainer}>
									<ResponsiveContainer width="100%" height={300}>
										<LineChart data={getFilteredData.dailySpendingData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="day" label={{ value: 'Dag', position: 'insideBottom', offset: -5 }} />
											<YAxis label={{ value: 'Bedrag (€)', angle: -90, position: 'insideLeft' }} />
											<Tooltip formatter={(value: number | undefined) => `€${(value || 0).toFixed(2)}`} />
											<Line type="monotone" dataKey="amount" stroke="#E63946" strokeWidth={2} />
										</LineChart>
									</ResponsiveContainer>
								</div>
							</div>

							{/* Category Breakdown */}
							<div className={`${styles.chartCard} card`}>
								<h3 className={styles.chartTitle}>Categorie Verdeling</h3>
								<div className={styles.chartContainer}>
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={getFilteredData.categoryData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip formatter={(value: number | undefined) => `€${(value || 0).toFixed(2)}`} />
											<Bar dataKey="value" fill="#2A9D8F">
												{getFilteredData.categoryData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={[
														"#E63946", "#2A9D8F", "#264653", "#F4A261",
														"#E9C46A", "#F77F00", "#D62828", "#06A77D"
													][index % 8]} />
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>

						{/* Receipts List */}
						<div className={styles.receiptsSection}>
							<h2 className={styles.sectionTitle}>Tickets ({getFilteredData.receipts.length})</h2>
							<div className={styles.receiptsList}>
								{getFilteredData.receipts.map((receipt) => (
									<button key={receipt.id} className={`${styles.receiptCard} card`} onClick={() => openReceiptModal(receipt)} type="button">
										<div className={styles.receiptHeader}>
											<h4 className={styles.receiptStore}>{receipt.store_name}</h4>
											<p className={styles.receiptDate}>
												{new Date(receipt.purchase_date).toLocaleDateString("nl-BE")}
											</p>
										</div>
										<div className={styles.receiptDetails}>
											<p className={styles.receiptAmount}>€{(typeof receipt.total_amount === 'number' ? receipt.total_amount : Number.parseFloat(receipt.total_amount || 0)).toFixed(2)}</p>
											<p className={styles.receiptPayment}>{receipt.payment_method}</p>
										</div>
										<div className={styles.receiptItems}>
											{receipt.items.slice(0, 3).map((item, index) => {
												const price = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
												return (
													<div key={`${receipt.id}-${index}`} className={styles.receiptItem}>
														<span>{item.name}</span>
														<span>€{price.toFixed(2)}</span>
													</div>
												);
											})}
											{receipt.items.length > 3 && (
												<p className={styles.receiptMore}>+{receipt.items.length - 3} meer items</p>
											)}
										</div>
									</button>
								))}
							</div>
						</div>
					</>
				)}

				{/* Receipt Modal */}
				{showEditModal && selectedReceipt && (
					<div className={styles.modalBackdrop}>
						<div className={styles.modalContent}>
							<div className={styles.modalHeader}>
								<h2>{editedReceipt?.store_name || selectedReceipt.store_name}</h2>
								<button className={styles.modalCloseButton} onClick={closeReceiptModal}>×</button>
							</div>
							<div className={styles.modalBody}>
								{isEditing === false ? (
									<>
										{/* Receipt Details - View Mode */}
										<div className={styles.receiptDetailsSection}>
											<h3>Ticket Details</h3>
											<div className={styles.detailRow}>
												<strong>Datum:</strong> {new Date(selectedReceipt.purchase_date).toLocaleDateString("nl-BE")}
											</div>
											<div className={styles.detailRow}>
												<strong>Totaal:</strong> €{(typeof selectedReceipt.total_amount === 'number' ? selectedReceipt.total_amount : Number.parseFloat(selectedReceipt.total_amount || 0)).toFixed(2)}
											</div>
										</div>

										{/* Items - View Mode */}
										<div className={styles.itemsSection}>
											<h3>Items ({selectedReceipt.items.length})</h3>
											{selectedReceipt.items.map((item, index) => {
												const price = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price || 0);
												const quantity = typeof item.quantity === 'number' ? item.quantity : Number.parseFloat(item.quantity || 1);
												return (
													<div key={`${selectedReceipt.id}-item-${index}-${item.name}-${item.category}`} className={styles.itemRow}>
														<span>{item.name}</span>
														<span>€{price.toFixed(2)} × {quantity}</span>
														<span className={styles.itemCategory}>{item.category}</span>
													</div>
												);
											})}
										</div>

										{/* Actions - View Mode */}
										<div className={styles.modalActions}>
											<button className="btn btn-primary" onClick={startEditing}>
												Bewerken
											</button>
											<button 
												className="btn btn-danger"
												onClick={() => {
													if (confirm("Weet je zeker dat je dit ticket wilt verwijderen?")) {
															deleteReceipt(selectedReceipt.id);
													}
												}}
											>
												Verwijder Ticket
											</button>
											<button className="btn btn-secondary" onClick={closeReceiptModal}>
												Sluiten
											</button>
										</div>
									</>
								) : (
									<>
										{/* Edit Mode - Using Upload Page Structure */}
										<div className={styles.receiptFormGrid}>
											<div>
												<label htmlFor="store-name" className="label-text">Winkelnaam</label>
												<input 
													id="store-name"
													type="text" 
													value={editedReceipt?.store_name || ""} 
													onChange={(e) => updateEditedReceipt("store_name", e.target.value)}
													className={getFieldClassName(editedReceipt?.store_name || null)}
												/>
											</div>
											<div>
												<label htmlFor="purchase-date" className="label-text">Datum (YYYY-MM-DD)</label>
												<input 
													id="purchase-date"
													type="date" 
													value={editedReceipt?.purchase_date?.split('T')[0] || ""} 
													onChange={(e) => updateEditedReceipt("purchase_date", e.target.value)}
													className={getFieldClassName(editedReceipt?.purchase_date?.split('T')[0] || null)}
												/>
											</div>
											<div>
												<label htmlFor="total-amount" className="label-text">Totaal Bedrag (€)</label>
												<input
													id="total-amount"
													type="number"
													step="0.01"
													value={editedReceipt?.total_amount || 0}
													readOnly
													className="input-field readonly-field"
												/>
												<small style={{ color: 'var(--muted-color)', fontSize: '0.8em', marginTop: '4px', display: 'block' }}>
													Automatically calculated from item prices
												</small>
											</div>
										</div>

										{/* Items Section */}
										<div style={{ marginTop: "20px" }}>
											<div className={styles.itemsHeader}>
												<strong>Items ({editedReceipt?.items?.length || 0}):</strong>
												<button onClick={addNewItem} className="btn btn-secondary">
													+ Add Item
												</button>
											</div>

											{editedReceipt?.items && editedReceipt.items.length > 0 ? (
												<div className={styles.itemsGrid}>
													{editedReceipt.items.map((item, index) => (
														<div key={`${editedReceipt.id}-${item.id || index}`} className={styles.itemCard}>
															<div className={styles.itemFieldsGrid}>
																<div>
																	<label htmlFor={`item-name-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
																		Item Name
																	</label>
																	<input 
																		id={`item-name-${index}`}
																		type="text" 
																		value={item.name || ""} 
																		onChange={(e) => updateItem(index, "name", e.target.value)} 
																		className={getFieldClassName(item.name)}
																		placeholder="Item name" 
																		style={{ fontSize: "0.9em" }} 
																	/>
																</div>
																<div>
																	<label htmlFor={`item-category-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
																		Category
																	</label>
																	<select 
																		id={`item-category-${index}`}
																		value={item.category || ""} 
																		onChange={(e) => updateItem(index, "category", e.target.value)} 
																		className={getFieldClassName(item.category)}
																		style={{ fontSize: "0.9em", width: "100%" }}
																	>
																		<option value="">Selecteer categorie</option>
																		{validCategories.map((category) => (
																			<option key={category} value={category}>
																				{category}
																			</option>
																		))}
																	</select>
																</div>
																<div>
																	<label htmlFor={`item-quantity-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
																		Quantity
																	</label>
																	<input
																		id={`item-quantity-${index}`}
																		type="number"
																		min="0"
																		step="1"
																		value={item.quantity || ""}
																		onChange={(e) => updateItem(index, "quantity", e.target.value ? Number.parseInt(e.target.value) : null)}
																		className={getFieldClassName(item.quantity, true)}
																		placeholder="x"
																		style={{ fontSize: "0.9em" }}
																	/>
																</div>
																<div>
																	<label htmlFor={`item-price-${index}`} className="label-text" style={{ fontSize: "0.8em" }}>
																		Price (€)
																	</label>
																	<input
																		id={`item-price-${index}`}
																		type="number"
																		min="0"
																		step="0.01"
																		value={item.price || ""}
																		onChange={(e) => updateItem(index, "price", e.target.value ? Number.parseFloat(e.target.value) : null)}
																		className={getFieldClassName(item.price, false, true)}
																		placeholder="0.00"
																		style={{ fontSize: "0.9em" }}
																	/>
																</div>
																<div className={styles.itemRemoveBtn}>
																	<button onClick={() => removeItem(index)} className="btn btn-danger">
																		×
																	</button>
																</div>
															</div>
														</div>
													))}
												</div>
											) : (
												<div className={styles.noItemsMessage}>
													No items found. Click "Add Item" to add items manually.
												</div>
											)}
										</div>

										{/* Actions - Edit Mode */}
										<div className={styles.modalActions}>
											<button className="btn btn-secondary" onClick={cancelEditing}>
												Annuleren
											</button>
											<button className="btn btn-primary" onClick={saveReceipt}>
												Opslaan
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
