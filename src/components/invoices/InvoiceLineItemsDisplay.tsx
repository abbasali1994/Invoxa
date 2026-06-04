import React from 'react';

export function InvoiceLineItemsDisplay({ invoice }: { invoice: any }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
      <h3 className="text-lg font-medium border-b border-neutral-800 pb-4 mb-4">Line Items</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 font-medium text-right">Qty</th>
            <th className="py-2 font-medium text-right">Rate</th>
            <th className="py-2 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800 text-neutral-300">
          {invoice.lineItems.map((item: any, i: number) => (
            <tr key={i}>
              <td className="py-4">{item.description}</td>
              <td className="py-4 text-right">{item.quantity}</td>
              <td className="py-4 text-right">${item.rate}</td>
              <td className="py-4 text-right font-medium">${item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 border-t border-neutral-800 pt-4 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between font-bold text-xl">
            <span>Total {invoice.currency}</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
