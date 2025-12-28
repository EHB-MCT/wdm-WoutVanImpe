"use client";

import React from "react";
import { Button } from "../ui/Button";

interface AccountMenuProps {
    onProfileClick: () => void;
    onPasswordClick: () => void;
    onLogout: () => void;
}

/**
 * Account menu component.
 * Displays navigation buttons for profile management and logout.
 * @param props - Component props with click handlers.
 */
export const AccountMenu: React.FC<AccountMenuProps> = ({ onProfileClick, onPasswordClick, onLogout }) => {
    const buttonStyle: React.CSSProperties = {
        padding: "16px 24px",
        fontSize: "1em",
        justifyContent: "flex-start",
        textAlign: "left",
    };

    return (
        <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Button
                    onClick={onProfileClick}
                    variant="primary"
                    style={buttonStyle}
                >
                    👤 Profiel bekijken
                </Button>

                <Button
                    onClick={onPasswordClick}
                    variant="primary"
                    style={buttonStyle}
                >
                    🔐 Wachtwoord wijzigen
                </Button>
                
                <Button
                    onClick={onLogout}
                    variant="primary"
                    style={buttonStyle}
                >
                    🚪 Uitloggen
                </Button>
            </div>
        </div>
    );
};