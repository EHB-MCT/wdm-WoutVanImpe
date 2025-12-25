"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeExpiredTokens, isUserAuthenticated } from "../utils/auth";

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
	const router = useRouter();

	useEffect(() => {
		// Clean up expired tokens first
		removeExpiredTokens();

		if (requireAuth && !isUserAuthenticated()) {
			console.log("User not authenticated, redirecting to login page");
			router.push("/account");
		}
	}, [router, requireAuth]);

	if (requireAuth && !isUserAuthenticated()) {
		return (
			<div style={{ 
				display: "flex", 
				justifyContent: "center", 
				alignItems: "center", 
				height: "100vh",
				fontSize: "18px",
				color: "#666"
			}}>
				Redirecting to login...
			</div>
		);
	}

	return <>{children}</>;
}