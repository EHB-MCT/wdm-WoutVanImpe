"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "@/styles/components/Navigation.module.css";
import { NAVIGATION } from "@/lib/constants";

export interface NavLinkProps {
	href: string;
	label: string;
	icon?: React.ReactNode;
	isActive?: boolean;
	onCloseMobile?: () => void;
}

export interface NavigationProps {
	showBrand?: boolean;
	brandText?: string;
	className?: string;
}

/**
 * Navigation link component.
 * Handles active state detection for exact matches and sub-routes (e.g. Dashboard).
 */
export function NavLink({ href, label, icon, isActive, onCloseMobile }: Readonly<NavLinkProps>) {
	const pathname = usePathname();

	const isCurrentPage = isActive ?? pathname === href;

	// specific check to keep parent link active when viewing sub-routes
	const isDashboardRoute = pathname.startsWith("/dashboard") && href === "/dashboard";
	const isAccountRoute = pathname.startsWith("/account") && href === "/account";

	const finalActive = isCurrentPage || isDashboardRoute || isAccountRoute;

	const handleClick = () => {
		if (onCloseMobile) {
			onCloseMobile();
		}
	};

	return (
		<li className={styles.navItem}>
			<Link href={href} className={`${styles.navLink} ${finalActive ? styles.navLinkActive : ""}`} aria-current={finalActive ? "page" : undefined} onClick={handleClick}>
				{icon && <span className={styles.navIcon}>{icon}</span>}
				<span className={styles.navLabel}>{label}</span>
			</Link>
		</li>
	);
}

/**
 * Main application navigation bar.
 * Includes responsive mobile menu handling.
 */
export function Navigation({ showBrand = true, brandText = "FinanceTracker", className = "" }: Readonly<NavigationProps>) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isMobileMenuOpen) {
				closeMobileMenu();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isMobileMenuOpen]);

	return (
		<nav className={`${styles.navigation} ${className}`}>
			<div className={styles.navContainer}>
				{showBrand && (
					<Link href="/" className={styles.navBrand}>
						<span className={styles.navBrandIcon}>{NAVIGATION.BRAND.ICON}</span>
						<span>{brandText}</span>
					</Link>
				)}

				<ul className={styles.navMenu}>
					{NAVIGATION.MAIN_LINKS.map((link) => (
						<NavLink
							key={link.href}
							// Dynamically construct dashboard link to always point to current month
							href={link.href === "/dashboard" ? `/dashboard/${new Date().getFullYear()}/${new Date().getMonth() + 1}/all` : link.href}
							label={link.label}
							icon={link.icon}
						/>
					))}
				</ul>

				<button className={styles.navMobileToggle} onClick={toggleMobileMenu} aria-label="Toggle navigation menu" aria-expanded={isMobileMenuOpen}>
					{isMobileMenuOpen ? NAVIGATION.MOBILE.TOGGLE_CLOSE : NAVIGATION.MOBILE.TOGGLE_OPEN}
				</button>

				{isMobileMenuOpen && (
					<>
						<button className={styles.navMobileBackdrop} onClick={closeMobileMenu} aria-label="Close mobile menu" type="button" />

						<div className={`${styles.navMobileMenu} ${styles.isOpen}`}>
							<ul className={styles.navMenu}>
								{NAVIGATION.MAIN_LINKS.map((link) => (
									<NavLink key={link.href} href={link.href === "/dashboard" ? `/dashboard/${new Date().getFullYear()}/${new Date().getMonth() + 1}/all` : link.href} label={link.label} icon={link.icon} onCloseMobile={closeMobileMenu} />
								))}
							</ul>
						</div>
					</>
				)}
			</div>
		</nav>
	);
}

export default Navigation;
