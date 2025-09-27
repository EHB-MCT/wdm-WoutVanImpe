"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { createWorker } from "tesseract.js";

export default function Home() {
	const imgInputRef = useRef<HTMLInputElement | null>(null);
	const [inputImage, setInputImage] = useState<string>("");
	const [foundText, setFoundText] = useState<string>("Loading ...");

	const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const file = imgInputRef.current?.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setInputImage(objectUrl);

      const worker = await createWorker("nld");
      const ret = await worker.recognize(file);
      setFoundText(ret.data.text);
      console.log(ret.data.text);
      await worker.terminate();
    }
  };

	return (
		<div className={styles.page}>
			<h1>Upload your tickets here!</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				<input ref={imgInputRef} required type="file" accept="image/*" />
				<input type="submit" value="Upload" />
			</form>

			{inputImage && (
				<div className={styles.resultContainer}>
					<Image src={inputImage} alt="uploaded image" width={500} height={500} style={{ objectFit: "cover" }} />
					<pre>{foundText}</pre>
				</div>
			)}
		</div>
	);
}
