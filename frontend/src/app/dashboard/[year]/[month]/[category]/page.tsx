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
import { removeExpiredTokens, isUserAuthenticated } from "@/lib/auth";
import { VALID_CATEGORIES } from "@/lib/constants";
import { safeParseNumber, safeParseInt } from "@/lib/receiptUtils";
import { receiptsApi, type Receipt } from "@/lib/api/receipts";
import type { User, CategorySpending, ReceiptItem } from "@/types/receipt";

interface FilteredData {
    totalSpent: number;
    receipts: Receipt[];
    dailySpendingData: Array<{ day: number; amount: number }>;
    categoryData: CategorySpending[];
    storeData: Array<{ name: string; count: number }>;
    hasReceipts: boolean;
    loading: boolean;
}

/**
 * Dynamic dashboard page.
 * Displays filtered receipts, spending analysis, and charts for selected time period.
 * @returns {JSX.Element} Dashboard with navigation and analysis.
 */
export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    
    const [user, setUser] = useState<User | null>(null);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const { year: yearParam, month: monthParam } = params;
    const searchParams = useSearchParams();

    const currentDate = useMemo(() => {
        const year = yearParam ? Number.parseInt(yearParam as string) : new Date().getFullYear();
        // JavaScript months are 0-indexed (0 = Jan, 11 = Dec)
        const month = monthParam ? Number.parseInt(monthParam as string) - 1 : new Date().getMonth(); 

        const now = new Date();
        const validYear = Number.isNaN(year) || year < 2020 || year > 2030 ? now.getFullYear() : year;
        const validMonth = Number.isNaN(month) || month < 0 || month > 11 ? now.getMonth() : month;

        return new Date(validYear, validMonth, 1);
    }, [yearParam, monthParam]);

    // Use query parameters for category to avoid route nesting issues
    const categoryFromQuery = searchParams.get("category");
    const currentCategory = categoryFromQuery && VALID_CATEGORIES.includes(categoryFromQuery as (typeof VALID_CATEGORIES)[number]) ? categoryFromQuery : "all";

    useEffect(() => {
        removeExpiredTokens();

        if (isUserAuthenticated()) {
            const storedUser = globalThis.localStorage?.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchData();
            }
        }
        setLoading(false);
    }, [setUser]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [currentDate, currentCategory, user]);

    const fetchData = async () => {
        try {
            removeExpiredTokens();

            if (!isUserAuthenticated()) {
                throw new Error("Niet ingelogd");
            }

            const data = await receiptsApi.getAll();
            setReceipts(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const navigateToMonth = (date: Date, category: string) => {
        const year = date.getFullYear();
        // URL months are 1-indexed for user readability
        const month = date.getMonth() + 1; 
        router.push(`/dashboard/${year}/${month}/all?category=${encodeURIComponent(category)}`);
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

    const handleCategoryChange = (category: string) => {
        navigateToMonth(currentDate, category);
    };

    const formatMonthYear = (date: Date): string => {
        return date.toLocaleDateString("nl-BE", { month: "long", year: "numeric" });
    };

    const getFilteredData = useMemo((): FilteredData => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthlyReceipts = receipts.filter((receipt: Receipt) => {
            const receiptDate = new Date(receipt.purchase_date);
            const dateMatch = receiptDate.getFullYear() === year && receiptDate.getMonth() === month;

            if (currentCategory === "all") return dateMatch;

            const hasCategoryInItems = receipt.items.some((item) => item.category === currentCategory);
            return dateMatch && hasCategoryInItems;
        });

        const dailySpending: { [key: string]: number } = {};
        monthlyReceipts.forEach((receipt: Receipt) => {
            const day = new Date(receipt.purchase_date).getDate();

            let categoryAmount = 0;
            receipt.items.forEach((item: ReceiptItem) => {
                // Ensure we only calculate costs for the currently selected filter
                if (currentCategory === "all" || item.category === currentCategory) {
                    const itemPrice = safeParseNumber(item.price);
                    const itemQuantity = safeParseInt(item.quantity);
                    categoryAmount += itemPrice * itemQuantity;
                }
            });

            if (categoryAmount > 0) {
                dailySpending[day] = (dailySpending[day] || 0) + categoryAmount;
            }
        });

        const dailySpendingData = Object.entries(dailySpending)
            .map(([day, amount]) => ({ day: Number.parseInt(day), amount }))
            .sort((a, b) => a.day - b.day);

        const categorySpending: { [key: string]: number } = {};
        monthlyReceipts.forEach((receipt: Receipt) => {
            receipt.items.forEach((item: ReceiptItem) => {
                const category = item.category || "Overig";

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

        const storeFrequency: { [key: string]: number } = {};
        monthlyReceipts.forEach((receipt: Receipt) => {
            const storeName = receipt.store_name || "Onbekend";
            storeFrequency[storeName] = (storeFrequency[storeName] || 0) + 1;
        });

        const storeData = Object.entries(storeFrequency)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const totalSpent = categoryData.reduce((sum, category) => sum + category.value, 0);

        return {
            totalSpent,
            receipts: monthlyReceipts,
            dailySpendingData,
            categoryData,
            storeData,
            hasReceipts: monthlyReceipts.length > 0,
        } as FilteredData;
    }, [currentDate, currentCategory, receipts]);

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
            // Extract just the date part from the purchase_date
            const datePart = updatedReceipt.purchase_date ? String(updatedReceipt.purchase_date).split("T")[0] : "";
            
            const updatedData = await receiptsApi.update(updatedReceipt.id, {
                store_name: updatedReceipt.store_name,
                purchase_date: datePart,
                purchase_time: updatedReceipt.purchase_time || "12:00",
                total_amount: updatedReceipt.total_amount,
                payment_method: updatedReceipt.payment_method,
                items: updatedReceipt.items.map((item: ReceiptItem) => ({
                    name: item.name,
                    category: item.category,
                    quantity: safeParseInt(item.quantity),
                    price: safeParseNumber(item.price),
                    id: item.id,
                })),
            });

            setReceipts(receipts.map((r) => (r.id === updatedReceipt.id ? updatedData : r)));
        } catch (error) {
            console.error("Error updating receipt:", error);
            alert("Er is een fout opgetreden bij het opslaan");
        }
    };

    const deleteReceipt = async (receiptId: number) => {
        try {
            await receiptsApi.delete(receiptId);
            setReceipts(receipts.filter((r) => r.id !== receiptId));
        } catch (error) {
            console.error("Error deleting receipt:", error);
        }
    };

    const canGoNext = useMemo(() => {
        const now = new Date();
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
        return nextMonth <= new Date(now.getFullYear(), now.getMonth());
    }, [currentDate]);

    const filteredData: FilteredData = getFilteredData;

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
                            <div className={styles.summaryCards}>
                                <SummaryCard title="Totaal Uitgegeven" amount={filteredData.totalSpent} subtitle={`${filteredData.receipts.length} tickets`} />
                            </div>

                            <div className={styles.chartsGrid}>
                                <div className={`${styles.chartCard} card`}>
                                    <h3 className={styles.chartTitle}>Dagelijkse Uitgaven</h3>
                                    <div className={styles.chartContainer}>
                                        <SpendingTrendChart data={filteredData.dailySpendingData} height={300} />
                                    </div>
                                </div>

                                <div className={`${styles.chartCard} card`}>
                                    <h3 className={styles.chartTitle}>Categorie Verdeling</h3>
                                    <div className={styles.chartContainer}>
                                        <CategoryChart data={filteredData.categoryData} height={300} />
                                    </div>
                                </div>
                            </div>

                            <ReceiptsList receipts={filteredData.receipts} onReceiptClick={openReceiptModal} className={styles.receiptsSection} />
                        </>
                    )}

                    <ReceiptModal receipt={selectedReceipt} isOpen={showEditModal} onClose={closeReceiptModal} onSave={saveReceipt} onDelete={deleteReceipt} />
                </div>
            </main>
        </AuthGuard>
    );
}