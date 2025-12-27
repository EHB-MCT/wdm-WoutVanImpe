"use client";
import { ValidationResult } from "@/lib/receiptValidation";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/ValidationModal.module.css";

interface ValidationModalProps {
	validation: ValidationResult;
	isOpen: boolean;
	onClose: () => void;
	onContinue?: () => void;
}

export function ValidationModal({ validation, isOpen, onClose, onContinue }: Readonly<ValidationModalProps>) {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

return (
		<div className={styles.modalBackdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Close validation modal">
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>{validation.isValid ? "✅ Validation Complete" : "❌ Validation Issues Found"}</h3>
					<button onClick={onClose} className={styles.modalCloseButton} aria-label="Close validation modal">
						×
					</button>
				</div>

				<div className={styles.modalBody}>
					{validation.errors.length > 0 && (
						<div className={`${styles.validationSection} ${styles.errorSection}`}>
							<h4 className={styles.validationTitle}>❌ Please fix these errors before saving:</h4>
							<ul className={styles.validationList}>
								{validation.errors.map((error) => (
									<li key={`error-${error.field}-${error.itemIndex || "general"}-${error.message.substring(0, 20)}`} className={styles.validationItem}>
										<strong>{error.itemIndex !== undefined ? `Item ${error.itemIndex + 1}: ${error.field}` : error.field}:</strong> {error.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{validation.warnings.length > 0 && (
						<div className={`${styles.validationSection} ${styles.warningSection}`}>
							<h4 className={styles.validationTitle}>⚠️ Warnings (you can still save):</h4>
							<ul className={styles.validationList}>
								{validation.warnings.map((warning) => (
									<li key={`warning-${warning.field}-${warning.itemIndex || "general"}-${warning.message.substring(0, 20)}`} className={styles.validationItem}>
										<strong>{warning.itemIndex !== undefined ? `Item ${warning.itemIndex + 1}: ${warning.field}` : warning.field}:</strong> {warning.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{validation.isValid && validation.warnings.length === 0 && (
						<div className={`${styles.validationSection} ${styles.successSection}`}>
							<p className={styles.successMessage}>✅ All required fields are complete and valid!</p>
						</div>
					)}
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={validation.isValid && onContinue ? onContinue : onClose} variant={validation.isValid ? "primary" : "secondary"} disabled={!validation.isValid}>
						{validation.isValid ? "Continue" : "Fix Issues"}
					</Button>
				</div>
			</div>
		</div>
	);
}
