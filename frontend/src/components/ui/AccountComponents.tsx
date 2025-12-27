import React from 'react';
import { Button } from './Button';
import componentStyles from '@/styles/components/Account.module.css';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <Button
    onClick={onClick}
    variant={active ? 'primary' : 'secondary'}
    className={`tab-button ${active ? 'active' : 'inactive'}`}
  >
    {children}
  </Button>
);

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className={componentStyles.infoRow}>
    <span className={componentStyles.infoLabel}>{label}</span>
    <span className={componentStyles.infoValue}>{value}</span>
  </div>
);