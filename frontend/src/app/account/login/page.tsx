"use client";

import React, { useState, FormEvent } from "react";
import SHA256 from "crypto-js/sha256";
import { useRouter } from "next/navigation";
import styles from "@/styles/layout/Auth.module.css";

export default function LoginPage() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	const [message, setMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [stayLoggedIn, setStayLoggedIn] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const hashPassword = (password: string) => {
		return SHA256(password).toString();
	};

	const switchAuthMode = () => {
		setIsLogin(!isLogin);
		setFormData({ name: "", email: "", password: "" });
		setMessage("");
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage("");

		try {
			const url = isLogin 
				? "http://localhost:5001/api/login" 
				: "http://localhost:5001/api/register";
			const payload = isLogin
				? { email: formData.email, password: hashPassword(formData.password) }
				: { name: formData.name, email: formData.email, password: hashPassword(formData.password) };

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Authenticatie mislukt");
			}

			const data = await response.json();
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			if (stayLoggedIn) {
				localStorage.setItem("stayLoggedIn", "true");
			}

			setMessage(isLogin ? (stayLoggedIn ? "Succesvol ingelogd! Je blijft 5 dagen ingelogd." : "Succesvol ingelogd!") : "Account aangemaakt!");
			setIsSuccess(true);

			// Redirect to home page after 1.5 seconds
			setTimeout(() => {
				router.push("/");
			}, 1500);
		} catch (error: unknown) {
			console.error("API Error:", error);
			setMessage(error instanceof Error ? error.message : "An unknown error occurred");
			setIsSuccess(false);
		} finally {
			setIsLoading(false);
		}
	};

return (
		<div className={styles.authContainer}>
			<div className={styles.authWrapper}>
				<div className="card">
					<div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
						<button 
							type="button" 
							onClick={() => router.push("/")} 
							className="btn btn-secondary" 
							style={{ marginRight: "15px", padding: "8px 16px" }}
							aria-label="Terug naar homepagina"
						>
							← Terug
						</button>
						<h1 className={styles.authTitle} style={{ margin: 0 }}>
							{isLogin ? "Inloggen" : "Registreren"}
						</h1>
					</div>

					<form onSubmit={handleSubmit} className={styles.formStack}>
						{!isLogin && (
							<div>
								<label className="label-text" htmlFor="name">
									Naam
								</label>
								<input 
									type="text" 
									id="name" 
									name="name" 
									value={formData.name} 
									onChange={handleChange} 
									className="input-field" 
									required 
									placeholder="•••••" 
								/>
							</div>
						)}

						<div>
							<label className="label-text" htmlFor="email">
								Email
							</label>
							<input 
								type="email" 
								id="email" 
								name="email" 
								value={formData.email} 
								onChange={handleChange} 
								className="input-field" 
								required 
								placeholder="naam@voorbeeld.com" 
							/>
						</div>

						<div>
							<label className="label-text" htmlFor="password">
								Wachtwoord
							</label>
							<input 
								type="password" 
								id="password" 
								name="password" 
								value={formData.password} 
								onChange={handleChange} 
								className="input-field" 
								required 
								placeholder="••••" 
							/>
						</div>

						{isLogin && (
							<div
								style={{ 
									display: "flex", 
									alignItems: "center", 
									marginBottom: "10px", 
									padding: "8px", 
									backgroundColor: stayLoggedIn ? "#f0f9ff" : "transparent", 
									borderRadius: "6px", 
									border: stayLoggedIn ? "1px solid #0ea5e9" : "1px solid #e5e7eb" 
								}}
							>
								<input 
									type="checkbox" 
									id="stayLoggedIn" 
									checked={stayLoggedIn} 
									onChange={(e) => setStayLoggedIn(e.target.checked)} 
									style={{ marginRight: "8px", transform: "scale(1.1)" }} 
								/>
								<label 
									htmlFor="stayLoggedIn" 
									style={{ 
										fontSize: "14px", 
										cursor: "pointer", 
										color: stayLoggedIn ? "#0369a1" : "#374151", 
										flex: 1 
									}}
								>
									Ingelogd blijven
									<span 
										style={{ 
											display: "block", 
											fontSize: "12px", 
											color: stayLoggedIn ? "#0891b2" : "#6b7280", 
											marginTop: "2px" 
										}}
									>
										Sessie blijft 5 dagen actief
									</span>
								</label>
							</div>
						)}

						{message && <p className={isSuccess ? "success-msg" : "error-msg"}>{message}</p>}

						<div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
							<button type="submit" className="btn btn-primary" disabled={isLoading}>
								{isLoading ? "Bezig..." : (isLogin ? "Inloggen" : "Registreren")}
							</button>
							<button type="button" onClick={switchAuthMode} className="btn btn-secondary">
								{isLogin ? "Registreren" : "Inloggen"}
							</button>
						</div>
					</form>

					<div className={styles.footer}>
						<p>
							{isLogin ? "Nog geen account?" : "Heb je al een account?"}{" "}
							<button 
								onClick={switchAuthMode} 
								className="btn btn-link" 
								style={{ marginLeft: "5px" }}
							>
								{isLogin ? "Registreren hier" : "Log hier in"}
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
