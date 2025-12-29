"use client";

import Image from "next/image";
import { Button } from "../ui/Button";
import styles from "@/styles/pages/Upload.module.css";
import { JSX } from "react";

/**
 * Interface defining the properties required for the ImageUpload component.
 */
interface ImageUploadProps {
	/** Reference to the underlying file input element. */
	imgInputRef: React.RefObject<HTMLInputElement | null>;
	/** URL string for the current image preview. */
	imgPreview: string;
	/** Callback function triggered when the file input value changes. */
	onChange: () => void;
	/** Boolean flag indicating if an upload or OCR process is currently running. */
	isLoading: boolean;
	/** Callback function triggered when the form is submitted. */
	onSubmit: (e: React.FormEvent) => void;
}

/**
 * Image upload component.
 * Handles file selection, preview rendering, and form submission for OCR processing.
 * @param {ImageUploadProps} props - The component props containing handlers and state.
 * @returns {JSX.Element} The rendered upload form interface.
 */
export function ImageUpload({ imgInputRef, imgPreview, onChange, isLoading, onSubmit }: Readonly<ImageUploadProps>): JSX.Element {
	return (
		<div className={`card ${styles.uploadCard}`}>
			<form className={styles.ocrForm} onSubmit={onSubmit}>
				<div className={styles.uploadControls}>
					<label htmlFor="image-upload" className="label-text">
						Kies een afbeelding
					</label>

					<input id="image-upload" ref={imgInputRef} required type="file" accept="image/*" onChange={onChange} className={`input-field ${styles.fileInput}`} disabled={isLoading} aria-label="Selecteer afbeelding voor OCR verwerking" />
				</div>

				<div className={styles.uploadButtonContainer}>
					<Button
						type="submit"
						variant="primary"
						disabled={isLoading || !imgPreview}
						className={`${isLoading ? styles.loadingButton : styles.normalButton}`}
						onKeyDown={(e) => {
							if ((e.key === "Enter" || e.key === " ") && !isLoading && imgPreview) {
								onSubmit(e);
							}
						}}
						aria-disabled={isLoading || !imgPreview}
					>
						{isLoading ? "Processing..." : "Upload & Scan"}
					</Button>
				</div>

				<div className={styles.imagePreviewWrapper}>
					{imgPreview ? <Image src={imgPreview} alt="Afbeelding van geselecteerd bon" width={250} height={250} className={styles.previewImage} /> : <span className={styles.noImageText}>Geen afbeelding geselecteerd</span>}
				</div>
			</form>
		</div>
	);
}
