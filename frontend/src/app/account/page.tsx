"use client";

import React, { useState, FormEvent } from "react";
import SHA256 from "crypto-js/sha256";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function AuthPage() {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(true);
	const [message, setMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setMessage("");

		if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
			setMessage("Vul alle verplichte velden in.");
			return;
		}

		const hashedPassword = SHA256(formData.password).toString();

		const endpoint = isLogin ? "http://localhost:5000/api/login" : "http://localhost:5000/api/register";

		const payload = isLogin
			? {
					email: formData.email,
					password: hashedPassword,
			  }
			: {
					username: formData.name,
					email: formData.email,
					password: hashedPassword,
			  };

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Er is iets misgegaan.");
			}

	console.log("Succes:", data);

			if (data.token) {
				localStorage.setItem("token", data.token);
				localStorage.setItem("user", JSON.stringify(data.user));
			}

			setMessage(isLogin ? "Succesvol ingelogd!" : "Account aangemaakt!");
			setIsSuccess(true);
			
			// Redirect to home page after 1.5 seconds
			setTimeout(() => {
				router.push("/");
			}, 1500);
		} catch (error: unknown) {
			console.error("API Error:", error);
			setMessage(error instanceof Error ? error.message : "An unknown error occurred");
			setIsSuccess(false);
		}
	};

	return (
		<div className={styles.authContainer}>
			<div className={styles.authWrapper}>
				<div className="card">
					<div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
						<button 
							onClick={() => router.push("/")} 
							className="btn btn-secondary" 
							style={{ marginRight: "15px", padding: "8px 16px" }}
						>
							← Terug
						</button>
						<h1 className={styles.authTitle} style={{ margin: 0 }}>
							{isLogin ? "Welkom Terug" : "Account Maken"}
						</h1>
					</div>

					<form onSubmit={handleSubmit} className={styles.formStack}>
						{!isLogin && (
							<div>
								<label className="label-text" htmlFor="name">
									Naam
								</label>
								<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Jouw naam" />
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
							<input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="input-field" required placeholder="••••••••" />
						</div>

						{message && (
							<p className={isSuccess ? "success-msg" : "error-msg"}>
								{message}
							</p>
						)}

						<button type="submit" className="btn btn-primary">
							{isLogin ? "Inloggen" : "Registreren"}
						</button>
					</form>

					<div className={styles.footer}>
						<p>
							{isLogin ? "Nog geen account?" : "Heb je al een account?"}
							<button onClick={() => setIsLogin(!isLogin)} className="btn btn-link" style={{ marginLeft: "5px" }}>
								{isLogin ? "Registreer hier" : "Log hier in"}
							</button>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
