"use client";

import Navigation from "./Navigation";
import { usePathname } from "next/navigation";

/**
 * Navigation wrapper component that conditionally shows/hides navigation based on the current route.
 * Hides the navigation bar on authentication-related pages to provide a distraction-free environment.
 * @returns {JSX.Element|null} The Navigation component or null if the current route is an auth page.
 */
export default function NavigationWrapper() {
	const pathname = usePathname();

	// Hide navigation on authentication pages
	const isAuthPage = pathname === "/account/login" || pathname.startsWith("/account/login");

	if (isAuthPage) {
		return null;
	}

	return <Navigation />;
}
