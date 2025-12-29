import styles from "@/styles/pages/Upload.module.css";

/**
 * Interface defining the properties for the LoadingStates component.
 */
interface LoadingStatesProps {
	/** Boolean flag indicating whether a loading process is currently active. */
	isLoading: boolean;
}

/**
 * Simple loading indicator for the upload process.
 * Renders a visual cue (spinner/text) when the application is in a loading state.
 * @param {LoadingStatesProps} props - The component props containing the loading state flag.
 * @returns {JSX.Element|null} The rendered loading indicator or null if not loading.
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
