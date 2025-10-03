"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { createWorker } from "tesseract.js";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [imgPreview, setImgPreview] = useState<string>("");
	const [inputImage, setInputImage] = useState<string>("");
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

		if (imgPreview != "") {
			setInputImage(imgPreview);

			const worker = await createWorker("nld");
			const ret = await worker.recognize(imgPreview);
			setFoundText(ret.data.text);
			console.log(ret.data.text);
			await worker.terminate();
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

			{inputImage && (
				<div className={styles.resultContainer}>
					<Image className={styles.img} src={inputImage} alt="uploaded image" width={500} height={500} />
					<pre className={styles.preview}>{foundText}</pre>
				</div>
			)}
		</div>
	);
}
