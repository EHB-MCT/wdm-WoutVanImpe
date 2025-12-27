'use client';

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import styles from "@/styles/pages/Dashboard.module.css";

export function GuestWelcome() {
  return (
    <>
      <h1 className={styles.pageTitle}>Welkom, Gast!</h1>
      <div className={`card ${styles.guestCard}`}>
        <p className={`label-text ${styles.guestDescription}`}>
          Je bent nog niet ingelogd.
        </p>
        <Link href="/account/login">
          <Button variant="primary" className={styles.guestButton}>
            Naar Login
          </Button>
        </Link>
      </div>
    </>
  );
}