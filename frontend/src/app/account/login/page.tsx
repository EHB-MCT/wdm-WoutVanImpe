"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MessageDisplay } from "@/components/ui/MessageDisplay";
import { authApi, type LoginRequest, type RegisterRequest, ApiError } from "@/lib/api";
import styles from "@/styles/layout/Auth.module.css";

/**
 * Login page component for user authentication.
 * Handles both login and registration logic with session persistence.
 * @returns {JSX.Element} The authentication page.
 */
export default function LoginPage() {
	const router = useRouter();

	const [isLogin, setIsLogin] = useState(true);
	const [message, setMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [stayLoggedIn, setStayLoggedIn] = useState(false);

	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
	});

	/**
	 * Updates the form data state when input fields change.
	 * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object.
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	/**
	 * Toggles between login and registration modes.
	 * Resets the form data and clears any existing messages.
	 */
	const switchAuthMode = () => {
		setIsLogin(!isLogin);
		setFormData({ username: "", email: "", password: "" });
		setMessage("");
	};

	/**
	 * Handles the form submission for login or registration.
	 * Performs API calls, manages local storage tokens, and handles redirects.
	 * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
	 * @returns {Promise<void>}
	 */
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setMessage("");

		try {
			let data;

			if (isLogin) {
				const loginData: LoginRequest = {
					email: formData.email,
					password: formData.password,
				};
				data = await authApi.login(loginData);
			} else {
				const registerData: RegisterRequest = {
					username: formData.username,
					email: formData.email,
					password: formData.password,
				};
				data = await authApi.register(registerData);
			}

			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));

			if (stayLoggedIn) {
				localStorage.setItem("stayLoggedIn", "true");
			}

			setMessage(isLogin ? (stayLoggedIn ? "Succesvol ingelogd! Je blijft 5 dagen ingelogd." : "Succesvol ingelogd!") : "Account aangemaakt!");
			setIsSuccess(true);

			// Delay redirect to allow user to read the success message
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
						<h1 className={styles.authTitle}>{isLogin ? "Inloggen" : "Registreren"}</h1>
					</div>

					<form onSubmit={handleSubmit} className={styles.formStack}>
						{!isLogin && (
							<div>
								<label className="label-text" htmlFor="username">
									Gebruikersnaam
								</label>
								<input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="input-field" required placeholder="••••" />
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
								</label>
							</div>
						)}

						{message && <MessageDisplay message={{ type: isSuccess ? "success" : "error", text: message }} />}

						<div className={styles.formActions}>
							<Button type="submit" variant="primary" disabled={isLoading}>
								{isLoading ? "Bezig..." : isLogin ? "Inloggen" : "Registreren"}
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
