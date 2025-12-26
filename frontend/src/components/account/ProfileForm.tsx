/**
 * Profile form component for account management
 * Handles user profile editing with validation
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";

interface ProfileFormProps {
  profileForm: { username: string; email: string };
  onProfileChange: (field: 'username' | 'email', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  hasChanges: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profileForm,
  onProfileChange,
  onSave,
  onCancel,
  isLoading,
  hasChanges
}) => {
  const isFormValid = profileForm.username.trim() && 
                   profileForm.email.trim() && 
                   profileForm.email.includes('@');

  const getButtonDisabledState = () => {
    return !hasChanges || isLoading || !isFormValid;
  };

  const getButtonOpacity = () => {
    return getButtonDisabledState() ? 0.6 : 1;
  };

  const getButtonCursor = () => {
    return getButtonDisabledState() ? 'not-allowed' : 'pointer';
  };

  return (
    <div>
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#f8fafc", 
        borderRadius: "8px", 
        border: "1px solid #e2e8f0" 
      }}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="username" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Gebruikersnaam
          </label>
          <input
            id="username"
            type="text"
            value={profileForm.username}
            onChange={(e) => onProfileChange('username', e.target.value)}
            className="form-control"
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #d1d5db", 
              borderRadius: "4px",
              fontSize: "1em"
            }}
          />
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profileForm.email}
            onChange={(e) => onProfileChange('email', e.target.value)}
            className="form-control"
            style={{ 
              width: "100%", 
              padding: "10px", 
              border: "1px solid #d1d5db", 
              borderRadius: "4px",
              fontSize: "1em"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button 
            onClick={onSave}
            variant="primary"
            disabled={getButtonDisabledState()}
            style={{ 
              opacity: getButtonOpacity(),
              cursor: getButtonCursor()
            }}
          >
            {isLoading ? "Opslaan..." : "Opslaan"}
          </Button>
          <Button 
            onClick={onCancel}
            variant="secondary"
          >
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
};