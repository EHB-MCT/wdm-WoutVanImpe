"use client";
import { ValidationResult } from "../utils/receiptValidation";
import styles from "../../components/components.module.css";

interface ValidationFeedbackProps {
  validation: ValidationResult;
  onDismiss?: () => void;
}

export default function ValidationFeedback({ validation, onDismiss }: ValidationFeedbackProps) {
  if (validation.isValid && validation.warnings.length === 0) {
    return null;
  }

  return (
    <div className={styles.validationContainer}>
      {validation.errors.length > 0 && (
        <div className={`${styles.validationSection} ${styles.errorSection}`}>
          <h4 className={styles.validationTitle}>
            ❌ Please fix these errors before saving:
          </h4>
          <ul className={styles.validationList}>
            {validation.errors.map((error, index) => (
              <li key={index} className={styles.validationItem}>
                <strong>
                  {error.itemIndex !== undefined 
                    ? `Item ${error.itemIndex + 1}: ${error.field}`
                    : error.field
                  }:
                </strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className={`${styles.validationSection} ${styles.warningSection}`}>
          <h4 className={styles.validationTitle}>
            ⚠️ Warnings (you can still save):
          </h4>
          <ul className={styles.validationList}>
            {validation.warnings.map((warning, index) => (
              <li key={index} className={styles.validationItem}>
                <strong>
                  {warning.itemIndex !== undefined 
                    ? `Item ${warning.itemIndex + 1}: ${warning.field}`
                    : warning.field
                  }:
                </strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.isValid && validation.warnings.length === 0 && (
        <div className={`${styles.validationSection} ${styles.successSection}`}>
          <p className={styles.successMessage}>
            ✅ All required fields are complete!
          </p>
        </div>
      )}

      {onDismiss && (
        <button 
          onClick={onDismiss}
          className={styles.dismissButton}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}