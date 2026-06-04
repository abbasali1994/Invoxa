import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color?: string; // used for title text color if needed, or subtitle
  subtitleColor?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color, subtitleColor = 'text-neutral-500' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <div className="flex flex-row items-center justify-between pb-2">
        <h3 className={`text-sm font-medium ${color || 'text-neutral-400'}`}>{title}</h3>
        {icon && <div className="text-neutral-400">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold ${trend === 'down' ? 'text-rose-400' : ''}`}>{value}</div>
      {subtitle && (
        <p className={`text-xs mt-1 ${subtitleColor}`}>{subtitle}</p>
      )}
    </div>
  );
}
