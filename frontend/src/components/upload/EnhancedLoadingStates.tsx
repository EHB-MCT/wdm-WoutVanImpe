import classNames from "classnames";
import styles from "@/styles/pages/Upload.module.css";

export type ProcessingStep = "idle" | "uploading" | "ocr-processing" | "ocr-complete" | "ai-processing" | "ai-complete" | "error" | "success";

interface StepInfo {
	id: ProcessingStep;
	label: string;
	icon: string;
	description: string;
}

const PROCESSING_STEPS: StepInfo[] = [
	{
		id: "uploading",
		label: "Uploaden",
		icon: "📤",
		description: "Afbeelding wordt verwerkt...",
	},
	{
		id: "ocr-processing",
		label: "OCR Analyse",
		icon: "📷",
		description: "Tekst wordt geëxtraheerd uit afbeelding...",
	},
	{
		id: "ocr-complete",
		label: "OCR Voltooid",
		icon: "✅",
		description: "Tekst succesvol geëxtraheerd",
	},
	{
		id: "ai-processing",
		label: "AI Analyse",
		icon: "🤖",
		description: "Data wordt geanalyseerd met AI...",
	},
	{
		id: "ai-complete",
		label: "AI Voltooid",
		icon: "✅",
		description: "Data succesvol geanalyseerd",
	},
	{
		id: "success",
		label: "Verwerking Voltooid",
		icon: "🎉",
		description: "Bon succesvol verwerkt!",
	},
	{
		id: "error",
		label: "Fout opgetreden",
		icon: "❌",
		description: "Er is een fout opgetreden bij het verwerken",
	},
];

interface EnhancedLoadingStatesProps {
	currentStep: ProcessingStep;
	errorMessage?: string;
	progress?: number;
}

/**
 * Visualizes the multi-step processing workflow (Upload -> OCR -> AI).
 */
export function EnhancedLoadingStates({ currentStep, errorMessage, progress = 0 }: Readonly<EnhancedLoadingStatesProps>) {
	if (currentStep === "idle") return null;

	const getStepStatus = (step: ProcessingStep): "pending" | "active" | "completed" | "error" => {
		if (step === "error") return "error";

		const stepIndex = PROCESSING_STEPS.findIndex((s) => s.id === step);
		const currentIndex = PROCESSING_STEPS.findIndex((s) => s.id === currentStep);

		if (stepIndex < currentIndex) return "completed";
		if (stepIndex === currentIndex) return "active";
		return "pending";
	};

	const getStepClassName = (status: "pending" | "active" | "completed" | "error") => {
		switch (status) {
			case "pending":
				return styles.stepPending;
			case "active":
				return styles.stepActive;
			case "completed":
				return styles.stepCompleted;
			case "error":
				return styles.stepError;
			default:
				return styles.stepPending;
		}
	};

	const currentStepInfo = PROCESSING_STEPS.find((step) => step.id === currentStep);

	return (
		<div className={classNames(styles.loadingContainer, styles.enhancedLoading)}>
			<div className={styles.loadingHeader}>
				<div className={styles.loadingIcon}>{currentStepInfo?.icon || "⏳"}</div>

				<div className={styles.loadingTitle}>
					<strong>{currentStepInfo?.label || "Verwerken..."}</strong>
					{currentStepInfo?.description && <p className={styles.loadingDescription}>{currentStepInfo.description}</p>}
				</div>
			</div>

			{/* Display only the core processing steps (indices 1-4) in the visual stepper */}
			<div className={styles.stepsContainer}>
				{PROCESSING_STEPS.slice(1, 5).map((step, index) => {
					const status = getStepStatus(step.id);
					return (
						<div key={step.id} className={classNames(styles.stepItem, getStepClassName(status))}>
							<div className={styles.stepIcon}>{status === "active" ? <div className={styles.spinner}>⏳</div> : step.icon}</div>

							<div className={styles.stepContent}>
								<div className={styles.stepLabel}>{step.label}</div>
								<div className={styles.stepDescription}>{step.description}</div>
							</div>

							{index < 3 && (
								<div
									className={classNames(styles.stepConnector, {
										[styles.stepConnectorCompleted]: status === "completed" || getStepStatus(PROCESSING_STEPS[index + 2].id) === "completed",
									})}
								/>
							)}
						</div>
					);
				})}
			</div>

			{progress > 0 && (
				<div className={styles.progressContainer}>
					<div className={styles.progressBar}>
						<div className={styles.progressFill} style={{ width: `${progress}%` }} />
					</div>
					<span className={styles.progressText}>{progress}%</span>
				</div>
			)}

			{errorMessage && (
				<div className={styles.errorMessage}>
					<strong>❌ Fout opgetreden:</strong>
					<p>{errorMessage}</p>
				</div>
			)}
		</div>
	);
}
