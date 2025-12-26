"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/Dashboard.module.css";
import { CTASection } from "@/components/dashboard/CTASection";
import { GuestWelcome } from "@/components/dashboard/GuestWelcome";
import { MonthlyOverview } from "@/components/dashboard/MonthlyOverview";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { removeExpiredTokens, getStoredUser } from "@/lib/auth";
import { User } from "@/types/dashboard";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { loading, getMonthlyData } = useDashboardData(currentDate);

  useEffect(() => {
    // Clean up expired tokens first
    removeExpiredTokens();

    // Get stored user (only if token is valid)
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

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