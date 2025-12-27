"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeExpiredTokens, isUserAuthenticated } from "@/lib/auth";

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: Readonly<AuthGuardProps>) {
	const router = useRouter();
	const [isClient, setIsClient] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// Wait for client-side hydration
	useEffect(() => {
		setIsClient(true);
		
		// Clean up expired tokens first
		removeExpiredTokens();
		
		const authenticated = isUserAuthenticated();
		setIsAuthenticated(authenticated);

		if (requireAuth && !authenticated) {
			console.log("User not authenticated, redirecting to login page");
			router.push("/account");
		}
	}, [router, requireAuth]);

	// Always render children on server to avoid hydration mismatch
	if (!isClient) {
		return <>{children}</>;
	}

	if (requireAuth && !isAuthenticated) {
		return <div className="auth-redirect">Redirecting to login...</div>;
	}

	return <>{children}</>;
}
