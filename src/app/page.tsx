"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [inputImage, setInputImage] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const file = imgInputRef.current?.files?.[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setInputImage(objectUrl);
		}
	};

	return (
		<div className={styles.page}>
			<h1>Upload your tickets here!</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				<input ref={imgInputRef} type="file" accept="image/*" />
				<input type="submit" value="Upload" />
			</form>

			{inputImage && (
				<div style={{ marginTop: "20px" }}>
					<Image src={inputImage} alt="uploaded image" width={500} height={500} />
				</div>
			)}
		</div>
	);
}
