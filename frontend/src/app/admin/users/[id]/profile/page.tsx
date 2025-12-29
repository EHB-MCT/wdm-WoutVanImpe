"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, UserProfile } from "@/lib/api/admin";
import { isUserAuthenticated, getStoredUser } from "@/lib/auth";
import styles from "@/styles/pages/Admin.module.css";

export default function UserDetail() {
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const params = useParams();
	const router = useRouter();

	useEffect(() => {
		// Check if user is authenticated and has admin role
		const user = getStoredUser();
		if (!isUserAuthenticated() || !user || user.role !== "admin") {
			router.push("/account/login");
			return;
		}

		const userId = Number.parseInt(params.id as string);
		if (Number.isNaN(userId)) {
			setError("Ongeldig gebruikers ID");
			setLoading(false);
			return;
		}

		loadUserProfile(userId);
	}, [params.id, router]);

	const loadUserProfile = async (userId: number) => {
		try {
			setLoading(true);
			const response = await adminApi.getUserProfile(userId);
			if (response.success) {
				setUserProfile(response.data);
			} else {
				setError("Failed to load user profile");
			}
		} catch (err) {
			setError("Error loading user profile");
			console.error("User profile loading error:", err);
		} finally {
			setLoading(false);
		}
	};

	const getRiskScoreColor = (score: number) => {
		if (score <= 3) return styles.riskLow;
		if (score <= 7) return styles.riskMedium;
		return styles.riskHigh;
	};

	const handleBackClick = () => {
		router.push("/admin");
	};

	if (loading) {
		return <div className="loading">Loading user profile...</div>;
	}

	if (error) {
		return (
			<div className="error">
				<p>{error}</p>
				<button onClick={handleBackClick} className="button">
					Terug naar Admin
				</button>
			</div>
		);
	}

	if (!userProfile) {
		return <div className="error">Geen profiel data gevonden</div>;
	}

	return (
		<div className={styles.adminContainer}>
			<div className={styles.header}>
				<button onClick={handleBackClick} className={`button ${styles.backButton}`}>
					← Terug naar Admin
				</button>
				<h1>Gebruikersprofiel: {userProfile.user.username}</h1>
				<p>
					{userProfile.user.email} • Rol: {userProfile.user.role}
				</p>
			</div>

			{/* Risk Assessment */}
			<div className={styles.riskSection}>
				<h2>Financieel & Gedragsrisico</h2>
				<p className={styles.riskExplanation}>Analyse van financiële risico's (schulden, impulsief aankopen) en gedragsrisico's (verslavingspatronen, stressindicatoren)</p>
				<div className={styles.riskCards}>
					<div className={styles.riskCard}>
						<h3>Algemeen Risico</h3>
						<div className={`${styles.riskScore} ${getRiskScoreColor(userProfile.risk.overall_risk_score)}`}>{userProfile.risk.overall_risk_score}/10</div>
						{userProfile.risk.intervention_needed && <span className={styles.interventionBadge}>Interventie Nodig</span>}
					</div>

					<div className={styles.riskCard}>
						<h3>Risicofactoren</h3>
						<div className={styles.riskFactors}>
							<div className={styles.riskFactor}>
								<span>Meerdere Kaarten:</span>
								<span className={userProfile.risk.risk_factors.multiple_cards === "Hoog" ? styles.riskHigh : userProfile.risk.risk_factors.multiple_cards === "Gemiddeld" ? styles.riskMedium : styles.riskLow}>
									{userProfile.risk.risk_factors.multiple_cards}
								</span>
							</div>
							<div className={styles.riskFactor}>
								<span>Ongezond Gedrag:</span>
								<span className={userProfile.risk.risk_factors.high_sin_activity === "Hoog" ? styles.riskHigh : styles.riskLow}>{userProfile.risk.risk_factors.high_sin_activity}</span>
							</div>
							<div className={styles.riskFactor}>
								<span>Nachtelijke Aankopen:</span>
								<span className={userProfile.risk.risk_factors.night_activity === "Hoog" ? styles.riskHigh : styles.riskLow}>{userProfile.risk.risk_factors.night_activity}</span>
							</div>
						</div>
					</div>

					{userProfile.risk.warnings.length > 0 && (
						<div className={styles.riskCard}>
							<h3>Waarschuwingen</h3>
							<ul className={styles.warningsList}>
								{userProfile.risk.warnings.map((warning, index) => (
									<li key={index} className={styles.warning}>
										⚠️ {warning}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>

			{/* Financial Analysis */}
			<div className={styles.financialSection}>
				<h2>Financiële Analyse</h2>
				<div className={styles.financialCards}>
					<div className={styles.statCard}>
						<h3>Totaal Uitgegeven</h3>
						<span className={styles.statValue}>€{userProfile.financial.total_spent.toFixed(2)}</span>
					</div>
					<div className={styles.statCard}>
						<h3>Transacties</h3>
						<span className={styles.statValue}>{userProfile.financial.transaction_count}</span>
					</div>
					<div className={styles.statCard}>
						<h3>Gemiddelde Transactie</h3>
						<span className={styles.statValue}>€{userProfile.financial.average_transaction.toFixed(2)}</span>
					</div>
					<div className={styles.statCard}>
						<h3>Unieke Kaarten</h3>
						<span className={styles.statValue}>{userProfile.financial.unique_cards_count}</span>
					</div>
				</div>

				{/* Card Details */}
				<div className={styles.cardDetails}>
					<h3>Bekende Kaarten</h3>
					<div className={styles.cardsList}>
						{userProfile.financial.unique_cards.map((card, index) => (
							<span key={index} className={styles.cardBadge}>
								****{card}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Behavioral Analysis */}
			<div className={styles.behaviorSection}>
				<h2>Gedragsanalyse</h2>
				<div className={styles.behaviorCards}>
					<div className={styles.statCard}>
						<h3>Gezondheidsscore</h3>
						<span className={styles.statValue}>{userProfile.behavior.average_health_score.toFixed(0)}/100</span>
					</div>
					<div className={styles.statCard}>
						<h3>Genotmiddelenscore</h3>
						<span className={styles.statValue}>{userProfile.behavior.average_sin_score.toFixed(0)}/100</span>
					</div>
					<div className={styles.statCard}>
						<h3>Impulsiviteitsscore</h3>
						<span className={styles.statValue}>{userProfile.behavior.average_urgency_score.toFixed(1)}/10</span>
					</div>
				</div>

				{/* AI Flags */}
				<div className={styles.aiFlags}>
					<h3>AI-vlaggen</h3>
					<div className={styles.flagsList}>
						{Object.entries(userProfile.behavior.ai_flags).map(([flag, count]) => (
							<div key={flag} className={styles.flagItem}>
								<span>{flag}:</span>
								<span>{count}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Location Analysis */}
			<div className={styles.locationSection}>
				<h2>Locatie & Tijd Analyse</h2>
				<div className={styles.chartsGrid}>
					<div className={styles.chartCard}>
						<h3>Locatie Verdeling</h3>
						<div className={styles.simpleChart}>
							{Object.entries(userProfile.location.location_distribution)
								.sort(([, a], [, b]) => b - a)
								.map(([location, count]) => (
									<div key={location} className={styles.barItem}>
										<span className={styles.barLabel}>{location}</span>
										<div className={styles.barContainer}>
											<div className={styles.barFill} style={{ width: `${(count / Math.max(...Object.values(userProfile.location.location_distribution))) * 100}%` }}></div>
										</div>
										<span className={styles.barValue}>{count}</span>
									</div>
								))}
						</div>
					</div>

					<div className={styles.chartCard}>
						<h3>Tijdscategorie Verdeling</h3>
						<div className={styles.simpleChart}>
							{Object.entries(userProfile.location.time_distribution)
								.sort(([, a], [, b]) => b - a)
								.map(([timeCat, count]) => (
									<div key={timeCat} className={styles.barItem}>
										<span className={styles.barLabel}>{timeCat}</span>
										<div className={styles.barContainer}>
											<div className={styles.barFill} style={{ width: `${(count / Math.max(...Object.values(userProfile.location.time_distribution))) * 100}%` }}></div>
										</div>
										<span className={styles.barValue}>{count}</span>
									</div>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
