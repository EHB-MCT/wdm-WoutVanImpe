"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser, logout, isUserAuthenticated } from "@/lib/auth";
import styles from "@/styles/components/Validation.module.css";

export default function AccountPage() {
	const router = useRouter();
	const [user, setUser] = useState<{ id: number; username: string; email: string } | null>(null);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
	const [activeView, setActiveView] = useState<'menu' | 'profile' | 'password'>('menu');
	const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
	const [profileForm, setProfileForm] = useState({ username: '', email: '' });
	const [hasChanges, setHasChanges] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Auto-hide message after 3 seconds
	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				setMessage(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [message]);

	useEffect(() => {
		if (!isUserAuthenticated()) {
			router.push("/account/login");
			return;
		}
		const storedUser = getStoredUser();
		if (storedUser) {
			setUser(storedUser);
			setProfileForm({ username: storedUser.username, email: storedUser.email });
		}
	}, [router]);

	// Check for profile changes
	useEffect(() => {
		if (user) {
			const changesMade = profileForm.username !== user.username || profileForm.email !== user.email;
			setHasChanges(changesMade);
		}
	}, [profileForm, user]);

	const handleLogout = () => {
		setMessage({ type: "success", text: "Succesvol uitgelogd!" });
		logout();
		setTimeout(() => {
			router.push("/account/login");
		}, 1500);
	};

	const handlePasswordChange = async () => {
		if (!passwordForm.currentPassword || !passwordForm.newPassword) {
			setMessage({ type: "error", text: "Vul beide velden in" });
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			setMessage({ type: "error", text: "Wachtwoord moet minimaal 6 tekens zijn" });
			return;
		}

		setIsLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5001/api/users/password", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					currentPassword: passwordForm.currentPassword,
					newPassword: passwordForm.newPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage({ type: "success", text: "Wachtwoord succesvol gewijzigd!" });
				setPasswordForm({ currentPassword: '', newPassword: '' });
				setActiveView('menu');
			} else {
				setMessage({ type: "error", text: data.error || "Fout bij wijzigen wachtwoord" });
			}
		} catch {
			setMessage({ type: "error", text: "Netwerkfout, probeer opnieuw" });
		} finally {
			setIsLoading(false);
		}
	};

	const handleProfileSave = async () => {
		if (!profileForm.username.trim() || !profileForm.email.trim()) {
			setMessage({ type: "error", text: "Vul beide velden in" });
			return;
		}

		if (!profileForm.email.includes('@')) {
			setMessage({ type: "error", text: "Voer een geldig emailadres in" });
			return;
		}

		setIsLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await fetch("http://localhost:5001/api/users/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					username: profileForm.username,
					email: profileForm.email,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				setMessage({ type: "success", text: "Profiel succesvol bijgewerkt!" });
				setUser(data.user);
				setProfileForm({ username: data.user.username, email: data.user.email });
				setHasChanges(false);
			} else {
				setMessage({ type: "error", text: data.error || "Fout bij bijwerken profiel" });
			}
		} catch {
			setMessage({ type: "error", text: "Netwerkfout, probeer opnieuw" });
		} finally {
			setIsLoading(false);
		}
	};

	const goBack = () => {
		setActiveView('menu');
		setPasswordForm({ currentPassword: '', newPassword: '' });
		if (user) {
			setProfileForm({ username: user.username, email: user.email });
			setHasChanges(false);
		}
	};

	if (!user) {
		return (
			<div className={styles.authContainer}>
				<div className="card">
					<p>Laden...</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.authContainer}>
			<div className={styles.authWrapper}>
				<div className="card">
					{/* Header */}
					<div className={styles.accountHeader}>
						<h1 className={styles.authTitle}>
							{activeView === 'menu' ? `Hallo, ${user.username}!` : 
							 activeView === 'profile' ? 'Profiel' :
							 activeView === 'password' ? 'Wachtwoord wijzigen' : 'Account'}
						</h1>
					</div>

					{/* Message Display */}
					{message && (
						<div className={`${styles.message} ${styles[message.type]}`}>
							{message.text}
						</div>
					)}

					{/* Menu View */}
					{activeView === 'menu' && (
						<div className={styles.menuContainer}>
							<div className={styles.menuButtons}>
								<button 
									onClick={() => setActiveView('profile')}
									className={`btn btn-primary ${styles.menuButton}`}
								>
									👤 Profiel bekijken
								</button>
								
								<button 
									onClick={() => setActiveView('password')}
									className={`btn btn-secondary ${styles.menuButton}`}
								>
									🔐 Wachtwoord wijzigen
								</button>
								
								<button 
									onClick={handleLogout}
									className={`btn btn-danger ${styles.menuButton}`}
								>
									🚪 Uitloggen
								</button>
							</div>
						</div>
					)}

					{/* Profile View */}
					{activeView === 'profile' && (
						<div className={styles.profileView}>
							<div className={styles.profileInfo}>
								<div className={styles.formGroup}>
									<label htmlFor="account-username" className={styles.formLabel}>
										Gebruikersnaam
									</label>
									<input
										id="account-username"
										type="text"
										value={profileForm.username}
										onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
										className="input-field"
									/>
								</div>
								
								<div className={styles.formGroup}>
									<label htmlFor="account-email" className={styles.formLabel}>
										Email
									</label>
									<input
										id="account-email"
										type="email"
										value={profileForm.email}
										onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
										className="input-field"
									/>
								</div>

								<div className={styles.formActions}>
									<button 
										onClick={handleProfileSave}
										className={`btn btn-primary ${!hasChanges || isLoading || !profileForm.username.trim() || !profileForm.email.trim() || !profileForm.email.includes('@') ? styles.disabled : ''}`}
										disabled={!hasChanges || isLoading || !profileForm.username.trim() || !profileForm.email.trim() || !profileForm.email.includes('@')}
									>
										{isLoading ? "Opslaan..." : "Opslaan"}
									</button>
									<button 
										onClick={goBack}
										className="btn btn-secondary"
									>
										Annuleren
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Password Change View */}
					{activeView === 'password' && (
						<div className={styles.passwordView}>
							<div className={styles.profileInfo}>
								<div className={styles.formGroup}>
									<label htmlFor="account-current-password" className={styles.formLabel}>
										Huidig Wachtwoord
									</label>
									<input
										id="account-current-password"
										type="password"
										value={passwordForm.currentPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
										className="input-field"
										placeholder="Voer je huidige wachtwoord in"
									/>
								</div>
								
								<div className={styles.formGroup}>
									<label htmlFor="account-new-password" className={styles.formLabel}>
										Nieuw Wachtwoord (min. 6 tekens)
									</label>
									<input
										id="account-new-password"
										type="password"
										value={passwordForm.newPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
										className="input-field"
										placeholder="Voer je nieuwe wachtwoord in"
									/>
								</div>

								<div className={styles.formActions}>
									<button 
										onClick={handlePasswordChange}
										className="btn btn-primary"
										disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
									>
										{isLoading ? "Opslaan..." : "Wachtwoord wijzigen"}
									</button>
									<button 
										onClick={goBack}
										className="btn btn-secondary"
									>
										Annuleren
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}