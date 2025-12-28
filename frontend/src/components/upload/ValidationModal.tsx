"use client";

import { ValidationResult } from "@/lib/receiptValidation";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/components/ValidationModal.module.css";
import { JSX } from "react";

interface ValidationModalProps {
	validation: ValidationResult;
	isOpen: boolean;
	onClose: () => void;
	onResetForm?: () => void;
	onContinue?: () => void;
}

/**
 * Modal for displaying validation feedback (success, errors, warnings).
 * Prevents saving invalid receipts and provides actionable feedback.
 */
export function ValidationModal({ validation, isOpen, onClose, onContinue, onResetForm }: Readonly<ValidationModalProps>): JSX.Element | null {
	if (!isOpen) return null;

	const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>): void => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>): void => {
		if (e.key === "Escape") {
			onClose();
		}
	};

	const isSaveSuccess = validation.success && validation.isValid;
	const isSaveError = validation.errors.some((error) => error.field === "Save Error");
	const hasIssues = validation.errors.length > 0 || validation.warnings.length > 0;

	// Determine modal title based on state
	const getModalTitle = () => {
		if (isSaveSuccess) return "✅ Bon Opgeslagen";
		if (isSaveError) return "❌ Fout bij Opslaan";
		if (validation.isValid) return "✅ Bon Klaar om Opslaan";
		return "❌ Validatiefouten Gevonden";
	};

	// Determine primary button label
	const getButtonLabel = () => {
		if (isSaveSuccess) return "OK";
		if (isSaveError) return "Sluiten";
		if (validation.isValid) return "Doorgaan";
		return "Probleem Oplossen";
	};

	// Determine primary button action
	const handleMainAction = () => {
		if (isSaveSuccess) {
			onClose();
			if (onResetForm) onResetForm();
			return;
		}
		if (isSaveError) {
			onClose();
			return;
		}
		if (validation.isValid && onContinue) {
			onContinue();
			return;
		}
		onClose();
	};

	return (
		<dialog className={styles.modalBackdrop} onClick={handleBackdropClick} onKeyDown={handleKeyDown} open aria-label="Close validation modal">
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h3 className={styles.modalTitle}>{getModalTitle()}</h3>

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
								{validation.errors.map((error, i) => (
									<li key={`save-error-${i}`} className={styles.validationItem}>
										{error.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{!isSaveSuccess && !isSaveError && hasIssues && (
						<div className={`${styles.validationSection} ${styles.errorSection}`}>
							<h4 className={styles.validationTitle}>❌ Corrigeer deze fouten voordat u opslaat:</h4>
							<ul className={styles.validationList}>
								{[...validation.errors, ...validation.warnings].map((issue, index) => (
									<li key={`issue-${index}-${issue.field}`} className={styles.validationItem}>
										<strong>{issue.itemIndex !== undefined ? `Artikel ${issue.itemIndex + 1}: ${issue.field}` : issue.field}:</strong> {issue.message}
									</li>
								))}
							</ul>
						</div>
					)}

					{!isSaveSuccess && !isSaveError && validation.isValid && validation.warnings.length === 0 && onContinue && (
						<div className={`${styles.validationSection} ${styles.successSection}`}>
							<p className={styles.successMessage}>✅ Klik op &quot;Doorgaan&quot; om uw bon op te slaan.</p>
						</div>
					)}
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={handleMainAction} variant="primary">
						{getButtonLabel()}
					</Button>
				</div>
			</div>
		</dialog>
	);
}
