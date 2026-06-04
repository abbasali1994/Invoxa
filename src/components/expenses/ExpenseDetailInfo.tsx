import React from "react";
import { format } from "date-fns";

export function ExpenseDetailInfo({ expense }: { expense: any }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
      <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Expense Details</h3>
      <div className="grid grid-cols-2 gap-y-4 gap-x-8">
        <div><p className="text-sm text-neutral-500">Date</p><p className="font-medium text-neutral-200">{format(new Date(expense.date), 'MMM d, yyyy')}</p></div>
        <div><p className="text-sm text-neutral-500">Category</p><p className="font-medium text-neutral-200">{expense.category}</p></div>
        <div><p className="text-sm text-neutral-500">Currency</p><p className="font-medium text-neutral-200">{expense.currency}</p></div>
        <div><p className="text-sm text-neutral-500">Account</p><p className="font-medium text-neutral-200">{expense.account?.name || 'Unlinked'}</p></div>
        {expense.project && <div><p className="text-sm text-neutral-500">Project</p><p className="font-medium text-neutral-200">{expense.project.name}</p></div>}
        <div><p className="text-sm text-neutral-500">Payment Method</p><p className="font-medium text-neutral-200">{expense.paymentMethod || 'N/A'}</p></div>
      </div>
      
      {expense.notes && (
        <div className="pt-4 mt-4 border-t border-neutral-800">
          <p className="text-sm text-neutral-500 mb-1">Notes</p>
          <p className="text-sm text-neutral-300 whitespace-pre-wrap">{expense.notes}</p>
        </div>
      )}
    </div>
  );
}
