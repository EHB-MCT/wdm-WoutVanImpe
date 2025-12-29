"use client";

import React, { useEffect } from "react";
import { VALIDATION } from "@/lib/constants";

/**
 * Interface defining the properties for the MessageDisplay component.
 */
interface MessageDisplayProps {
	/** The message object containing the type (success/error) and the text content. Null if no message. */
	message: { type: "success" | "error"; text: string } | null;
	/** Optional callback function to handle manual closing of the message. */
	onClose?: () => void;
	/** Whether the message should automatically disappear after a timeout. Defaults to true. */
	autoDismiss?: boolean;
}

/**
 * Displays temporary success or error feedback messages.
 * Can be dismissed manually or automatically based on configuration.
 * @param {MessageDisplayProps} props - The component props containing the message configuration.
 * @returns {JSX.Element|null} The rendered message banner or null if no message exists.
 */
export const MessageDisplay: React.FC<MessageDisplayProps> = ({ message, onClose, autoDismiss = true }) => {
	useEffect(() => {
		if (message && autoDismiss && !onClose) {
			const timer = setTimeout(() => {
				// Logic relies on parent component clearing the message state
			}, VALIDATION.AUTO_DISMISS_MESSAGE_MS);
			return () => clearTimeout(timer);
		}
	}, [message, autoDismiss, onClose]);

	if (!message) return null;

	return (
		<div className={`message-container ${message.type}`}>
			<span>{message.text}</span>
			{onClose && (
				<button onClick={onClose} className="message-close">
					×
				</button>
			)}
		</div>
	);
};
