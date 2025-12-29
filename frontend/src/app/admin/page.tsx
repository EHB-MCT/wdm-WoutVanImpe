"use client";

import { useState, useEffect } from "react";
import { adminApi, AdminUser, GlobalStats } from "@/lib/api/admin";
import { isUserAuthenticated, getStoredUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import styles from "@/styles/pages/Admin.module.css";

/**
 * Main dashboard component for administrators.
 * Displays global statistics, risk distributions, and a list of users for management.
 * @returns {JSX.Element} The rendered admin dashboard page.
 */
export default function AdminDashboard() {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [stats, setStats] = useState<GlobalStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated and has admin role
		const user = getStoredUser();
		if (!isUserAuthenticated() || !user || user.role !== "admin") {
			router.push("/account/login");
			return;
		}

		loadAdminData();
	}, [router]);

	/**
	 * Fetches global statistics and user data from the admin API.
	 * Updates local state with the results or sets an error message on failure.
	 * @returns {Promise<void>}
	 */
	const loadAdminData = async () => {
		try {
			setLoading(true);
			const [usersResponse, statsResponse] = await Promise.all([adminApi.getUsers(), adminApi.getGlobalStats()]);

			if (usersResponse.success && statsResponse.success) {
				setUsers(usersResponse.data);
				setStats(statsResponse.data);
			} else {
				setError("Failed to load admin data");
			}
		} catch (err) {
			setError("Error loading admin dashboard");
			console.error("Admin data loading error:", err);
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Maps a risk level string to a specific CSS class for styling.
	 * @param {string} level - The risk level ('laag', 'gemiddeld', 'hoog').
	 * @returns {string} The corresponding CSS module class name.
	 */
	const getRiskLevelColor = (level: string) => {
		switch (level) {
			case "laag":
				return styles.riskLow;
			case "gemiddeld":
				return styles.riskMedium;
			case "hoog":
				return styles.riskHigh;
			default:
				return styles.riskUnknown;
		}
	};

	/**
	 * Navigates to the detailed profile view of a specific user.
	 * @param {number} userId - The unique identifier of the user.
	 */
	const handleUserClick = (userId: number) => {
		router.push(`/admin/users/${userId}/profile`);
	};

	if (loading) {
		return <div className="loading">Loading admin dashboard...</div>;
	}

	if (error) {
		return <div className="error">{error}</div>;
	}

	return (
		<div className={styles.adminContainer}>
			<div className={styles.header}>
				<h1>Admin Dashboard</h1>
				<p>Beheer en analyseer gebruikersprofielen</p>
			</div>

			{/* Global Statistics */}
			{stats && (
				<div className={styles.statsSection}>
					<h2>Algemene Statistieken</h2>
					<div className={styles.statsGrid}>
						<div className={styles.statCard}>
							<h3>Totaal Gebruikers</h3>
							<span className={styles.statValue}>{stats.total_users}</span>
						</div>
						<div className={styles.statCard}>
							<h3>Totaal Tickets</h3>
							<span className={styles.statValue}>{stats.total_receipts}</span>
						</div>
						<div className={styles.statCard}>
							<h3>Unieke Kaarten</h3>
							<span className={styles.statValue}>{stats.total_unique_cards}</span>
						</div>
						<div className={styles.statCard}>
							<h3>Gem. Kaarten per Gebruiker</h3>
							<span className={styles.statValue}>{stats.average_cards_per_user.toFixed(2)}</span>
						</div>
					</div>

					{/* Risk Distribution */}
					<div className={styles.riskDistribution}>
						<h3>Financieel & Gedragsrisico's</h3>
						<div className={styles.riskBars}>
							<div className={styles.riskBar}>
								<span>Laag:</span>
								<div className={`${styles.bar} ${styles.lowBar}`} style={{ width: `${(stats.risk_distribution.laag / stats.total_users) * 100}%` }}></div>
								<span>{stats.risk_distribution.laag}</span>
							</div>
							<div className={styles.riskBar}>
								<span>Gemiddeld:</span>
								<div className={`${styles.bar} ${styles.mediumBar}`} style={{ width: `${(stats.risk_distribution.gemiddeld / stats.total_users) * 100}%` }}></div>
								<span>{stats.risk_distribution.gemiddeld}</span>
							</div>
							<div className={styles.riskBar}>
								<span>Hoog:</span>
								<div className={`${styles.bar} ${styles.highBar}`} style={{ width: `${(stats.risk_distribution.hoog / stats.total_users) * 100}%` }}></div>
								<span>{stats.risk_distribution.hoog}</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Users Table */}
			<div className={styles.usersSection}>
				<h2>Gebruikersoverzicht</h2>
				<div className={styles.usersTable}>
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Gebruikersnaam</th>
								<th>Email</th>
								<th>Rol</th>
								<th>Risicoscore</th>
								<th>Aantal Tickets</th>
								<th>Betaalkaarten</th>
								<th>Interventie</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user) => (
								<tr key={user.id} className={styles.userRow} onClick={() => handleUserClick(user.id)}>
									<td>{user.id}</td>
									<td>{user.username}</td>
									<td>{user.email}</td>
									<td>{user.role}</td>
									<td>
										<span className={`${styles.riskBadge} ${getRiskLevelColor(user.risk_level)}`}>
											{user.risk_level} ({user.risk_score})
										</span>
									</td>
									<td>{user.total_receipts}</td>
									<td>{user.unique_cards}</td>
									<td>{user.intervention_needed && <span className={styles.interventionBadge}>Ja</span>}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
