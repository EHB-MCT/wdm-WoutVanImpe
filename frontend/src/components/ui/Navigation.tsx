"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Navigation.module.css";

export interface NavLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface NavigationProps {
  showBrand?: boolean;
  brandText?: string;
  className?: string;
}

export function NavLink({ href, label, icon, isActive, onCloseMobile }: Readonly<NavLinkProps & { onCloseMobile?: () => void }>) {
  const pathname = usePathname();
  
  // Determine if link is active
  const isCurrentPage = isActive ?? pathname === href;
  
  // Handle special case for dashboard dynamic routes
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
      <Link
        href={href}
        className={`${styles.navLink} ${finalActive ? styles.navLinkActive : ""}`}
        aria-current={finalActive ? "page" : undefined}
        onClick={handleClick}
      >
        {icon && <span className={styles.navIcon}>{icon}</span>}
        <span className={styles.navLabel}>{label}</span>
      </Link>
    </li>
  );
}

export function Navigation({ 
  showBrand = true, 
  brandText = "FinanceTracker", 
  className = "" 
}: Readonly<NavigationProps>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <nav className={`${styles.navigation} ${className}`}>
      <div className={styles.navContainer}>
        {/* Brand/Logo */}
        {showBrand && (
          <Link href="/" className={styles.navBrand}>
            <span className={styles.navBrandIcon}>💰</span>
            <span>{brandText}</span>
          </Link>
        )}

        {/* Desktop Navigation */}
        <ul className={styles.navMenu}>
          <NavLink href="/" label="Home" icon="🏠" />
          <NavLink href="/upload" label="Upload" icon="📤" />
          <NavLink href="/dashboard" label="Dashboard" icon="📊" />
          <NavLink href="/account" label="Account" icon="👤" />
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.navMobileToggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <button 
              className={styles.navMobileBackdrop}
              onClick={closeMobileMenu}
              aria-label="Close mobile menu"
              type="button"
            />
            <div className={`${styles.navMobileMenu} ${styles.isOpen}`}>
              <ul className={styles.navMenu}>
                <NavLink href="/" label="Home" icon="🏠" onCloseMobile={closeMobileMenu} />
                <NavLink href="/upload" label="Upload" icon="📤" onCloseMobile={closeMobileMenu} />
                <NavLink href="/dashboard" label="Dashboard" icon="📊" onCloseMobile={closeMobileMenu} />
                <NavLink href="/account" label="Account" icon="👤" onCloseMobile={closeMobileMenu} />
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navigation;