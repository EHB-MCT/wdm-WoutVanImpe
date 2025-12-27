/**
 * Message display component for success/error messages
 * Auto-dismisses after configured time
 */

"use client";

import React, { useEffect } from "react";
import { VALIDATION } from "@/lib/constants";

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

  return (
    <div className={`message-container ${message.type}`}>
      <span>{message.text}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="message-close"
        >
          ×
        </button>
      )}
    </div>
  );
};