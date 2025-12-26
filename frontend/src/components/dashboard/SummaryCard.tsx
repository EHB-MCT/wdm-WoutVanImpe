/**
 * SummaryCard component for dashboard
 * Displays summary statistics in card format
 */

"use client";

import React from "react";
import { formatCurrency } from "@/lib/receiptUtils";

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  amount, 
  subtitle,
  className 
}) => {
  return (
    <div 
      className={`card ${className || ''}`}
      style={{ 
        padding: "20px", 
        textAlign: "center",
        borderRadius: "8px",
        border: "1px solid #e5e7eb"
      }}
    >
      <h3 style={{ 
        margin: "0 0 12px 0", 
        fontSize: "1rem",
        color: "var(--muted-color)",
        fontWeight: "normal"
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: "0 0 8px 0", 
        fontSize: "1.8rem",
        fontWeight: "bold",
        color: "var(--primary-color)"
      }}>
        {formatCurrency(amount)}
      </p>
      {subtitle && (
        <p style={{ 
          margin: 0, 
          fontSize: "0.9rem",
          color: "var(--muted-color)"
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};