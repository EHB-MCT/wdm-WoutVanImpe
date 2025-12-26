/**
 * Dashboard header component with navigation and controls
 * Extracted from main dashboard page for reusability
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";

interface DashboardHeaderProps {
  currentDate: Date;
  currentCategory: string;
  validCategories: readonly string[];
  canGoNext: boolean;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onCurrentDate: () => void;
  onResetCategories: () => void;
  onCategoryChange: (category: string) => void;
  formatMonthYear: (date: Date) => string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentDate,
  currentCategory,
  validCategories,
  canGoNext,
  onPreviousMonth,
  onNextMonth,
  onCurrentDate,
  onResetCategories,
  onCategoryChange,
  formatMonthYear
}) => {
  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Button variant="secondary">
            ← Terug naar homepage
          </Button>
        </Link>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>
          Dashboard: {formatMonthYear(currentDate)}
        </h1>
        {currentCategory !== "all" && (
          <p style={{ margin: 0, color: "var(--muted-color)" }}>
            Categorie: {currentCategory}
          </p>
        )}
      </div>

      {/* Controls */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button 
            onClick={onPreviousMonth} 
            aria-label="Vorige maand"
            variant="secondary"
          >
            ←
          </Button>
          <span style={{ 
            fontWeight: "bold", 
            minWidth: "150px", 
            textAlign: "center" 
          }}>
            {formatMonthYear(currentDate)}
          </span>
          <Button 
            onClick={onNextMonth} 
            disabled={!canGoNext} 
            aria-label="Volgende maand"
            variant="secondary"
            style={{ 
              opacity: canGoNext ? 1 : 0.3, 
              cursor: canGoNext ? "pointer" : "not-allowed" 
            }}
          >
            →
          </Button>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select 
            value={currentCategory} 
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.9em"
            }}
          >
            <option value="all">Alle categorieën</option>
            {validCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <Button 
            onClick={onCurrentDate}
            variant="secondary"
          >
            Huidige maand
          </Button>
          <Button 
            onClick={onResetCategories}
            variant="secondary"
          >
            Reset filters
          </Button>
        </div>
      </div>
    </>
  );
};