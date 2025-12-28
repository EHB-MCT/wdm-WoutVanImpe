"use client";
import { ValidationResult } from "@/lib/receiptValidation";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/ValidationModal.module.css";

interface ValidationModalProps {
	validation: ValidationResult;
	isOpen: boolean;
	onClose: () => void;
	onContinue?: () => void;
	onResetForm?: () => void;
}

export function ValidationModal({ validation, isOpen, onClose, onContinue, onResetForm }: Readonly<ValidationModalProps>) {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			onClose();
		}
	};

const isSaveSuccess = validation.success && validation.isValid;
	const isSaveError = validation.errors.some(error => error.field === "Save Error");

	return (
		<dialog 
			className={styles.modalBackdrop} 
			onClick={handleBackdropClick} 
			onKeyDown={handleKeyDown}
			open
			aria-label="Close validation modal"
		>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>
						{isSaveSuccess ? "✅ Bon Opgeslagen" : 
						 isSaveError ? "❌ Fout bij Opslaan" :
						 validation.isValid ? "✅ Bon Klaar om Opslaan" :
						 "❌ Validatiefouten Gevonden"}
					</h3>
					<button onClick={onClose} className={styles.modalCloseButton} aria-label="Close validation modal">
						×
					</button>
				</div>

				<div className={styles.modalBody}>
					{isSaveSuccess && (
						<div className={`${styles.validationSection} ${styles.successSection}`}>
							<p className={styles.successMessage}>✅ {validation.success}</p>
						</div>
					)}

					{isSaveError && (
						<div className={`${styles.validationSection} ${styles.errorSection}`}>
							<h4 className={styles.validationTitle}>❌ Fout bij opslaan:</h4>
							<ul className={styles.validationList}>
								{validation.errors.map((error) => (
									<li key={`error-${error.field}-${error.itemIndex || "general"}-${error.message.substring(0, 20)}`} className={styles.validationItem}>
										{error.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{!isSaveSuccess && !isSaveError && (validation.errors.length > 0 || validation.warnings.length > 0) && (
						<div className={`${styles.validationSection} ${styles.errorSection}`}>
							<h4 className={styles.validationTitle}>❌ Corrigeer deze fouten voordat u opslaat:</h4>
							<ul className={styles.validationList}>
								{[...validation.errors, ...validation.warnings].map((issue, index) => (
									<li key={`issue-${index}-${issue.field}-${issue.itemIndex || "general"}-${issue.message.substring(0, 20)}`} className={styles.validationItem}>
										<strong>{issue.itemIndex !== undefined ? `Artikel ${issue.itemIndex + 1}: ${issue.field}` : issue.field}:</strong> {issue.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{!isSaveSuccess && !isSaveError && validation.isValid && validation.warnings.length === 0 && onContinue && (
						<div className={`${styles.validationSection} ${styles.successSection}`}>
							<p className={styles.successMessage}>✅ Klik op "Doorgaan" om uw bon op te slaan.</p>
						</div>
					)}
				</div>

				<div className={styles.modalFooter}>
					<Button 
						onClick={
							isSaveSuccess ? () => {
								onClose();
								if (onResetForm) onResetForm();
							} :
							isSaveError ? onClose :
							validation.isValid && onContinue ? onContinue : onClose
						}
						variant="primary"
					>
						{isSaveSuccess ? "OK" : isSaveError ? "Sluiten" : validation.isValid ? "Doorgaan" : "Probleem Oplossen"}
					</Button>
				</div>
			</div>
		</dialog>
	);
}
