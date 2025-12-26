import classNames from "classnames";
import styles from "../../styles/pages/Upload.module.css";

interface LoadingStatesProps {
  isLoading: boolean;
}

export function LoadingStates({ isLoading }: LoadingStatesProps) {
  if (!isLoading) return null;

  return (
    <div className={classNames(styles.loadingContainer)}>
      <strong>Processing receipt...</strong>
      <div>
        <div className={styles.loadingStep}>📷 Extracting text from image...</div>
        <div className={styles.loadingStep}>🤖 Analyzing with AI...</div>
      </div>
    </div>
  );
}