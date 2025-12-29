"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import styles from "@/styles/pages/Dashboard.module.css";

interface CTASectionProps {
    currentDate: Date;
}

/**
 * Call-to-action section.
 * Provides navigation to Receipt Upload and the main Dashboard view.
 * @param props.currentDate - Used to construct the link to the current month's dashboard.
 */
export function CTASection({ currentDate }: Readonly<CTASectionProps>) {
    return (
        <div className={styles.ctaSection}>
            <div className={`card ${styles.ctaCard}`}>
                <h2 className={styles.ctaTitle}>Upload een nieuw ticket</h2>
                <p className={styles.ctaDescription}>
                    Voeg je recente aankopen toe om je financiële overzicht up-to-date te houden
                </p>
                
                <div className={styles.ctaButtonContainer}>
                    <Link href="/upload" className={styles.ctaLink}>
                        <Button variant="primary" className={styles.ctaButton}>
                            Upload Ticket
                        </Button>
                    </Link>
                    
                    <Link href={`/dashboard/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/all`} className={styles.ctaLink}>
                        <Button variant="secondary" className={styles.ctaButton}>
                            Bekijk Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}