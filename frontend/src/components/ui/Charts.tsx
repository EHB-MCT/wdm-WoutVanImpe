/**
 * Reusable chart components for financial data visualization
 * Extracted from dashboard to reduce code duplication
 */

"use client";

import React from "react";
import { Cell, ResponsiveContainer, Tooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CATEGORY_COLORS } from "../../lib/constants";
import { formatCurrency } from "../../lib/receiptUtils";

interface DailySpendingData {
  day: number;
  amount: number;
}

interface CategorySpendingData {
  name: string;
  value: number;
}

interface SpendingTrendChartProps {
  data: DailySpendingData[];
  height?: number;
  className?: string;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({ 
  data, 
  height = 300, 
  className 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`chart-container ${className || ''}`} style={{ height }}>
        <p style={{ textAlign: "center", color: "var(--muted-color)" }}>
          Geen gegevens beschikbaar
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="day" 
          label={{ value: "Dag", position: "insideBottom", offset: -5 }} 
        />
        <YAxis 
          label={{ value: "Bedrag (€)", angle: -90, position: "insideLeft" }} 
        />
        <Tooltip 
          formatter={(value: number | undefined) => formatCurrency(value || 0)}
        />
        <Line 
          type="monotone" 
          dataKey="amount" 
          stroke="#E63946" 
          strokeWidth={2} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

interface CategoryChartProps {
  data: CategorySpendingData[];
  height?: number;
  className?: string;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ 
  data, 
  height = 300, 
  className 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`chart-container ${className || ''}`} style={{ height }}>
        <p style={{ textAlign: "center", color: "var(--muted-color)" }}>
          Geen categoriegegevens beschikbaar
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number | undefined) => formatCurrency(value || 0)}
        />
        <Bar dataKey="value" fill="#2A9D8F">
          {data.map((entry, index) => (
            <Cell 
              key={`${entry.name}-${entry.value}`} 
              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};