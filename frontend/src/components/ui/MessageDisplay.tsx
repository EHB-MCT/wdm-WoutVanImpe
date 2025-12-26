/**
 * Message display component for success/error messages
 * Auto-dismisses after configured time
 */

"use client";

import React, { useEffect } from "react";
import { VALIDATION } from "../../lib/constants";

interface MessageDisplayProps {
  message: { type: "success" | "error"; text: string } | null;
  onClose?: () => void;
  autoDismiss?: boolean;
}

export const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  message, 
  onClose, 
  autoDismiss = true 
}) => {
  useEffect(() => {
    if (message && autoDismiss && !onClose) {
      const timer = setTimeout(() => {
        // Component will handle auto-dismiss internally
      }, VALIDATION.AUTO_DISMISS_MESSAGE_MS);
      return () => clearTimeout(timer);
    }
  }, [message, autoDismiss, onClose]);

  if (!message) return null;

  const backgroundColor = message.type === "success" ? "#d1fae5" : "#fee2e2";
  const color = message.type === "success" ? "#065f46" : "#991b1b";
  const borderColor = message.type === "success" ? "#6ee7b7" : "#fca5a5";

  return (
    <div 
      style={{ 
        marginBottom: "20px", 
        padding: "12px", 
        borderRadius: "6px",
        backgroundColor,
        color,
        border: `1px solid ${borderColor}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <span>{message.text}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            color,
            padding: "0",
            marginLeft: "10px"
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};