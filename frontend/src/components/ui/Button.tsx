"use client";

import React from "react";
import styles from "@/styles/components/Button.module.css";

interface ButtonProps {
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	variant?: "primary" | "secondary" | "danger";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

export function Button({ children, onClick, type = "button", variant = "primary", size = "md", disabled = false, className = "", style = {}, onKeyDown }: Readonly<ButtonProps>) {
	const buttonClass = [styles.button, styles[variant], styles[size], disabled ? styles.disabled : "", className].filter(Boolean).join(" ");

	return (
		<button type={type} className={buttonClass} onClick={onClick} disabled={disabled} style={style} onKeyDown={onKeyDown}>
			{children}
		</button>
	);
}
