import React from "react";
import { format } from "date-fns";

export function ClientStatCards({ client }: { client: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
        <p className="text-sm font-medium text-neutral-400 mb-1">Total Revenue</p>
        <p className="text-2xl font-bold text-white">${client.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
        <p className="text-sm font-medium text-neutral-400 mb-1">Total Invoices</p>
        <p className="text-2xl font-bold text-white">{client.totalInvoices || 0}</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
        <p className="text-sm font-medium text-neutral-400 mb-1">Outstanding</p>
        <p className="text-2xl font-bold text-amber-400">${client.outstandingAmount?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</p>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
        <p className="text-sm font-medium text-neutral-400 mb-1">Last Invoice Date</p>
        <p className="text-2xl font-bold text-white">{client.lastInvoiceDate ? format(new Date(client.lastInvoiceDate), 'MMM d, yyyy') : 'Never'}</p>
      </div>
    </div>
  );
}
