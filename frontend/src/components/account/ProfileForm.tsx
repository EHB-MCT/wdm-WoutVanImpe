"use client";

import React from "react";
import { Button } from "../ui/Button";

/**
 * Interface defining the properties required for the ProfileForm component.
 */
interface ProfileFormProps {
	profileForm: { username: string; email: string };
	onProfileChange: (field: "username" | "email", value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	isLoading: boolean;
	hasChanges: boolean;
}

/**
 * Profile editing form component.
 * Handles user profile updates with change tracking and validation.
 * @param {ProfileFormProps} props - Form data, event handlers, and state flags.
 * @returns {JSX.Element} The rendered profile editing form.
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({ profileForm, onProfileChange, onSave, onCancel, isLoading, hasChanges }) => {
	const isFormValid = profileForm.username.trim() && profileForm.email.trim() && profileForm.email.includes("@");

	/**
	 * Determines whether the save button should be disabled.
	 * The button is disabled if there are no changes, the form is loading, or the input is invalid.
	 * @returns {boolean} True if the button should be disabled.
	 */
	const getButtonDisabledState = () => {
		return !hasChanges || isLoading || !isFormValid;
	};

	return (
		<div>
			<div
				style={{
					padding: "20px",
					backgroundColor: "#f8fafc",
					borderRadius: "8px",
					border: "1px solid #e2e8f0",
				}}
			>
				<div style={{ marginBottom: "16px" }}>
					<label htmlFor="username" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
						Gebruikersnaam
					</label>
					<input id="username" type="text" value={profileForm.username} onChange={(e) => onProfileChange("username", e.target.value)} className="input-field" />
				</div>

				<div style={{ marginBottom: "20px" }}>
					<label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
						Email
					</label>
					<input
						id="email"
						type="email"
						value={profileForm.email}
						onChange={(e) => onProfileChange("email", e.target.value)}
						className="input-field"
						style={{
							width: "100%",
							padding: "10px",
							border: "1px solid #d1d5db",
							borderRadius: "4px",
							fontSize: "1em",
						}}
					/>
				</div>

				<div className="form-actions">
					<Button onClick={onSave} variant="primary" disabled={getButtonDisabledState()}>
						{isLoading ? "Opslaan..." : "Opslaan"}
					</Button>
					<Button onClick={onCancel} variant="secondary">
						Annuleren
					</Button>
				</div>
			</div>
		</div>
	);
};
