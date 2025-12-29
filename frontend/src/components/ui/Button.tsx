"use client";

import React from "react";
import styles from "@/styles/components/Button.module.css";

/**
 * Interface defining the properties for the Button component.
 */
interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	variant?: "primary" | "secondary" | "danger" | "link";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

/**
 * Reusable button component with multiple visual variants and sizes.
 * Combines standard HTML button attributes with custom styling logic.
 * @param {ButtonProps} props - The component props containing children, styles, and event handlers.
 * @returns {JSX.Element} The rendered button element.
 */
export function Button({ children, onClick, type = "button", variant = "primary", size = "md", disabled = false, className = "", style = {}, onKeyDown }: Readonly<ButtonProps>) {
	const buttonClass = [styles.button, styles[variant], styles[size], disabled ? styles.disabled : "", className].filter(Boolean).join(" ");

	return (
		<button type={type} className={buttonClass} onClick={onClick} disabled={disabled} style={style} onKeyDown={onKeyDown}>
			{children}
		</button>
	);
}
