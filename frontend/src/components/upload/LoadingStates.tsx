import styles from "@/styles/pages/Upload.module.css";

interface LoadingStatesProps {
	isLoading: boolean;
}

/**
 * Simple loading indicator for the upload process.
 */
export function LoadingStates({ isLoading }: Readonly<LoadingStatesProps>) {
	if (!isLoading) return null;

	return (
		<div className={styles.loadingContainer}>
			<div className={styles.loadingIcon}>⏳</div>
			<p>Verwerken...</p>
		</div>
	);
}
