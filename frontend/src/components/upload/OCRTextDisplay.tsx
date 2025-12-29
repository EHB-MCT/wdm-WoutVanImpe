import styles from "@/styles/pages/Upload.module.css";

/**
 * Interface defining the properties for the OCRTextDisplay component.
 */
interface OCRTextDisplayProps {
	/** The raw string of text extracted from the image via OCR. */
	foundText: string;
}

/**
 * Collapsible display component for raw OCR text.
 * Provides a debugging view to inspect the exact raw output from the OCR engine.
 * Renders a native `<details>` element that is collapsed by default.
 * @param {OCRTextDisplayProps} props - The component props containing the found text.
 * @returns {JSX.Element|null} The rendered details element or null if no text is provided.
 */
export function OCRTextDisplay({ foundText }: Readonly<OCRTextDisplayProps>) {
	if (!foundText) return null;

	return (
		<details className={styles.ocrTextContainer}>
			<summary className={styles.ocrTextSummary}>Show raw OCR text</summary>
			<pre className={styles.ocrTextContent}>{foundText}</pre>
		</details>
	);
}
