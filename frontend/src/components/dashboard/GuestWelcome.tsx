'use client';

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";
import styles from "../../styles/pages/Dashboard.module.css";

export function GuestWelcome() {
  return (
    <>
      <h1 className={styles.pageTitle}>Welkom, Gast!</h1>
      <div className="card" style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
        <p className="label-text" style={{ marginBottom: "20px" }}>
          Je bent nog niet ingelogd.
        </p>
        <Link href="/account">
          <Button variant="primary" style={{ width: "100%" }}>
            Naar Login
          </Button>
        </Link>
      </div>
    </>
  );
}