"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/Dashboard.module.css";
import { CTASection } from "@/components/dashboard/CTASection";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { removeExpiredTokens, getStoredUser } from "@/lib/auth";
import { User } from "@/types/receipt";
import { GuestWelcome } from "@/components/dashboard/GuestWelcome";

/**
 * Home page component for authenticated and guest users.
 * Displays personalized welcome, spending overview, and navigation to detailed dashboard.
 * @returns {JSX.Element} Home page.
 */
export default function HomePage() {
	const router = useRouter();

	const [user, setUser] = useState<User | null>(null);
	const [currentDate, setCurrentDate] = useState(new Date());
	const { loading, getMonthlyData } = useDashboardData(currentDate);

	useEffect(() => {
		removeExpiredTokens();

		const storedUser = getStoredUser();
		setUser(storedUser);
	}, []);

	/**
	 * Navigates the user to the detailed dashboard view for a specific category.
	 * Constructs the URL using the current year, month, and the selected category filter.
	 * @param {string} category - The category identifier to filter by (or "all").
	 */
	const navigateToDashboard = (category: string) => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth() + 1;

		if (category === "all") {
			router.push(`/dashboard/${year}/${month}/all`);
		} else {
			router.push(`/dashboard/${year}/${month}/all?category=${encodeURIComponent(category)}`);
		}
	};

	/**
	 * Memoized boolean indicating if navigation to the next month is allowed.
	 * Prevents the user from navigating into future months beyond the current real-time date.
	 */
	const canGoNext = useMemo(() => {
		const now = new Date();
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		return nextMonth <= new Date(now.getFullYear(), now.getMonth());
	}, [currentDate]);

	/**
	 * Updates the state to display data for the previous month.
	 */
	const goToPreviousMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
	};

	/**
	 * Updates the state to display data for the next month.
	 */
	const goToNextMonth = () => {
		const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
		setCurrentDate(nextMonth);
	};

	const monthlyData = getMonthlyData(currentDate);

	if (loading) {
		return <div className={styles.dashboardPage}>Laden...</div>;
	}

	return (
		<AuthGuard>
			<main className={styles.dashboardPage}>
				{!user ? (
					<GuestWelcome />
				) : (
					<div className={styles.dashboardContainer}>
						<WelcomeSection user={user} />

						<CTASection currentDate={currentDate} />

						{monthlyData && (
							<MonthlyOverview
								currentDate={currentDate}
								onPreviousMonth={goToPreviousMonth}
								onNextMonth={goToNextMonth}
								canGoNext={canGoNext}
								totalSpent={monthlyData.totalSpent}
								hasReceipts={monthlyData.hasReceipts}
								categoryData={monthlyData.categoryData}
								onCategoryClick={navigateToDashboard}
							/>
						)}
					</div>
				)}
			</main>
		</AuthGuard>
	);
}
