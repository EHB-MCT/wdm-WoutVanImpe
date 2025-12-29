"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { removeExpiredTokens, isUserAuthenticated } from "@/lib/auth";
import { ERROR_MESSAGES } from "@/lib/constants";

/**
 * Interface defining the properties for the AuthGuard component.
 */
interface AuthGuardProps {
	/** The child components to render within the guard. */
	children: React.ReactNode;
	/** Optional flag to enforce authentication. Defaults to true. */
	requireAuth?: boolean;
}

/**
 * Authentication guard wrapper component.
 * Protects routes by checking for valid user tokens on mount.
 * Redirects unauthenticated users to the login page if authentication is required.
 * @param {AuthGuardProps} props - The component props containing children and auth requirements.
 * @returns {JSX.Element} The wrapped content or a redirect message.
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
