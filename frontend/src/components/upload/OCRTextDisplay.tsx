import styles from "../../styles/pages/Upload.module.css";

interface OCRTextDisplayProps {
  foundText: string;
}

export function OCRTextDisplay({ foundText }: OCRTextDisplayProps) {
  if (!foundText) return null;

  return (
    <details className={styles.ocrTextContainer}>
      <summary className={styles.ocrTextSummary}>Show raw OCR text</summary>
      <pre className={styles.ocrTextContent}>{foundText}</pre>
    </details>
  );
}