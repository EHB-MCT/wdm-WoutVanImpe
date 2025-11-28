"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [imgPreview, setImgPreview] = useState<string>("");
	const [foundText, setFoundText] = useState<string>("Loading ...");
	const [imgSubmitted, setImgSubmitted] = useState<boolean>(false);

	const handleChange = () => {
		console.log("change");
		const file = imgInputRef.current?.files?.[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setImgPreview(objectUrl);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setImgSubmitted(true);

		const formData = new FormData();
		formData.append("image", imgInputRef.current!.files![0]);

		try {
			const response = await fetch("http://localhost:3000/OCR", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("OCR request failed");
			}

			const data = await response.json();
			setFoundText(data.text);
		} catch (error) {
			console.error(error);
			setFoundText("OCR failed");
		}
	};

	return (
		<div className={styles.ocrPage}>
			<h1 className={styles.pageTitle}>Upload your tickets here!</h1>

			<div className="card" style={{ maxWidth: "600px", width: "100%" }}>
				<form className={styles.ocrForm} onSubmit={handleSubmit}>
					<div className={styles.uploadControls}>
						<label className="label-text">Kies een afbeelding</label>

						<input ref={imgInputRef} required type="file" accept="image/*" onChange={handleChange} className="input-field" style={{ paddingTop: "10px" }} />

						<button type="submit" className="btn btn-primary">
							Upload & Scan
						</button>
					</div>

					<div className={styles.imagePreviewWrapper}>
						{imgPreview ? <Image src={imgPreview} alt="uploaded image" width={250} height={250} style={{ objectFit: "contain", maxWidth: "100%", height: "auto" }} /> : <span style={{ color: "#9ca3af" }}>Geen afbeelding geselecteerd</span>}
					</div>
				</form>
			</div>

			{imgSubmitted && (
				<div className={styles.textResult}>
					<strong>Gevonden tekst:</strong>
					<pre style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>{foundText}</pre>
				</div>
			)}
		</div>
	);
}
