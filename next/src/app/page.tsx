"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [imgPreview, setImgPreview] = useState<string>("");
	const [foundText, setFoundText] = useState<string>("Loading ...");

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
		<div className={styles.page}>
			<h1>Upload your tickets here!</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				<div className={styles.input}>
					<input ref={imgInputRef} required type="file" accept="image/*" onChange={handleChange} />
					<input type="submit" value="Upload" />
				</div>
				<div className={styles.selectedImg} style={{ width: 250, height: 250 }}>
					{imgPreview && <Image className={styles.img} src={imgPreview} alt="uploaded image" width={250} height={250} />}
				</div>
			</form>

			<pre className={styles.preview}>{foundText}</pre>
		</div>
	);
}
