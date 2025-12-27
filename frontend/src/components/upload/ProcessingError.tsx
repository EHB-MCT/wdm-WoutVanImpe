"use client";


import styles from "@/styles/components/UI.module.css";
import { Button } from "../ui/Button";

interface ProcessingErrorProps {
  errorMessage: string;
  onRetry?: () => void;
  onRetryLater?: () => void;
}

export function ProcessingError({ 
  errorMessage, 
  onRetry, 
  onRetryLater 
}: Readonly<ProcessingErrorProps>) {
  return (
    <div className={styles.errorMessage}>
      <p className={styles.errorText}>
        <strong>❌ Verwerking mislukt:</strong>
      </p>
      <p className={styles.errorDescription}>{errorMessage}</p>
      
      <div className={styles.errorHelp}>
        <p><strong>📷 Wat ging er mis?</strong></p>
        <ul>
          <li>🤖 De AI-analyse kon de structuur van de bon niet herkennen</li>
          <li>📄 De OCR-tekst was wel succesvol geëxtraheerd</li>
        </ul>
        
        <p><strong>📝 U kunt de ruwe tekst handmatig bewerken in de volgende stap</strong></p>
      </div>
      
      <div className={styles.errorActions}>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="primary"
            className={styles.errorButton}
          >
            🔁 Opnieuw proberen
          </Button>
        )}
        
        {onRetryLater && (
          <Button 
            onClick={onRetryLater}
            variant="secondary"
            className={styles.errorButton}
          >
            ⏰ Later proberen
          </Button>
        )}
        
        <div className={styles.errorNote}>
          <p><strong>💡 Tip:</strong> Probeer een duidelijkere foto van de bon voor betere AI-resultaten.</p>
        </div>
      </div>
    </div>
  );
}