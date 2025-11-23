"use client";

import React, { useState, FormEvent } from "react";
import styles from "../page.module.css";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [message, setMessage] = useState("");
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
		if (!formData.email || !formData.password) {
			setMessage("Vul alle verplichte velden in.");
			return;
		}
		console.log(isLogin ? "LOGIN" : "REGISTER", formData);
		setMessage("");
	};

	return (
		<div className={styles.authContainer}>
			<div className={styles.authWrapper}>
				<div className="card">
					<h1 className={styles.authTitle}>{isLogin ? "Welkom Terug" : "Account Maken"}</h1>

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

						{message && <p className="error-msg">{message}</p>}

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
