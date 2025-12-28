"use client";

import Navigation from "./Navigation";
import { usePathname } from "next/navigation";

/**
 * Navigation wrapper component that conditionally shows/hides navigation based on current route.
 * Hides navigation on authentication pages for a cleaner login experience.
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