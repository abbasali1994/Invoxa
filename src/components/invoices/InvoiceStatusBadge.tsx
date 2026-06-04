import React from 'react';

export function InvoiceStatusBadge({ status }: { status: string }) {
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400';
      case 'DRAFT': return 'bg-neutral-500/10 text-neutral-400';
      case 'SENT': return 'bg-blue-500/10 text-blue-400';
      case 'OVERDUE': return 'bg-rose-500/10 text-rose-400';
      default: return 'bg-neutral-500/10 text-neutral-400';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}
