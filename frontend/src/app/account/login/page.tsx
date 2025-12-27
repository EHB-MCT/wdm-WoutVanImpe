"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MessageDisplay } from "@/components/ui/MessageDisplay";
import { authApi, type LoginRequest, type RegisterRequest } from "@/lib/api";
import { ApiError } from "@/lib/api";
import styles from "@/styles/layout/Auth.module.css";

export default function LoginPage() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	const [message, setMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [stayLoggedIn, setStayLoggedIn] = useState(false);
const [formData, setFormData] = useState<{
		name: string;
		email: string;
		password: string;
	}>({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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
			let data;
			
			if (isLogin) {
				// Login
				const loginData: LoginRequest = {
					email: formData.email,
					password: formData.password,
				};
				data = await authApi.login(loginData);
			} else {
				// Register
				const registerData: RegisterRequest = {
					name: formData.name,
					email: formData.email,
					password: formData.password,
				};
				data = await authApi.register(registerData);
			}

			// Store auth data
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
		} catch (error) {
			console.error("API Error:", error);
			
			if (error instanceof ApiError) {
				setMessage(error.message);
			} else {
				setMessage(error instanceof Error ? error.message : "An unknown error occurred");
			}
			setIsSuccess(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.authContainer}>
			<div className={styles.authWrapper}>
				<div className="card">
					<div className={styles.authHeader}>
						<Button onClick={() => router.push("/")} variant="secondary" className={styles.backButton} aria-label="Terug naar homepagina">
							← Terug
						</Button>
						<h1 className={styles.authTitle}>{isLogin ? "Inloggen" : "Registreren"}</h1>
					</div>

					<form onSubmit={handleSubmit} className={styles.formStack}>
						{!isLogin && (
							<div>
								<label className="label-text" htmlFor="name">
									Naam
								</label>
								<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" required placeholder="•••••" />
							</div>
						)}

						<div>
							<label className="label-text" htmlFor="email">
								Email
							</label>
							<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required placeholder="naam@voorbeeld.com" />
						</div>

						<div>
							<label className="label-text" htmlFor="password">
								Wachtwoord
							</label>
							<input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="input-field" required placeholder="••••" />
						</div>

						{isLogin && (
							<div className={`${styles.stayLoggedInContainer} ${stayLoggedIn ? styles.checked : ""}`}>
								<input type="checkbox" id="stayLoggedIn" checked={stayLoggedIn} onChange={(e) => setStayLoggedIn(e.target.checked)} className={styles.checkboxInput} />
								<label htmlFor="stayLoggedIn" className={styles.checkboxLabel}>
									Ingelogd blijven
									<span className={styles.checkboxSubtext}>Sessie blijft 5 dagen actief</span>
								</label>
							</div>
						)}

						{message && <MessageDisplay message={{ type: isSuccess ? "success" : "error", text: message }} />}

						<div className={styles.formActions}>
							<Button type="submit" variant="primary" disabled={isLoading}>
								{isLoading ? "Bezig..." : isLogin ? "Inloggen" : "Registreren"}
							</Button>
							<Button type="button" onClick={switchAuthMode} variant="secondary">
								{isLogin ? "Registreren" : "Inloggen"}
							</Button>
						</div>
					</form>

					<div className={styles.footer}>
						<p>
							{isLogin ? "Nog geen account?" : "Heb je al een account?"}{" "}
							<Button onClick={switchAuthMode} variant="link" className={styles.linkButton}>
								{isLogin ? "Registreren hier" : "Log hier in"}
							</Button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
