import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
      {icon && <div className="mb-4 text-neutral-500">{icon}</div>}
      <h3 className="text-lg font-medium text-neutral-200">{title}</h3>
      {description && <p className="mt-2 text-sm text-neutral-400 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
