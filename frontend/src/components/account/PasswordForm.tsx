"use client";

import React from "react";
import { Button } from "../ui/Button";
import { VALIDATION, ERROR_MESSAGES } from "@/lib/constants";

interface PasswordFormProps {
    passwordForm: { currentPassword: string; newPassword: string };
    onPasswordChange: (field: "currentPassword" | "newPassword", value: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isLoading: boolean;
}

/**
 * Password change form component.
 * Handles validation and user input for updating account credentials.
 * @param props - Form data and event handlers.
 */
export const PasswordForm: React.FC<PasswordFormProps> = ({ passwordForm, onPasswordChange, onSave, onCancel, isLoading }) => {
    const isFormValid = passwordForm.currentPassword.trim() && 
                        passwordForm.newPassword.trim() && 
                        passwordForm.newPassword.length >= VALIDATION.PASSWORD_MIN_LENGTH;

    const getErrorMessage = () => {
        if (!passwordForm.currentPassword.trim() || !passwordForm.newPassword.trim()) {
            return ERROR_MESSAGES.REQUIRED_FIELD;
        }
        if (passwordForm.newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
        }
        return null;
    };

    const errorMessage = getErrorMessage();

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
                {errorMessage && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            borderRadius: "6px",
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fca5a5",
                            fontSize: "0.9em",
                        }}
                    >
                        {errorMessage}
                    </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                    <label htmlFor="currentPassword" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                        Huidig Wachtwoord
                    </label>
                    <input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => onPasswordChange("currentPassword", e.target.value)}
                        className="input-field"
                        placeholder="Voer je huidige wachtwoord in"
                        style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label htmlFor="newPassword" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                        Nieuw Wachtwoord (min. {VALIDATION.PASSWORD_MIN_LENGTH} tekens)
                    </label>
                    <input 
                        id="newPassword" 
                        type="password" 
                        value={passwordForm.newPassword} 
                        onChange={(e) => onPasswordChange("newPassword", e.target.value)} 
                        className="input-field" 
                        placeholder="Voer je nieuwe wachtwoord in" 
                    />
                </div>

                <div className="form-actions">
                    <Button onClick={onSave} variant="primary" disabled={isLoading || !isFormValid}>
                        {isLoading ? "Opslaan..." : "Wachtwoord wijzigen"}
                    </Button>
                    <Button onClick={onCancel} variant="secondary">
                        Annuleren
                    </Button>
                </div>
            </div>
        </div>
    );
};