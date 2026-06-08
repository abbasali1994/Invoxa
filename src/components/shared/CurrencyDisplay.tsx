import React from 'react';

export interface CurrencyDisplayProps {
  amount: number | null | undefined;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function CurrencyDisplay({ amount, currency = 'USD', size = 'md', className = '' }: CurrencyDisplayProps) {
  const safeAmount = amount || 0;
  const isUSD = currency === 'USD';
  
  const isINR = currency === 'INR';
  const formatted = isUSD
    ? `$${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : isINR
      ? `₹${safeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${currency} ${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl font-bold'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {formatted}
    </span>
  );
}
