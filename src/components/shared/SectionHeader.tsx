import React from 'react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
