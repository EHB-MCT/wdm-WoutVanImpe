import styles from "../../components/components.module.css";

interface OCRTextDisplayProps {
	foundText: string;
}

export default function OCRTextDisplay({ foundText }: OCRTextDisplayProps) {
	if (!foundText) return null;

	return (
		<details className={styles.ocrTextContainer}>
			<summary className={styles.ocrTextSummary}>Show raw OCR text</summary>
			<pre className={styles.ocrTextContent}>{foundText}</pre>
		</details>
	);
}
