import React from "react";

export function SettlementInvoiceDetails({ invoice }: { invoice: any }) {
  if (!invoice) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Invoice Number</label>
        <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.invoiceNumber} />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Client Name</label>
        <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.client?.name} />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Invoice Amount</label>
        <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={`$${invoice.total}`} />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">Invoice Currency</label>
        <input className="w-full bg-neutral-950 border border-neutral-800 rounded p-2 text-neutral-500 cursor-not-allowed" readOnly value={invoice.currency} />
      </div>
    </div>
  );
}
