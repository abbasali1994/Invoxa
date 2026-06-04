import React from 'react';
import { formatDateDDMMYYYY } from "@/lib/date-format";

export function InvoiceStatusCard({ invoice }: { invoice: any }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Status</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Current Status</span>
          <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-medium">
            {invoice.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Due Date</span>
          <span className="text-sm font-medium">{invoice.dueDate ? formatDateDDMMYYYY(invoice.dueDate) : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
