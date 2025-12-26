'use client';

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import styles from "../../styles/pages/Dashboard.module.css";

interface CTASectionProps {
  currentDate: Date;
}

export function CTASection({ currentDate }: Readonly<CTASectionProps>) {
  return (
    <div className={styles.ctaSection}>
      <div className="card" style={{ textAlign: "center" }}>
        <h2 className={styles.ctaTitle}>Upload een nieuw ticket</h2>
        <p className={styles.ctaDescription}>Voeg je recente aankopen toe om je financiële overzicht up-to-date te houden</p>
        <div className={styles.ctaButtonContainer}>
          <Link href="/upload" style={{ flex: 1 }}>
            <Button variant="primary" style={{ width: "100%" }}>
              Upload Ticket
            </Button>
          </Link>
          <Link href={`/dashboard/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/all`} style={{ flex: 1 }}>
            <Button variant="secondary" style={{ width: "100%" }}>
              Bekijk Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}