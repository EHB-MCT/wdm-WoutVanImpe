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
					<div style={{ display: "flex", alignItems: "center", marginBottom: "30px", justifyContent: "center" }}>
						<h1 className={styles.authTitle} style={{ margin: 0 }}>
							{activeView === 'menu' ? `Hallo, ${user.username}!` : 
							 activeView === 'profile' ? 'Profiel' :
							 activeView === 'password' ? 'Wachtwoord wijzigen' : 'Account'}
						</h1>
					</div>

					{/* Message Display */}
					{message && (
						<div 
							style={{ 
								marginBottom: "20px", 
								padding: "12px", 
								borderRadius: "6px",
								backgroundColor: message.type === "success" ? "#d1fae5" : "#fee2e2",
								color: message.type === "success" ? "#065f46" : "#991b1b",
								border: `1px solid ${message.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
							}}
						>
							{message.text}
						</div>
					)}

					{/* Menu View */}
					{activeView === 'menu' && (
						<div>
							<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
								<button 
									onClick={() => setActiveView('profile')}
									className="btn btn-primary"
									style={{ 
										padding: "16px 24px", 
										fontSize: "1em",
										justifyContent: "flex-start",
										textAlign: "left"
									}}
								>
									👤 Profiel bekijken
								</button>
								
								<button 
									onClick={() => setActiveView('password')}
									className="btn btn-secondary"
									style={{ 
										padding: "16px 24px", 
										fontSize: "1em",
										justifyContent: "flex-start",
										textAlign: "left"
									}}
								>
									🔐 Wachtwoord wijzigen
								</button>
								
								<button 
									onClick={handleLogout}
									className="btn btn-danger"
									style={{ 
										padding: "16px 24px", 
										fontSize: "1em",
										justifyContent: "flex-start",
										textAlign: "left"
									}}
								>
									🚪 Uitloggen
								</button>
							</div>
						</div>
					)}

					{/* Profile View */}
					{activeView === 'profile' && (
						<div>
							<div style={{ 
								padding: "20px", 
								backgroundColor: "#f8fafc", 
								borderRadius: "8px", 
								border: "1px solid #e2e8f0" 
							}}>
								<div style={{ marginBottom: "16px" }}>
									<label htmlFor="account-username" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
										Gebruikersnaam
									</label>
									<input
										id="account-username"
										type="text"
										value={profileForm.username}
										onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
										className="form-control"
										style={{ 
											width: "100%", 
											padding: "10px", 
											border: "1px solid #d1d5db", 
											borderRadius: "4px",
											fontSize: "1em"
										}}
									/>
								</div>
								
								<div style={{ marginBottom: "20px" }}>
									<label htmlFor="account-email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
										Email
									</label>
									<input
										id="account-email"
										type="email"
										value={profileForm.email}
										onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
										className="form-control"
										style={{ 
											width: "100%", 
											padding: "10px", 
											border: "1px solid #d1d5db", 
											borderRadius: "4px",
											fontSize: "1em"
										}}
									/>
								</div>

								<div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
									<button 
										onClick={handleProfileSave}
										className="btn btn-primary"
										disabled={!hasChanges || isLoading || !profileForm.username.trim() || !profileForm.email.trim() || !profileForm.email.includes('@')}
										style={{ 
											opacity: (!hasChanges || isLoading || !profileForm.username.trim() || !profileForm.email.trim() || !profileForm.email.includes('@')) ? 0.6 : 1,
											cursor: (!hasChanges || isLoading || !profileForm.username.trim() || !profileForm.email.trim() || !profileForm.email.includes('@')) ? 'not-allowed' : 'pointer'
										}}
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
						<div>
							<div style={{ 
								padding: "20px", 
								backgroundColor: "#f8fafc", 
								borderRadius: "8px", 
								border: "1px solid #e2e8f0" 
							}}>
								<div style={{ marginBottom: "16px" }}>
									<label htmlFor="account-current-password" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
										Huidig Wachtwoord
									</label>
									<input
										id="account-current-password"
										type="password"
										value={passwordForm.currentPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
										className="form-control"
										placeholder="Voer je huidige wachtwoord in"
										style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "4px" }}
									/>
								</div>
								
								<div style={{ marginBottom: "20px" }}>
									<label htmlFor="account-new-password" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
										Nieuw Wachtwoord (min. 6 tekens)
									</label>
									<input
										id="account-new-password"
										type="password"
										value={passwordForm.newPassword}
										onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
										className="form-control"
										placeholder="Voer je nieuwe wachtwoord in"
										style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "4px" }}
									/>
								</div>

								<div style={{ display: "flex", gap: "10px" }}>
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