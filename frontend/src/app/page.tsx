"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
interface User {
	id: number;
	username: string;
	email: string;
}

export default function HomePage() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");

		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}

		setLoading(false);
	}, []);

	if (loading) {
		return <div className={styles.ocrPage}>Laden...</div>;
	}

	return (
		<main className={styles.ocrPage}>
			<h1 className={styles.pageTitle}>Welkom, {user ? user.username : "Gast"}!</h1>

			<div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
				{user ? (
					<>
						<p className="label-text" style={{ marginBottom: "20px" }}>
							Je bent ingelogd als: <br />
							<span style={{ color: "var(--brand-color)" }}>{user.email}</span>
						</p>

						<p style={{ marginBottom: "30px", color: "var(--muted-color)" }}>Je hebt momenteel nog geen recent overzicht. Begin met het uploaden van je eerste ticket.</p>

						<Link href="/upload">
							<button className="btn btn-primary" style={{ width: "100%" }}>
								Start met uploaden
							</button>
						</Link>
					</>
				) : (
					<>
						<p className="label-text" style={{ marginBottom: "20px" }}>
							Je bent nog niet ingelogd.
						</p>
						<Link href="/account">
							<button className="btn btn-primary" style={{ width: "100%" }}>
								Naar Login
							</button>
						</Link>
					</>
				)}
			</div>
		</main>
	);
}
