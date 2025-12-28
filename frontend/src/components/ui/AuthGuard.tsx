"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeExpiredTokens, isUserAuthenticated } from "@/lib/auth";
import { ERROR_MESSAGES } from "@/lib/constants";

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

/**
 * Authentication guard wrapper.
 * Checks for valid tokens on mount and redirects to login if necessary.
 */
export function AuthGuard({ children, requireAuth = true }: Readonly<AuthGuardProps>) {
	const router = useRouter();
	const [isClient, setIsClient] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		setIsClient(true);
		removeExpiredTokens();

		const authenticated = isUserAuthenticated();
		setIsAuthenticated(authenticated);

		if (requireAuth && !authenticated) {
			console.log(ERROR_MESSAGES.NOT_AUTHENTICATED);
			router.push("/account");
		}
	}, [router, requireAuth]);

	// Render children initially to avoid hydration mismatch between server/client
	if (!isClient) {
		return <>{children}</>;
	}

	if (requireAuth && !isAuthenticated) {
		return <div className="auth-redirect">Redirecting to login...</div>;
	}

	return <>{children}</>;
}
