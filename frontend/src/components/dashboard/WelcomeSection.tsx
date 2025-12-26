'use client';

import React from "react";
import styles from "../../styles/pages/Dashboard.module.css";

interface User {
  id: number;
  username: string;
  email: string;
}

interface WelcomeSectionProps {
  user: User | null;
}

export function WelcomeSection({ user }: Readonly<WelcomeSectionProps>) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("nl-BE", { day: "numeric", month: "long", year: "numeric" });
  };

  if (!user) return null;

  return (
    <div className={styles.welcomeSection}>
      <h1 className={styles.pageTitle}>Welkom, {user.username}!</h1>
      <p className={styles.currentDate}>{formatDate(new Date())}</p>
    </div>
  );
}