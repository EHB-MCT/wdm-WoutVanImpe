/**
 * Account menu component
 * Displays navigation options for account management
 */

"use client";

import React from "react";
import { Button } from "../ui/Button";

interface AccountMenuProps {
	onProfileClick: () => void;
	onPasswordClick: () => void;
	onLogout: () => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ onProfileClick, onPasswordClick, onLogout }) => {
	return (
		<div>
			<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
				<Button
					onClick={onProfileClick}
					variant="primary"
					style={{
						padding: "16px 24px",
						fontSize: "1em",
						justifyContent: "flex-start",
						textAlign: "left",
					}}
				>
					👤 Profiel bekijken
				</Button>

				<Button
					onClick={onPasswordClick}
					variant="primary"
					style={{
						padding: "16px 24px",
						fontSize: "1em",
						justifyContent: "flex-start",
						textAlign: "left",
					}}
				>
					🔐 Wachtwoord wijzigen
				</Button>

				<Button
					onClick={onLogout}
					variant="primary"
					style={{
						padding: "16px 24px",
						fontSize: "1em",
						justifyContent: "flex-start",
						textAlign: "left",
					}}
				>
					🚪 Uitloggen
				</Button>
			</div>
		</div>
	);
};
