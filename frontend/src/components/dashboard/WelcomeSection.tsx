"use client";

import React from "react";
import styles from "@/styles/pages/Dashboard.module.css";

interface User {
	id: number;
	username: string;
	email: string;
}

/**
 * Interface defining the properties for the WelcomeSection component.
 */
interface WelcomeSectionProps {
	/** The authenticated user object, or null if not logged in. */
	user: User | null;
}

/**
 * Dashboard welcome header component.
 * Displays the authenticated user's name and the current date formatted in Dutch.
 * @param {WelcomeSectionProps} props - Component props containing the user object.
 * @returns {JSX.Element|null} The welcome header section or null if no user is provided.
 */
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
