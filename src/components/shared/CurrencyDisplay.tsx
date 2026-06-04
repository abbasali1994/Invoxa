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
  
  const formatted = isUSD 
    ? `$${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `${currency === 'INR' ? '₹' : currency + ' '}${safeAmount.toLocaleString()}`;

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
