import React from "react";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export function ExpenseLineItemsDisplay({ expense }: { expense: any }) {
  const lineItems = Array.isArray(expense.lineItems) ? expense.lineItems : [];
  
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
          <tr>
            <th className="px-5 py-3 font-medium">Description</th>
            <th className="px-5 py-3 font-medium text-right">Qty</th>
            <th className="px-5 py-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800">
          {lineItems.map((item: any, i: number) => {
            if (item.isSection) {
              return <tr key={i} className="bg-neutral-800/30"><td colSpan={4} className="px-5 py-2 font-medium text-indigo-400">{item.description}</td></tr>;
            }
            return (
              <tr key={i}>
                <td className="px-5 py-4 text-neutral-300">{item.description}</td>
                <td className="px-5 py-4 text-right text-neutral-400">{item.hours || item.qty || 0}</td>
                <td className="px-5 py-4 text-right font-medium text-white"><CurrencyDisplay amount={item.amount} currency={expense.currency} size="sm" /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="p-5 border-t border-neutral-800 bg-neutral-950/30 flex flex-col items-end space-y-2 text-sm">
        <div className="flex justify-between w-48 text-neutral-400"><span>Subtotal:</span><CurrencyDisplay amount={expense.subtotal} currency={expense.currency} size="sm" /></div>
        <div className="flex justify-between w-48 text-lg font-bold text-white pt-2 border-t border-neutral-800"><span>Total:</span><CurrencyDisplay amount={expense.total || expense.amount} currency={expense.currency} size="lg" /></div>
      </div>
    </div>
  );
}
