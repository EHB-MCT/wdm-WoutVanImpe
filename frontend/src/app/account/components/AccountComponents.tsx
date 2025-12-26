import React from 'react';
import componentStyles from '../components/components.module.css';

interface TabButtonProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
	<button
		onClick={onClick}
		className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
		style={{
			borderRadius: '0',
			border: 'none',
			marginRight: '2px',
			backgroundColor: active ? '#3b82f6' : 'transparent',
			color: active ? 'white' : '#6b7280'
		}}
	>
		{children}
	</button>
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