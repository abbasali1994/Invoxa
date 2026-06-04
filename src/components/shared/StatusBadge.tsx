import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export function StatusBadge({ status, variant = 'default', className = '' }: StatusBadgeProps) {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize";
  
  const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    default: "bg-neutral-800 text-neutral-300 border border-neutral-700"
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {status}
    </span>
  );
}
